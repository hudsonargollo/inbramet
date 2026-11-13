import type { Metadata } from "next";
import Link from "next/link";
import { dbConfigured, prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getCustomerSession } from "@/lib/customer-auth";
import { getBalances, getHistory } from "@/lib/loyalty";
import { movementLabel, pointRuleLabel, stampCard, stampRuleLabel } from "@/lib/loyalty-shared";
import type { LoyaltySettings } from "@/lib/settings-shared";
import { ProductImage } from "@/components/product-image";
import { RedeemButton } from "@/components/loyalty/redeem-button";
import { Emblem } from "@/components/brand/emblem";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { loyalty } = await getStoreSettings();
  return {
    title: `${loyalty.name}: acumule selos e ganhe`,
    description: `${loyalty.name} da Inbramet — ${stampRuleLabel(loyalty)} e ${pointRuleLabel(loyalty)} resgatáveis por brindes.`,
    alternates: { canonical: "/clube-inbramet" },
  };
}

type Card = { id: string; name: string; slug: string; image?: string; filled: number; size: number };

export default async function ClubCambaPage() {
  const settings = await getStoreSettings();
  const rules = settings.loyalty;
  const session = await getCustomerSession();

  const { balances, rewards, cards, pending, history } = await loadClub(session?.id, rules);
  const eligibleLabel =
    rules.eligible === "all"
      ? "Toda a coleção"
      : rules.eligible === "category"
        ? "Categorias selecionadas da coleção"
        : "Produtos selecionados da coleção";

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-gradient-to-br from-cream-soft via-surface to-accent/10 px-6 py-12 text-center sm:px-10">
        <Emblem size={56} className="mx-auto text-accent-strong" />
        <span className="eyebrow mt-4 block">Programa de fidelidade</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {rules.name}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/70">
          Cada pedido aproxima você de benefícios exclusivos, e suas compras em reais viram
          brindes. Sem formulários nem cartões de papel: seus selos ficam salvos na sua conta.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-gradient-to-r from-accent-soft to-accent px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-brand transition hover:opacity-90"
          >
            Comprar e acumular
          </Link>
          {!session && (
            <Link
              href="/register"
              className="rounded-full border border-[var(--line-strong)] px-7 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent-strong"
            >
              Criar minha conta
            </Link>
          )}
        </div>
      </section>

      {session && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-ink">Sua cartela</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line-strong)] bg-surface/80 p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Pontos disponíveis
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold text-ink">{balances.points}</p>
              <p className="mt-1 text-sm text-muted">Resgate na loja de brindes abaixo.</p>
            </div>
            <div className="rounded-2xl border border-[var(--line-strong)] bg-surface/80 p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Selos acumulados
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold text-ink">
                {balances.totalStamps}
              </p>
              <p className="mt-1 text-sm text-muted">{stampRuleLabel(rules)}.</p>
            </div>
          </div>

          {cards.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {cards.map((c) => (
                <StampCardView key={c.id} card={c} />
              ))}
            </div>
          )}
          {cards.length === 0 && (
            <p className="mt-4 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-8 text-center text-sm text-muted">
              Você ainda não tem selos. Seu primeiro pedido começa a preencher sua cartela.
            </p>
          )}

          {pending.length > 0 && (
            <div className="mt-8 rounded-2xl border border-accent/45 bg-accent/8 p-6">
              <h3 className="font-display text-lg font-semibold text-ink">Brindes reservados</h3>
              <p className="mt-1 text-sm text-muted">
                Informe este código no atendimento ou nas observações do seu próximo pedido para receber seu brinde.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {pending.map((r) => (
                  <li key={r.code} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-ink">{r.rewardName}</span>
                    <span className="font-mono font-semibold text-ink">{r.code}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Como funciona</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Compre normalmente",
              d: `${eligibleLabel}. Entre na sua conta e o pedido é registrado no seu nome.`,
            },
            {
              t: "Acumule selos e pontos",
              d: `${stampRuleLabel(rules)} — do mesmo produto — e ${pointRuleLabel(rules)}.`,
            },
            {
              t: "Resgate",
              d: rules.expiryDays > 0
                ? `Selos e pontos são válidos por ${rules.expiryDays} dias a partir da conquista.`
                : "Seus selos e pontos não expiram: ficam salvos até você usar.",
            },
          ].map((s, i) => (
            <li
              key={s.t}
              className="rounded-2xl border border-[var(--line)] bg-cream-soft p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-light">
                {i + 1}
              </span>
              <p className="mt-3 font-display text-lg font-semibold text-ink">{s.t}</p>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        {!session && (
          <p className="mt-4 text-sm text-muted">
            Já tem conta?{" "}
            <Link href="/login?next=%2Fclube-inbramet" className="text-accent-strong hover:underline">
              Entre aqui
            </Link>{" "}
            para acompanhar seus selos.
          </p>
        )}
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-ink">Loja de brindes</h2>
          <p className="text-sm text-muted">{pointRuleLabel(rules)}.</p>
        </div>
        {rewards.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-10 text-center text-sm text-muted">
            Estamos preparando os brindes. Volte em breve: seus pontos estão te esperando.
          </p>
        ) : (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => {
              const short = Math.max(0, r.costPoints - balances.points);
              return (
                <li
                  key={r.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-surface/80"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                    <ProductImage src={r.image ?? undefined} alt={r.name} seed={r.slug} fit="contain" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-display text-lg font-semibold text-ink">{r.name}</p>
                    {r.description && <p className="mt-1 text-sm text-muted">{r.description}</p>}
                    <p className="mt-3 text-sm font-semibold text-accent-strong">{r.costPoints} pontos</p>
                    {session ? (
                      <RedeemButton
                        rewardId={r.id}
                        rewardName={r.name}
                        costPoints={r.costPoints}
                        pointsShort={short}
                        stock={r.stock}
                      />
                    ) : (
                      <Link
                        href="/login?next=%2Fclube-inbramet"
                        className="mt-3 w-full rounded-full border border-[var(--line-strong)] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:border-accent hover:text-accent-strong"
                      >
                        Entre para resgatar
                      </Link>
                    )}
                    {r.stock > 0 && r.stock <= 5 && (
                      <p className="mt-2 text-center text-xs text-muted">Restam {r.stock}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {session && history.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-ink">Suas movimentações</h2>
          <ul className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-surface/80 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span className="min-w-0 flex-1 truncate text-ink">
                  {movementLabel(h)}
                  {h.note && h.kind !== "ADJUST" && <span className="ml-2 text-muted">· {h.note}</span>}
                </span>
                <span className="shrink-0 text-muted">
                  {h.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
                <span
                  className={`shrink-0 font-medium ${
                    h.stamps + h.points >= 0 ? "text-accent-strong" : "text-muted"
                  }`}
                >
                  {h.stamps !== 0 &&
                    `${h.stamps > 0 ? "+" : ""}${h.stamps} selo${Math.abs(h.stamps) === 1 ? "" : "s"}`}
                  {h.stamps !== 0 && h.points !== 0 && " · "}
                  {h.points !== 0 && `${h.points > 0 ? "+" : ""}${h.points} pts`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-center text-xs text-muted">
        {rules.name} é exclusivo da loja on-line Inbramet.
        Aplicam-se os termos do programa.
      </p>
    </div>
  );
}

function StampCardView({ card }: { card: Card }) {
  const full = card.filled >= card.size;
  return (
    <div className="rounded-2xl border border-[var(--line-strong)] bg-surface/80 p-5">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
          <ProductImage src={card.image} alt={card.name} seed={card.slug} fit="contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{card.name}</p>
          <p className="text-xs text-muted">
            {full ? "Cartela completa: ganhe grátis no seu próximo pedido" : `${card.filled} de ${card.size} selos`}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {Array.from({ length: card.size }, (_, i) => (
          <span
            key={i}
            className={`h-6 w-6 rounded-full border ${
              i < card.filled
                ? "border-accent bg-gradient-to-br from-accent-soft to-accent"
                : "border-dashed border-[var(--line-strong)] bg-transparent"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

type ClubData = {
  balances: Awaited<ReturnType<typeof getBalances>>;
  rewards: RewardRow[];
  cards: Card[];
  pending: PendingRow[];
  history: HistoryRow[];
};

async function loadClub(customerId: string | undefined, rules: LoyaltySettings): Promise<ClubData> {
  const empty: ClubData = {
    balances: { points: 0, stampsByProduct: {}, readyForRedemption: [], totalStamps: 0 },
    rewards: [],
    cards: [],
    pending: [],
    history: [],
  };
  if (!rules.enabled || !dbConfigured) return empty;
  try {
    const rewards = await prisma.reward.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { costPoints: "asc" }],
      select: { id: true, slug: true, name: true, description: true, image: true, costPoints: true, stock: true },
    });
    if (!customerId) return { ...empty, rewards };

    const [balances, history, pending] = await Promise.all([
      getBalances(customerId, rules),
      getHistory(customerId, 12),
      prisma.redemption.findMany({
        where: { customerId, status: { in: ["PENDING", "READY"] } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { code: true, rewardName: true, status: true },
      }),
    ]);

    const ids = Object.entries(balances.stampsByProduct)
      .filter(([id, n]) => id !== "" && n > 0)
      .map(([id]) => id);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, active: true },
      select: { id: true, name: true, slug: true, images: true },
    });
    const cards: Card[] = products
      .map((p) => {
        const card = stampCard(balances.stampsByProduct[p.id] ?? 0, rules);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.images[0],
          filled: card.filled,
          size: card.size,
        };
      })
      .sort((a, b) => b.filled / b.size - a.filled / a.size);

    return { balances, rewards, cards, pending, history };
  } catch {
    return empty;
  }
}

type RewardRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  costPoints: number;
  stock: number;
};
type PendingRow = { code: string; rewardName: string; status: string };
type HistoryRow = Awaited<ReturnType<typeof getHistory>>[number];
