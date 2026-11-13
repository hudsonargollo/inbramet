import { NextResponse } from "next/server";
import { dbConfigured, prisma } from "@/lib/prisma";
import { dbErrorKind } from "@/lib/db-errors";
import { vercelBlobConfigured } from "@/lib/uploads";

// Deployment self-check: open /api/health on the live site to see what's
// missing. Never returns secrets — only yes/no flags, the DB *host name* and
// short hints.
export const dynamic = "force-dynamic";

const REQUIRED_TABLES = ["Category", "Product", "Order", "OrderItem", "User", "Customer", "Setting"];

function dbUrlInfo() {
  const raw = process.env.DATABASE_URL || "";
  try {
    const u = new URL(raw);
    return {
      set: true,
      host: u.hostname,
      isLocalhost: ["localhost", "127.0.0.1", "::1"].includes(u.hostname),
      pooled: u.hostname.includes("-pooler"),
      pgbouncerParam: u.searchParams.get("pgbouncer") === "true",
      sslmode: u.searchParams.get("sslmode") || null,
      channelBinding: u.searchParams.has("channel_binding"),
    };
  } catch {
    return { set: Boolean(raw), host: null, isLocalhost: false, pooled: false, pgbouncerParam: false, sslmode: null, channelBinding: false };
  }
}

const HINTS: Record<string, string> = {
  unavailable: "Não foi possível conectar — verifique DATABASE_URL.",
  "not-migrated": "Conectado, mas as tabelas estão ausentes — execute `npx prisma migrate deploy`.",
  "in-use": "Um registro ainda é referenciado por outro (chave estrangeira).",
  engine: "Prisma engine ausente — refaça o deploy sem cache de build.",
  unknown: "Erro inesperado no banco de dados — confira os logs de [health].",
};

export async function GET() {
  const url = dbUrlInfo();
  const managedHost = Boolean(process.env.VERCEL || process.env.NETLIFY);
  const warnings: string[] = [];
  if (!url.set || !dbConfigured) warnings.push("DATABASE_URL não configurado (modo demonstração com catálogo padrão).");
  if (managedHost && url.isLocalhost) warnings.push("DATABASE_URL aponta para localhost.");
  if (url.pooled && !url.pgbouncerParam) warnings.push("URL em pool sem pgbouncer=true.");
  if (url.channelBinding) warnings.push("Remova channel_binding=require da DATABASE_URL.");
  if (!process.env.DIRECT_URL) warnings.push("DIRECT_URL não configurado (necessário para migrações).");

  const secret = process.env.AUTH_SECRET || "";
  if (secret.length < 16) warnings.push("AUTH_SECRET ausente ou menor que 16 caracteres.");
  if (!process.env.NEXT_PUBLIC_SITE_URL) warnings.push("NEXT_PUBLIC_SITE_URL não configurado.");

  let database: { ok: boolean; kind?: string; code?: string; hint?: string } = { ok: false };
  let tables: { ok: boolean; missing: string[] } = { ok: false, missing: REQUIRED_TABLES };
  let counts: Record<string, number> | null = null;

  if (!dbConfigured) {
    database = { ok: false, kind: "unavailable", hint: HINTS.unavailable };
  } else {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = { ok: true };
      const rows = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()`;
      const have = new Set(rows.map((r) => r.table_name));
      const missing = REQUIRED_TABLES.filter((t) => !have.has(t));
      tables = { ok: missing.length === 0, missing };
      if (missing.length === 0) {
        const [products, categories, admins, orders] = await Promise.all([
          prisma.product.count(),
          prisma.category.count(),
          prisma.user.count(),
          prisma.order.count(),
        ]);
        counts = { products, categories, admins, orders };
        if (products === 0) warnings.push("Sem produtos no banco — execute `npm run db:seed`.");
        if (admins === 0) warnings.push("Sem usuário administrador — execute `npm run db:create-admin`.");
      } else {
        warnings.push(HINTS["not-migrated"]);
      }
    } catch (err) {
      const kind = dbErrorKind(err);
      const code = (err as { code?: string; errorCode?: string })?.code || (err as { errorCode?: string })?.errorCode;
      database = { ok: false, kind, code, hint: HINTS[kind] };
      warnings.push(HINTS[kind]);
    }
  }

  const uploads = vercelBlobConfigured()
    ? process.env.BLOB_STORE_ID
      ? "vercel-blob (oidc)"
      : "vercel-blob (token)"
    : process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT
      ? "netlify-blobs"
      : process.env.VERCEL
        ? "NOT CONFIGURED (create a Vercel Blob store)"
        : "disk";
  if (uploads.startsWith("NOT")) warnings.push("Uploads de imagem precisam de um Blob store.");
  if (!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS))
    warnings.push("SMTP não configurado — e-mails de verificação e pedido não serão enviados.");

  const ok = !dbConfigured || (database.ok && tables.ok && secret.length >= 16 && !(managedHost && url.isLocalhost));
  return NextResponse.json(
    {
      ok,
      mode: dbConfigured ? "database" : "demo",
      host: process.env.VERCEL ? "vercel" : process.env.NETLIFY ? "netlify" : "node",
      checks: {
        databaseUrl: url,
        directUrlSet: Boolean(process.env.DIRECT_URL),
        authSecretSet: secret.length >= 16,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
        database,
        tables,
        counts,
        uploads,
      },
      warnings,
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
