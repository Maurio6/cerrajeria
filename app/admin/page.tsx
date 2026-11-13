import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPrices, listRequests, type Status } from "@/lib/db";
import { services } from "@/lib/site";
import { logout, setPrice, setStatus } from "@/app/actions";
import { ThemeToggle } from "@/app/ui";
import { Logo, WhatsAppIcon, serviceIcons } from "@/app/icons";

const TYPE_LABEL = { solicitud: "Solicitud", queja: "Queja", otro: "Otro" } as const;
const STATUS_LABEL: Record<Status, string> = { nuevo: "Nuevo", en_proceso: "En proceso", resuelto: "Resuelto" };
const STATUS_ACTION: Record<Status, string> = { nuevo: "Volver a nuevo", en_proceso: "Marcar en proceso", resuelto: "Marcar resuelto" };
const STATUS_STYLE: Record<Status, string> = {
  nuevo: "bg-brass text-on-brass",
  en_proceso: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  resuelto: "bg-green-500/15 text-green-700 dark:text-green-300",
};
const TYPE_STRIPE = { solicitud: "border-l-brass", queja: "border-l-red-500", otro: "border-l-muted" } as const;

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Cargando…</p>}>
      <Panel searchParams={searchParams} />
    </Suspense>
  );
}

async function Panel({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  if (!(await isAdmin())) redirect("/admin/login");
  const sp = await searchParams;
  const type = typeof sp.type === "string" && sp.type in TYPE_LABEL ? sp.type : undefined;
  const status = typeof sp.status === "string" && sp.status in STATUS_LABEL ? sp.status : undefined;
  const [all, prices] = await Promise.all([listRequests(), getPrices()]);
  const requests = all.filter((r) => (!type || r.type === type) && (!status || r.status === status));

  const counts = [
    ["Nuevos", all.filter((r) => r.status === "nuevo").length],
    ["En proceso", all.filter((r) => r.status === "en_proceso").length],
    ["Quejas abiertas", all.filter((r) => r.type === "queja" && r.status !== "resuelto").length],
  ] as const;

  const href = (k: "type" | "status", v?: string) => {
    const q = new URLSearchParams({ ...(type && { type }), ...(status && { status }) });
    if (v) q.set(k, v);
    else q.delete(k);
    return `/admin${q.size ? `?${q}` : ""}`;
  };
  const chip = (active: boolean) =>
    `shrink-0 rounded-lg border px-3 py-1.5 text-sm transition ${active ? "border-ink bg-ink font-semibold text-bg" : "border-line hover:border-muted"}`;

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Logo className="size-8" />
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Panel</h1>
          <div className="ml-auto flex items-center gap-2 text-sm sm:gap-4">
            <Link href="/" className="text-muted hover:text-ink">Ver la web</Link>
            <form action={logout}><button className="text-muted hover:text-ink">Salir</button></form>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <dl className="grid grid-cols-3 gap-2 sm:gap-4">
          {counts.map(([label, n]) => (
            <div key={label} className="rounded-xl border border-line bg-surface p-3 sm:p-5">
              <dt className="text-xs text-muted sm:text-sm">{label}</dt>
              <dd className="mt-1 font-display text-4xl font-extrabold sm:text-5xl">{n}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-10">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Mensajes</h2>
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={href("type")} className={chip(!type)}>Todos</Link>
            {Object.entries(TYPE_LABEL).map(([k, l]) => (
              <Link key={k} href={href("type", k)} className={chip(type === k)}>{l}</Link>
            ))}
          </div>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={href("status")} className={chip(!status)}>Cualquier estado</Link>
            {Object.entries(STATUS_LABEL).map(([k, l]) => (
              <Link key={k} href={href("status", k)} className={chip(status === k)}>{l}</Link>
            ))}
          </div>

          <ul className="mt-6 grid gap-3">
            {requests.length === 0 && (
              <li className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
                {all.length === 0 ? "Todavía no llegan mensajes. Cuando alguien use el formulario de la web, aparece aquí." : "Ningún mensaje coincide con estos filtros."}
              </li>
            )}
            {requests.map((r) => {
              const wa = `https://wa.me/${r.phone.replace(/\D/g, "").replace(/^(?=3\d{9}$)/, "57")}`;
              return (
                <li key={r.id} className={`rounded-xl border border-l-4 border-line bg-surface p-4 sm:p-5 ${TYPE_STRIPE[r.type]}`}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                    <span className="font-semibold">{TYPE_LABEL[r.type]}</span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                    {r.service && <span className="text-muted">{services.find((s) => s.slug === r.service)?.title ?? r.service}</span>}
                    <time className="w-full text-muted sm:ml-auto sm:w-auto">
                      {new Date(r.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" })}
                    </time>
                  </div>
                  <p className="mt-3 text-lg font-semibold">{r.name}</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted">{r.message}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a href={wa} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-lg bg-[#25d366] px-3 py-1.5 text-sm font-semibold text-[#0b2e17]">
                      <WhatsAppIcon className="size-4" /> {r.phone}
                    </a>
                    {(Object.keys(STATUS_LABEL) as Status[])
                      .filter((s) => s !== r.status)
                      .map((s) => (
                        <form key={s} action={setStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={s} />
                          <button className="rounded-lg border border-line px-3 py-1.5 text-sm transition hover:border-ink">{STATUS_ACTION[s]}</button>
                        </form>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Precios</h2>
          <p className="mt-1 text-sm text-muted">El precio &quot;desde&quot; de cada servicio, en pesos. Al guardarlo se actualiza en la web.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {services.map((s) => {
              const Icon = serviceIcons[s.slug];
              return (
                <form key={s.slug} action={setPrice} className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[auto_1fr_auto_auto]">
                  <Icon className="size-6 text-brass-text" />
                  <span className="text-sm font-semibold">{s.title}</span>
                  <input type="hidden" name="slug" value={s.slug} />
                  <div className="col-span-2 flex gap-2 sm:col-span-2">
                    <input
                      name="price"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1000}
                      defaultValue={prices[s.slug]}
                      aria-label={`Precio de ${s.title}`}
                      className="field min-w-0 flex-1 py-2 sm:w-28 sm:flex-none"
                    />
                    <button className="rounded-lg bg-brass px-4 text-sm font-semibold text-on-brass transition hover:bg-brass-dark hover:text-white">Guardar</button>
                  </div>
                </form>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
