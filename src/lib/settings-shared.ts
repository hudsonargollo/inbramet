// Shape das configurações da loja + helpers client-safe.

export type LoyaltySettings = {
  enabled: boolean;
  name: string;
  stampsToFree: number;
  eligible: "all" | "category" | "product";
  eligibleSlugs: string[];
  pointsPer: number;
  pointsAmount: number;
  pointsOnShipping: boolean;
  expiryDays: number;
};

export type StoreSettings = {
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    city: string;
    hours: string;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  shipping: {
    flatFee: number;
    freeThreshold: number;
    deliveryTime: string;
  };
  announcements: string[];
  inventory: {
    lowStockThreshold: number;
  };
  loyalty: LoyaltySettings;
  notifications: {
    orderEmail: string;
  };
};

export function whatsappUrl(s: StoreSettings): string {
  return s.contact.whatsapp ? `https://wa.me/${s.contact.whatsapp}` : "";
}

export function phoneHref(s: StoreSettings): string {
  return s.contact.phone ? `tel:${s.contact.phone.replace(/[^0-9+]/g, "")}` : "";
}

export function shippingFor(subtotal: number, s: StoreSettings["shipping"]): number {
  return subtotal >= s.freeThreshold ? 0 : s.flatFee;
}
