"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/actions";
import { ThemeToggle } from "@/app/ui";
import { Logo } from "@/app/icons";

export default function Login() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <main className="relative grid min-h-svh place-items-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <form action={action} className="grid w-full max-w-sm gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <Logo className="size-10" />
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Panel del negocio</h1>
          <p className="mt-1 text-sm text-muted">Entra para ver solicitudes, quejas y precios.</p>
        </div>
        <label className="grid gap-1.5 text-sm font-medium">
          Contraseña
          <input name="password" type="password" required autoFocus autoComplete="current-password" className="field" />
        </label>
        {state && !state.ok && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{state.msg}</p>}
        <button disabled={pending} className="rounded-lg bg-brass py-3 font-semibold text-on-brass transition hover:bg-brass-dark hover:text-white disabled:opacity-60">
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
