"use client";

import { useRef, useSyncExternalStore } from "react";
import { cop, services, site } from "@/lib/site";
import { serviceIcons, WhatsAppIcon } from "./icons";

// Cotización: { slug: cantidad }. Vive en memoria y en localStorage para no perderla al recargar.
type Cart = Record<string, number>;
const KEY = "cotizacion";
const MAX = 20;
const EMPTY: Cart = {};
let cart: Cart | null = null;
const listeners = new Set<() => void>();

function read(): Cart {
  if (cart) return cart;
  cart = {};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    for (const s of services) {
      const n = Number(saved[s.slug]);
      if (Number.isInteger(n) && n > 0) cart[s.slug] = Math.min(n, MAX);
    }
  } catch {}
  return cart;
}

function setQty(slug: string, n: number) {
  const next = { ...read() };
  if (n <= 0) delete next[slug];
  else next[slug] = Math.min(n, MAX);
  cart = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
const useCart = () => useSyncExternalStore(subscribe, read, () => EMPTY);
const openQuote = () => (document.getElementById("cotizacion") as HTMLDialogElement | null)?.showModal();

function Stepper({ slug, qty, label }: { slug: string; qty: number; label: string }) {
  const btn = "grid size-9 place-items-center text-lg transition hover:bg-sunk disabled:opacity-40";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-line">
      <button type="button" className={btn} onClick={() => setQty(slug, qty - 1)} aria-label={qty === 1 ? `Quitar ${label}` : `Una menos de ${label}`}>
        −
      </button>
      <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
      <button type="button" className={btn} onClick={() => setQty(slug, qty + 1)} disabled={qty >= MAX} aria-label={`Una más de ${label}`}>
        +
      </button>
    </div>
  );
}

export function AddToQuote({ slug, title }: { slug: string; title: string }) {
  const qty = useCart()[slug] ?? 0;
  if (!qty)
    return (
      <button
        type="button"
        onClick={() => setQty(slug, 1)}
        className="rounded-lg border border-ink/80 px-3.5 py-2 text-sm font-semibold transition hover:bg-ink hover:text-bg"
      >
        Agregar a la cotización
      </button>
    );
  return (
    <div className="flex items-center gap-2">
      <Stepper slug={slug} qty={qty} label={title} />
      <button type="button" onClick={openQuote} className="text-sm font-semibold text-brass-text underline-offset-4 hover:underline">
        Ver
      </button>
    </div>
  );
}

export function QuoteButton() {
  const items = useCart();
  const count = Object.values(items).reduce((a, b) => a + b, 0);
  return (
    <button
      type="button"
      onClick={openQuote}
      aria-label={`Mi cotización, ${count} ${count === 1 ? "servicio" : "servicios"}`}
      className="relative flex h-10 items-center gap-2 rounded-full border border-line px-3 text-sm font-medium transition hover:border-brass"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 4h8l1 2h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2l1-2Z" />
        <path d="M8 11h8M8 15h5" />
      </svg>
      <span className="hidden whitespace-nowrap sm:inline lg:hidden xl:inline">Mi cotización</span>
      {count > 0 && (
        <span key={count} className="pop grid h-5 min-w-5 place-items-center rounded-full bg-brass px-1 text-xs font-bold text-on-brass tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

export function buildQuoteMessage(items: Cart, prices: Record<string, number>, name: string, place: string, note: string) {
  const lines = services
    .filter((s) => items[s.slug])
    .map((s) => `• ${s.title} x${items[s.slug]} (desde ${cop(prices[s.slug] * items[s.slug])})`);
  const total = services.reduce((t, s) => t + (items[s.slug] ?? 0) * prices[s.slug], 0);
  const extra = [name && `Nombre: ${name}`, place && `Barrio o dirección: ${place}`, note && `Detalles: ${note}`].filter(Boolean);
  return [
    "Hola, quiero cotizar estos servicios:",
    "",
    ...lines,
    "",
    `Total aproximado: desde ${cop(total)}`,
    ...(extra.length ? ["", ...extra] : []),
  ].join("\n");
}

export function QuoteDialog({ prices }: { prices: Record<string, number> }) {
  const items = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const chosen = services.filter((s) => items[s.slug]);
  const total = chosen.reduce((t, s) => t + items[s.slug] * prices[s.slug], 0);

  const send = (f: FormData) => {
    const get = (k: string) => String(f.get(k) ?? "").trim().slice(0, 200);
    const text = buildQuoteMessage(items, prices, get("name"), get("place"), get("note"));
    window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <dialog
      id="cotizacion"
      ref={ref}
      aria-labelledby="cotizacion-titulo"
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="quote-dialog m-0 mt-auto h-[88dvh] max-h-none w-full max-w-none rounded-t-2xl bg-surface text-ink shadow-2xl backdrop:bg-black/50 sm:mr-0 sm:ml-auto sm:h-dvh sm:w-[440px] sm:rounded-none sm:rounded-l-2xl"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cotizacion-titulo" className="font-display text-3xl font-extrabold tracking-tight">Mi cotización</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-2xl hover:bg-sunk">
            ×
          </button>
        </header>

        {chosen.length === 0 ? (
          <div className="grid flex-1 place-content-center gap-3 px-8 text-center">
            <p className="font-display text-2xl font-bold">Aún no has agregado servicios</p>
            <p className="text-muted">Toca &quot;Agregar a la cotización&quot; en los servicios que necesites y te armamos el mensaje para WhatsApp.</p>
            <a href="#servicios" onClick={() => ref.current?.close()} className="mt-2 font-semibold text-brass-text underline underline-offset-4">
              Ver servicios
            </a>
          </div>
        ) : (
          <form action={send} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-line">
                {chosen.map((s) => {
                  const Icon = serviceIcons[s.slug];
                  return (
                    <li key={s.slug} className="flex items-center gap-3 py-4">
                      <Icon className="size-6 shrink-0 text-brass-text" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{s.title}</p>
                        <p className="text-sm text-muted">desde {cop(prices[s.slug] * items[s.slug])}</p>
                      </div>
                      <Stepper slug={s.slug} qty={items[s.slug]} label={s.title} />
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 grid gap-4 border-t border-line pt-5">
                <p className="text-sm text-muted">Opcional: así te respondemos más rápido.</p>
                <label className="grid gap-1.5 text-sm font-medium">
                  Tu nombre
                  <input name="name" maxLength={80} autoComplete="name" className="field" />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Barrio o dirección
                  <input name="place" maxLength={120} autoComplete="street-address" className="field" placeholder={`Barrio en ${site.city}`} />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Detalles
                  <textarea name="note" maxLength={200} rows={2} className="field resize-none" placeholder="Tipo de chapa, marca del carro, hora…" />
                </label>
              </div>
            </div>

            <footer className="border-t border-line bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="text-muted">Total aproximado</span>
                <span className="font-display text-3xl font-extrabold">desde {cop(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">El precio final te lo confirmamos por WhatsApp antes de ir.</p>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25d366] py-3.5 font-semibold text-[#0b2e17] transition hover:brightness-95">
                <WhatsAppIcon className="size-5" /> Enviar cotización por WhatsApp
              </button>
            </footer>
          </form>
        )}
      </div>
    </dialog>
  );
}
