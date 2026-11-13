import { redirect } from "next/navigation";
import { dbConfigured, prisma } from "./prisma";
import { verifyPassword, getAdminSession, startSession, type AdminSession } from "./auth";

export type SignedOutReason = "replaced" | "db";

export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ ok: true; role: string; ver: number; branchId: string | null } | { ok: false; reason: "invalid" | "db" }> {
  if (!dbConfigured) return { ok: false, reason: "db" };
  const e = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: e } });
    if (!user || !verifyPassword(password, user.passwordHash)) return { ok: false, reason: "invalid" };
    const { updatedAt } = await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
      select: { updatedAt: true },
    });
    return { ok: true, role: user.role, ver: updatedAt.getTime(), branchId: user.branchId ?? null };
  } catch (err) {
    console.error("[admin-login] database error:", err);
    return { ok: false, reason: "db" };
  }
}

export async function checkAdmin(): Promise<
  { session: AdminSession; reason?: never } | { session: null; reason: SignedOutReason | null }
> {
  const session = await getAdminSession();
  if (!session) return { session: null, reason: null };
  if (!dbConfigured) return { session: null, reason: "db" };
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.email },
      select: { role: true, branchId: true, updatedAt: true },
    });
    if (!user) return { session: null, reason: null };
    if (user.updatedAt.getTime() !== session.ver) return { session: null, reason: "replaced" };
    return { session: { ...session, role: user.role, branchId: user.branchId ?? null } };
  } catch {
    return { session: null, reason: "db" };
  }
}

export async function getVerifiedAdmin(): Promise<AdminSession | null> {
  return (await checkAdmin()).session;
}

// Guards admin pages / actions — redirects to login when not authenticated.
export async function requireAdmin(): Promise<AdminSession> {
  const { session, reason } = await checkAdmin();
  if (!session) redirect(reason ? `/admin/login?signed_out=${reason}` : "/admin/login");
  return session;
}

/** Owner-only pages (branches, settings): staff are sent back to the dashboard. */
export async function requireOwner(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") redirect("/admin");
  return session;
}

/** After the caller rewrote their own admin row (e.g. new password): keep this
 *  device signed in under the new stamp; every other device is signed out. */
export async function refreshAdminSession(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, branchId: true, updatedAt: true },
  });
  if (user) await startSession(email, user.role, user.updatedAt.getTime(), user.branchId ?? null);
}

/** Admins are global; staff may only touch their own branch. */
export function canAccessBranch(session: AdminSession, branchId: string): boolean {
  return session.role === "ADMIN" || session.branchId === branchId;
}

/** A Prisma `where` fragment that limits a query to what this admin may see.
 *  Staff without a branch (misconfigured account) see nothing. */
export function branchWhere(session: AdminSession): { branchId?: string } {
  if (session.role === "ADMIN") return {};
  return { branchId: session.branchId ?? "__none__" };
}

/** Branch id to scope data queries with: null for a global admin, the staff
 *  member's branch otherwise. */
export function scopeBranchId(session: AdminSession): string | null {
  return session.role === "ADMIN" ? null : (session.branchId ?? "__none__");
}
