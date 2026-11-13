import Link from "next/link";
import { RotatingWord, SplitText } from "./text-reveal";
import { formatPrice } from "@/lib/format";

export function DeliveryBand({
  hours,
  deliveryTime,
  freeThreshold,
}: {
  hours: string;
  deliveryTime: string;
  freeThreshold: number;
}) {
  const freeLine =
    freeThreshold > 0 ? `Grátis acima de ${formatPrice(freeThreshold)}` : "Frete grátis na loja";

  const steps = [
    { title: "Escolha suas peças", body: "Pelo site ou WhatsApp, com medidas detalhadas." },
    { title: "Embalagem segura", body: "Preparamos cada móvel para um transporte protegido." },
    { title: "Receba no endereço", body: "Entrega direta e pagamento na entrega ou on-line." },
  ];

  return (
    <section className="relative overflow-hidden bg-brand-deep text-light">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 60% at 82% 18%, rgba(230,255,87,0.12), transparent 68%), radial-gradient(45% 50% at 8% 90%, rgba(230,255,87,0.08), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(230,255,87,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(230,255,87,0.14) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(70% 70% at 50% 40%, black, transparent 78%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-28">
        <div>
          <span className="eyebrow inline-flex items-center gap-2.5 text-gold">
            <span className="h-px w-8 bg-gold/50" aria-hidden="true" />
            Entrega programada · Inbramet
          </span>

          <h2 className="mt-5 max-w-[17ch] font-display text-3xl font-extrabold leading-[1.06] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
            <SplitText text="Seus móveis chegam" />{" "}
            <RotatingWord
              words={["prontos para uso", "na sua porta", "com total segurança"]}
              className="text-accent"
            />
          </h2>

          <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-light/75">
            Peça pelo site ou WhatsApp e coordenamos o transporte seguro das suas mesas,
            cadeiras ou conjuntos com entrega no endereço. Prazo estimado:
            {" "}{deliveryTime}.
          </p>

          <ol className="mt-9 grid gap-3 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-sm transition-colors hover:border-accent/45"
              >
                <span className="font-display text-2xl font-bold leading-none text-gold/75 transition-colors group-hover:text-accent">
                  0{i + 1}
                </span>
                <p className="mt-2.5 text-sm font-semibold text-light">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-light/55">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-brand-deep transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              Explorar catálogo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/shipping"
              className="inline-flex items-center gap-2 rounded-full border border-light/25 px-7 py-3.5 text-sm font-semibold text-light transition hover:border-gold/60 hover:text-gold"
            >
              Entregas e prazos
            </Link>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-light/45">
            <ClockIcon />
            {hours}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <span className="absolute -left-4 top-20 z-20 -rotate-3 rounded-2xl bg-accent px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand-deep shadow-lg sm:-left-6">
            Envio seguro
          </span>
          <span className="absolute -bottom-3 right-6 z-20 rotate-2 rounded-2xl border border-brand/15 bg-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand shadow-md">
            {freeLine}
          </span>

          <div className="relative overflow-hidden rounded-[2rem] border border-gold/35 bg-cream p-6 shadow-[0_40px_90px_-46px_rgba(0,0,0,0.75)] sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage: "radial-gradient(rgba(15,23,42,0.12) 1px, transparent 1.4px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[54%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(230,255,87,0.18), transparent 65%)" }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[54%] h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/15"
            />
            <span
              aria-hidden="true"
              className="animate-ring pointer-events-none absolute left-1/2 top-[54%] h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/40"
            />

            <div className="relative">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-brand/20 bg-white/70 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-brand">
                  Rota de entrega
                </span>
                <span className="font-display text-[0.7rem] font-semibold tracking-[0.16em] text-brand/60">
                  INB · BR
                </span>
              </div>

              <div className="relative flex min-h-[300px] items-center justify-center">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 400 300"
                  className="pointer-events-none absolute inset-0 h-full w-full text-accent-strong/65"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M52 246 C 128 232, 120 172, 205 160 S 322 128, 350 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="5 9"
                    className="route-dash"
                  />
                </svg>

                <MapPin className="bottom-[5%] left-[4%]">Inbramet</MapPin>
                <MapPin className="right-[2%] top-[1%]">Seu espaço</MapPin>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[8%] bottom-[8%] h-[7px] rounded-full bg-brand/10"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[11%] bottom-[11%] border-t-2 border-dashed border-cream"
                />

                <RiderArt />
              </div>

              <div className="relative grid grid-cols-2 gap-2">
                <Chip icon={<TruckMiniIcon />} label="Entrega em domicílio" />
                <Chip icon={<CashIcon />} label="Pagamento ao receber" />
              </div>
            </div>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-brand/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RiderArt() {
  return (
    <div className="animate-rider relative z-[1] w-[82%] max-w-[330px] drop-shadow-[0_24px_26px_rgba(15,23,42,0.22)]">
      <svg
        viewBox="0 0 420 300"
        role="img"
        aria-label="Transporte da Inbramet em rota de entrega"
        className="w-full"
      >
        <g stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" opacity="0.65">
          <path d="M44 188h30" />
          <path d="M30 205h40" />
          <path d="M52 222h24" />
        </g>
        <ellipse cx="238" cy="272" rx="132" ry="10" fill="#0f172a" opacity="0.14" />
        <g>
          <circle cx="148" cy="232" r="34" fill="#0f172a" />
          <circle cx="148" cy="232" r="20" fill="#e2e8f0" />
          <circle cx="148" cy="232" r="7" fill="#334155" />
          <path d="M148 212v40M128 232h40M134 218l28 28M162 218l-28 28" stroke="#94a3b8" strokeWidth="2.4" opacity=".8" />
        </g>
        <g>
          <circle cx="322" cy="232" r="34" fill="#0f172a" />
          <circle cx="322" cy="232" r="20" fill="#e2e8f0" />
          <circle cx="322" cy="232" r="7" fill="#334155" />
          <path d="M322 212v40M302 232h40M308 218l28 28M336 218l-28 28" stroke="#94a3b8" strokeWidth="2.4" opacity=".8" />
        </g>
        <path d="M112 219a38 38 0 0 1 72 0" fill="none" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
        <path d="M148 232l52-18" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
        <path d="M118 214q4-22 32-22h40l8 20z" fill="#0f172a" />
        <path d="M186 208h88l6 14H184z" fill="#1e293b" />
        <path d="M188 214h82" stroke="#E6FF57" strokeWidth="2.5" opacity=".75" />
        <path d="M282 214l9-56q2-12 14-14l12 3-7 67z" fill="#1e293b" />
        <path d="M296 202l6-42q1-6 7-6l6 2-5 46z" fill="#E6FF57" />
        <path d="M290 212a38 38 0 0 1 64-12" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
        <circle cx="315" cy="158" r="9" fill="#E6FF57" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="315" cy="158" r="3.2" fill="#fff" />
        <path d="M305 148l-14-18" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
        <path d="M292 131l-14 3" stroke="#E6FF57" strokeWidth="8" strokeLinecap="round" />
        <path d="M154 192q22-12 52-6l8 10H158z" fill="#0f172a" />
        <path d="M160 190q20-8 44-4" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <g>
          <rect x="100" y="112" width="66" height="82" rx="9" fill="#E6FF57" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="96" y="105" width="74" height="15" rx="7" fill="#F6F9E0" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="100" y="146" width="66" height="17" fill="#0f172a" />
          <g fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round">
            <path d="M116 137q15-10 34 0" />
            <path d="M114 142h40" />
            <path d="M118 147q12 6 30 0" stroke="#E6FF57" />
          </g>
          <path d="M130 194v14" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        </g>
        <path d="M206 176l26 18 10 20" fill="none" stroke="#0f172a" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M198 178q10-42 44-58l18 14q-22 14-30 50z" fill="#1e293b" />
        <path d="M208 164q16-26 40-38" fill="none" stroke="#E6FF57" strokeWidth="4" strokeLinecap="round" />
        <path d="M250 130q18 0 30 7" fill="none" stroke="#1e293b" strokeWidth="13" strokeLinecap="round" />
        <circle cx="282" cy="138" r="6.5" fill="#e8b48a" />
        <path d="M208 180l30 20 14 22" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M246 218h18" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />
        <circle cx="264" cy="104" r="16" fill="#e8b48a" />
        <path d="M246 104a18 18 0 0 1 36 0z" fill="#E6FF57" />
        <path d="M246 104h36v4h-36z" fill="#F6F9E0" />
        <path d="M252 108h30l-3 8h-24z" fill="#0f172a" />
        <path d="M228 142l-8 30" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      </svg>
    </div>
  );
}

function MapPin({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute z-[2] flex items-center gap-1.5 rounded-full border border-brand/15 bg-white/85 px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-brand shadow-sm backdrop-blur-sm ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </span>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-brand/10 bg-white/75 px-3 py-2.5 text-[0.7rem] font-semibold text-brand">
      <span className="text-accent-strong">{icon}</span>
      {label}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckMiniIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7v-6z" />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="17.5" cy="18" r="1.5" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.3" />
      <path d="M6 9.5v5M18 9.5v5" />
    </svg>
  );
}
