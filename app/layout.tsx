import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/site";
import "./globals.css";

const display = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin"], axes: ["opsz"], adjustFontFallback: false, fallback: ["Arial Narrow", "sans-serif"] });
const body = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${site.name}: cerrajero a domicilio en ${site.city}`,
  description: `Duplicado de llaves, cambio de guardas, instalación de chapas, apertura de carros y llaves para motos en ${site.city}. Atendemos 24 horas.`,
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
