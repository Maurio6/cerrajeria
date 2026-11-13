import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — Cerrajero a domicilio 24 horas en ${site.coverage}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen Open Graph estática para vistas previas en Google, WhatsApp y redes. */
export default function OpenGraphImage() {
  const badge = `${site.coverage} · 24 horas`;
  const subtitle = `Cerrajero a domicilio en ${site.city}: copias de llaves, cambio de guardas, chapas, carros y motos.`;
  const phoneLabel = `Tel / WhatsApp: ${site.phoneDisplay}`;
  const hostLabel = new URL(site.url).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f1720",
          color: "#eef0f2",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#c8962e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#15202b",
              fontSize: "34px",
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 700,
              color: "#e2b75a",
              letterSpacing: "-0.02em",
            }}
          >
            {badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              lineHeight: 1.3,
              color: "#c5cfd9",
              maxWidth: "960px",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #263341",
            paddingTop: "28px",
            fontSize: "28px",
            color: "#e2b75a",
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex" }}>{phoneLabel}</div>
          <div style={{ display: "flex", color: "#97a4b1", fontWeight: 500 }}>{hostLabel}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

