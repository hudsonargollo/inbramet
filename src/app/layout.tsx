import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { ToastProvider } from "@/components/ui/toast";
import { FlashToast } from "@/components/ui/flash-toast";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Inbramet | Móveis de Tecido e Design",
    template: "%s | Inbramet",
  },
  description:
    "Móveis de tecido, bancos, mesas e conjuntos para a sua casa e escritório. Design sob medida, conforto e acabamento premium.",
  keywords: [
    "móveis", "cadeiras", "mesas", "bancos", "banquetas", "conjuntos de mesa",
    "móveis de tecido", "inbramet", "decoração de casa", "móveis para escritório",
  ],
  applicationName: "Inbramet",
  openGraph: {
    title: "Inbramet | Móveis de Design",
    description:
      "Móveis de tecido, bancos, mesas e conjuntos para a sua casa e escritório.",
    type: "website",
    siteName: "Inbramet",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Inbramet | Móveis de Design",
    description:
      "Móveis de tecido, bancos, mesas e conjuntos para a sua casa e escritório.",
  },
  icons: {
    icon: "/products/inbramet-icon.png",
    shortcut: "/products/inbramet-icon.png",
    apple: "/products/inbramet-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <noscript>
          <style>{`.split-word{opacity:1 !important;filter:none !important;transform:none !important}`}</style>
        </noscript>
        {/* Apply saved theme before paint to avoid a flash of the wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('inbramet-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else if(t==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();",
          }}
        />
        <ToastProvider>
          <FlashToast />
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
