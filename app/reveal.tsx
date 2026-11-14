"use client";

import { useEffect } from "react";

// Cada elemento .rv / .rv-title / .rv-bar se anima al entrar en pantalla y se reinicia al salir del todo,
// así la animación se repite cada vez que el visitante llega a esa sección. Se observan uno por uno
// para que en celular (secciones muy largas) cada tarjeta entre justo cuando aparece.
// Sin JavaScript o con "reducir movimiento" no se activa y todo se ve normal.
export function Reveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("reveal-on");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.intersectionRatio >= 0.15) el.dataset.shown = "";
          else if (!e.isIntersecting) delete el.dataset.shown;
        }
      },
      { threshold: [0, 0.15] },
    );
    document.querySelectorAll(".rv, .rv-title, .rv-bar").forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      root.classList.remove("reveal-on");
    };
  }, []);
  return null;
}
