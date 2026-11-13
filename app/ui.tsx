"use client";

import { useActionState } from "react";
import { submitRequest, type FormState } from "./actions";
import { services, waLink } from "@/lib/site";
import { MoonIcon, SunIcon } from "./icons";

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const current = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar entre tema claro y oscuro"
      title="Cambiar tema"
      className="grid size-10 place-items-center rounded-full border border-line text-ink transition hover:border-brass hover:text-brass-text"
    >
      <MoonIcon className="size-5 dark:hidden" />
      <SunIcon className="hidden size-5 dark:block" />
    </button>
  );
}

const TYPES = [
  ["solicitud", "Pedir un servicio"],
  ["queja", "Poner una queja"],
  ["otro", "Otra cosa"],
] as const;

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitRequest, null);

  if (state?.ok)
    return (
      <div role="status" className="pop rounded-2xl border border-line bg-surface p-8 sm:p-10">
        <p className="font-display text-4xl font-bold">Mensaje enviado</p>
        <p className="mt-3 max-w-md text-muted">
          Ya lo recibimos y te contactamos pronto por teléfono o WhatsApp. Si es una urgencia, escríbenos directamente.
        </p>
        <a href={waLink()} target="_blank" rel="noopener" className="mt-6 inline-block font-semibold text-brass-text underline underline-offset-4">
          Abrir WhatsApp
        </a>
      </div>
    );

  return (
    <form action={action} className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-8">
      <fieldset>
        <legend className="mb-2.5 text-sm font-medium">¿Qué necesitas?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TYPES.map(([v, label], i) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="type" value={v} defaultChecked={i === 0} className="peer sr-only" />
              <span className="block rounded-lg border border-line px-3 py-2.5 text-center text-sm transition peer-checked:border-ink peer-checked:bg-ink peer-checked:font-semibold peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-brass hover:border-muted">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Tu nombre
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" className="field" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Teléfono o WhatsApp
          <input name="phone" type="tel" inputMode="tel" required maxLength={20} autoComplete="tel" className="field" placeholder="300 000 0000" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium">
        <span>Servicio <span className="font-normal text-muted">(opcional)</span></span>
        <select name="service" className="field" defaultValue="">
          <option value="">No estoy seguro</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>{s.title}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Mensaje
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={1000}
          rows={4}
          className="field resize-y"
          placeholder="Qué pasó, en qué barrio estás y a qué hora te sirve."
        />
      </label>

      {/* honeypot anti-spam: oculto para personas */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state && !state.ok && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{state.msg}</p>}

      <button
        disabled={pending}
        className="rounded-lg bg-brass px-6 py-3.5 font-semibold text-on-brass transition hover:bg-brass-dark hover:text-white active:translate-y-px disabled:opacity-60 sm:justify-self-start"
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
