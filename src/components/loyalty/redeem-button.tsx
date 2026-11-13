"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function RedeemButton({
  rewardId,
  rewardName,
  costPoints,
  pointsShort,
  stock,
}: {
  rewardId: string;
  rewardName: string;
  costPoints: number;
  pointsShort: number;
  stock: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const disabled = busy || stock <= 0 || pointsShort > 0;

  async function redeem() {
    setBusy(true);
    try {
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = (await res.json()) as { ok: boolean; code?: string; error?: string };
      if (!res.ok || !data.ok || !data.code) {
        throw new Error(data.error || "Não foi possível concluir o resgate.");
      }
      setCode(data.code);
      toast.success(`Você resgatou "${rewardName}". Informe o código ${data.code} no seu próximo pedido ou atendimento.`, {
        title: "Brinde reservado!",
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível concluir o resgate.", {
        title: "Resgate não concluído",
      });
    } finally {
      setBusy(false);
    }
  }

  if (code) {
    return (
      <p className="mt-3 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-center text-xs text-ink">
        Código de resgate: <span className="font-mono text-sm font-semibold">{code}</span>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={redeem}
      disabled={disabled}
      title={
        stock <= 0
          ? "Esgotado no momento"
          : pointsShort > 0
            ? `Faltam ${pointsShort} pontos para este brinde`
            : `Resgatar por ${costPoints} pontos`
      }
      className="mt-3 w-full rounded-full bg-gradient-to-r from-accent-soft to-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-brand transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
    >
      {busy
        ? "Resgatando…"
        : stock <= 0
          ? "Esgotado"
          : pointsShort > 0
            ? `Faltam ${pointsShort} pts`
            : `Resgatar ${costPoints} pts`}
    </button>
  );
}
