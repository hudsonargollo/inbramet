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
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Inbramet | El mejor sabor de Santa Cruz",
    template: "%s | Inbramet",
  },
  description:
    "comida típica cruceña desde 1986: majao, picante de pollo, empanadas de keperí y parrilla. Pide en línea con delivery o retiro en tienda en Santa Cruz, Bolivia.",
  keywords: [
    "Inbramet",
    "comida típica cruceña",
    "majao",
    "picante de pollo",
    "empanadas de keperí",
    "parrilla",
    "delivery Santa Cruz",
    "retiro en tienda",
    "Santa Cruz",
    "Bolivia",
  ],
  applicationName: "Inbramet",
  openGraph: {
    title: "Inbramet | El mejor sabor de Santa Cruz",
    description:
      "comida típica cruceña desde 1986: majao, picantes, empanadas de keperí y parrilla, con delivery y retiro en tienda en Santa Cruz.",
    type: "website",
    siteName: "Inbramet",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Inbramet | El mejor sabor de Santa Cruz",
    description:
      "comida típica cruceña desde 1986: majao, picantes, empanadas de keperí y parrilla, con delivery y retiro en tienda en Santa Cruz.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
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
