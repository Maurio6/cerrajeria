import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/site";
import "./globals.css";

const display = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin"], axes: ["opsz"], adjustFontFallback: false, fallback: ["Arial Narrow", "sans-serif"] });
const body = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });

const seoTitle = `${site.name}: cerrajero a domicilio en ${site.city}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: {
    default: seoTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Cerrajería Segurox",
    "Cerrajería Segurox Florencia",
    "Segurox Florencia",
    "cerrajería en Florencia Caquetá",
    "cerrajero a domicilio Florencia",
    "cerrajero 24 horas Florencia",
    "duplicado de llaves Florencia",
    "apertura de carros Florencia",
    "llaves para motos Florencia",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: site.name,
    title: `${site.name}: cerrajero a domicilio en ${site.city}, ${site.region}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef0f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1720" },
  ],
};

// Aplica el tema guardado antes de pintar, para que no parpadee.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-screen font-sans">
        <Script id="theme" strategy="beforeInteractive">{themeScript}</Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
