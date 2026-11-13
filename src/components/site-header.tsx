import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderCart } from "./cart/header-cart";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { label: "Início", href: "/" },
  { label: "Coleção", href: "/shop" },
  { label: "Sobre nós", href: "/about" },
  { label: "Contato", href: "/contact" },
];

const iconBtn =
  "relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-surface/60 text-brand transition hover:border-accent hover:bg-accent/10 hover:text-accent-strong dark:text-ink";

export function SiteHeader({
  clubName = null,
}: {
  clubName?: string | null;
}) {
  const pathname = usePathname();

  const nav = clubName
    ? [...NAV.slice(0, 2), { label: clubName, href: "/club-camba" }, ...NAV.slice(2)]
    : NAV;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <Link
          href="/"
          aria-label="Inbramet — início"
          className="group flex min-w-0 shrink items-center transition-transform duration-300 hover:scale-[1.02] lg:shrink-0 lg:justify-self-start"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/products/inbramet-icon-transparent.png"
            alt="Inbramet"
            width={228}
            height={169}
            className="h-10 w-auto sm:h-11 lg:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex lg:justify-self-center">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative py-1 text-sm font-semibold"
              >
                <span
                  className={
                    active
                      ? "text-accent-strong"
                      : "text-ink/70 transition-colors group-hover:text-brand dark:group-hover:text-accent"
                  }
                >
                  {item.label}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-accent transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 text-brand sm:gap-2 lg:justify-self-end">
          <Link href="/search" aria-label="Buscar" className={`${iconBtn} hidden sm:flex`}>
            <SearchIcon />
          </Link>
          <Link href="/account" aria-label="Minha conta" className={`${iconBtn} hidden sm:flex`}>
            <UserIcon />
          </Link>
          <ThemeToggle className={iconBtn} />
          <HeaderCart className={iconBtn} />
          <MobileMenu clubName={clubName} />
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(230,255,87,0.45)] to-transparent" />
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
