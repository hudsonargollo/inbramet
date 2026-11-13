// Política padrão de frete — valores iniciais em Admin → Configurações.
// Frete em Reais (BRL): gratuito a partir do valor mínimo ou taxa fixa.
function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const FREE_SHIPPING_THRESHOLD = num(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD, 0);
export const FLAT_SHIPPING = num(process.env.NEXT_PUBLIC_FLAT_SHIPPING, 15);

/** Estimativa de entrega exibida na loja (produto, FAQ, entregas, chat). */
export const DELIVERY_TIME = "o mais rápido possível, conforme preparo e distância";
