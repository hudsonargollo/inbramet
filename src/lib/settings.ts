import { cache } from "react";
import { unstable_cache } from "next/cache";
import { dbConfigured, prisma } from "./prisma";
import { SETTINGS_TAG, refreshSettings } from "./cache-tags";
import { CONTACT } from "./contact";
import { FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD, DELIVERY_TIME } from "./shipping";
import type { StoreSettings } from "./settings-shared";

export type { StoreSettings, LoyaltySettings } from "./settings-shared";

const KEY = "store";

export const DEFAULT_SETTINGS: StoreSettings = {
  contact: {
    email: CONTACT.email,
    phone: CONTACT.phone,
    whatsapp: CONTACT.whatsapp,
    city: CONTACT.city,
    hours: CONTACT.hours,
  },
  social: {
    instagram: CONTACT.instagram,
    facebook: CONTACT.facebook,
    tiktok: CONTACT.tiktok,
  },
  shipping: {
    flatFee: FLAT_SHIPPING,
    freeThreshold: FREE_SHIPPING_THRESHOLD,
    deliveryTime: DELIVERY_TIME,
  },
  announcements: [
    "Entrega programada em todo o Brasil · Móveis Inbramet",
    "Pagamento na entrega ou on-line ao receber seu pedido",
    "Design funcional em aço, madeira e polímero · Garantia Inbramet",
    "Atendimento personalizado via WhatsApp",
  ],
  inventory: { lowStockThreshold: 5 },
  loyalty: {
    enabled: true,
    name: "Clube Inbramet",
    stampsToFree: 10,
    eligible: "all",
    eligibleSlugs: [],
    pointsPer: 1,
    pointsAmount: 10,
    pointsOnShipping: false,
    expiryDays: 0,
  },
  notifications: { orderEmail: process.env.ADMIN_NOTIFY_EMAIL || "" },
};

type Partialish = { [K in keyof StoreSettings]?: Partial<StoreSettings[K]> | StoreSettings[K] };

function merge(saved: Partialish | null | undefined): StoreSettings {
  const s = saved ?? {};
  return {
    contact: { ...DEFAULT_SETTINGS.contact, ...(s.contact as object) },
    social: { ...DEFAULT_SETTINGS.social, ...(s.social as object) },
    shipping: { ...DEFAULT_SETTINGS.shipping, ...(s.shipping as object) },
    announcements: Array.isArray(s.announcements) ? (s.announcements as string[]) : DEFAULT_SETTINGS.announcements,
    inventory: { ...DEFAULT_SETTINGS.inventory, ...(s.inventory as object) },
    loyalty: { ...DEFAULT_SETTINGS.loyalty, ...(s.loyalty as object) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(s.notifications as object) },
  };
}

const loadStored = unstable_cache(
  async () => (await prisma.setting.findUnique({ where: { key: KEY } }))?.value ?? null,
  ["store-settings-v2"],
  { tags: [SETTINGS_TAG], revalidate: 600 }
);

/** Configurações atuais da loja. Nunca lança exceção. */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!dbConfigured) return DEFAULT_SETTINGS;
  try {
    return merge((await loadStored()) as Partialish | undefined);
  } catch {
    return DEFAULT_SETTINGS;
  }
});

/** Salva uma seção das configurações. */
export async function saveStoreSettings<K extends keyof StoreSettings>(
  section: K,
  value: StoreSettings[K]
): Promise<void> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const current = (row?.value as Partialish | undefined) ?? {};
  const next = { ...current, [section]: value };
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: next as object },
    update: { value: next as object },
  });
  refreshSettings();
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Linhas de anúncio com placeholders preenchidos ({freeThreshold}, {flatFee}). */
export function renderAnnouncements(s: StoreSettings): string[] {
  const fmt = (n: number) => brl.format(n);
  return s.announcements
    .map((line) =>
      line
        .replaceAll("{freeThreshold}", fmt(s.shipping.freeThreshold))
        .replaceAll("{flatFee}", fmt(s.shipping.flatFee))
        .trim()
    )
    .filter(Boolean);
}
