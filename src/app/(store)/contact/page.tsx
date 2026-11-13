import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";
import { ContactForm } from "@/components/contact-form";
import { getStoreSettings } from "@/lib/settings";
import { whatsappUrl, phoneHref } from "@/lib/settings-shared";
import { EmailLink } from "@/components/email-link";

export const metadata: Metadata = {
  title: "Contato",
  description: "Dúvidas sobre seu pedido, entrega ou um projeto para o seu espaço? Escreva para nós.",
  alternates: { canonical: "/contact" },
};

const TOPICS: Record<string, string> = {
  custom: "Pedido sob medida",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const raw = (Array.isArray(sp.topic) ? sp.topic[0] : sp.topic) ?? "";
  const topic = raw in TOPICS ? raw : undefined;
  const settings = await getStoreSettings();
  const CONTACT = { ...settings.contact, whatsappUrl: whatsappUrl(settings), phoneHref: phoneHref(settings) };

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="text-center">
        <Emblem size={44} className="mx-auto text-accent-strong" />
        <span className="eyebrow mt-3 block">Estamos aqui para ajudar</span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">Contato</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          {topic === "custom"
            ? "Conte o que você precisa para o seu projeto — quantas peças, acabamentos e prazo desejado — e nossa equipe retornará o mais rápido possível."
            : "Dúvidas sobre seu pedido, entrega ou orçamento personalizado? Envie sua mensagem e responderemos em breve."}
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_260px]">
        <ContactForm topic={topic} defaultSubject={topic ? TOPICS[topic] : undefined} />

        <aside className="space-y-6 text-sm">
          {CONTACT.email && (
            <div>
              <h3 className="eyebrow mb-2">E-mail</h3>
              <EmailLink email={CONTACT.email} className="text-ink hover:text-accent-strong">
                {CONTACT.email}
              </EmailLink>
            </div>
          )}
          {CONTACT.phone && (
            <div>
              <h3 className="eyebrow mb-2">Telefone</h3>
              <a href={CONTACT.phoneHref} className="text-ink hover:text-accent-strong">
                {CONTACT.phone}
              </a>
            </div>
          )}
          {CONTACT.whatsappUrl && (
            <div>
              <h3 className="eyebrow mb-2">WhatsApp</h3>
              <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-accent-strong">
                Falar pelo WhatsApp →
              </a>
            </div>
          )}
          <div>
            <h3 className="eyebrow mb-2">Horário</h3>
            <p className="text-ink">{CONTACT.hours}</p>
          </div>
          <div>
            <h3 className="eyebrow mb-2">Atendimento</h3>
            <p className="text-ink">{CONTACT.city}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
