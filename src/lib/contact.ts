// Detalhes de contato da loja & redes sociais.

/** Localização padrão exibida no rodapé, página de contato e chat. */
export const STORE_LOCATION = "Brasil · Atendimento On-line";

function clean(v: string | undefined): string {
  return (v ?? "").trim();
}

const whatsapp = clean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER).replace(/[^0-9]/g, "");
const phone = clean(process.env.NEXT_PUBLIC_CONTACT_PHONE);

export const CONTACT = {
  /** Formato internacional somente dígitos (ex.: 5511999999999). */
  whatsapp,
  whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}` : "",
  /** Formato de exibição (ex.: "(11) 99999-9999"). */
  phone,
  phoneHref: phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : "",
  email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  city: clean(process.env.NEXT_PUBLIC_CONTACT_CITY) || STORE_LOCATION,
  hours: clean(process.env.NEXT_PUBLIC_CONTACT_HOURS) || "Segunda a sábado · 09h às 19h",
  instagram: clean(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  facebook: clean(process.env.NEXT_PUBLIC_FACEBOOK_URL),
  tiktok: clean(process.env.NEXT_PUBLIC_TIKTOK_URL),
} as const;
