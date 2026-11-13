import { cacheLife, cacheTag } from "next/cache";
import { getPrices } from "@/lib/db";
import { cop, services, site, waLink } from "@/lib/site";
import { ContactForm, ThemeToggle } from "./ui";
import { AddToQuote, QuoteButton, QuoteDialog } from "./cart";
import {
  CarIcon, DoorIcon, Logo, PhoneIcon, PlusIcon, SearchKeyIcon, ShieldIcon, WhatsAppIcon, serviceIcons,
} from "./icons";

async function cachedPrices() {
  "use cache";
  cacheLife("max");
  cacheTag("prices");
  return getPrices();
}

const cases = [
  { icon: DoorIcon, text: "Me quedé por fuera de la casa", msg: "Hola, me quedé por fuera de la casa. ¿Pueden venir a abrir?" },
  { icon: SearchKeyIcon, text: "Perdí las llaves", msg: "Hola, perdí las llaves y necesito cambiar la guarda o hacer una llave nueva." },
  { icon: CarIcon, text: "Dejé las llaves dentro del carro", msg: "Hola, dejé las llaves dentro del carro. ¿Pueden venir a abrirlo?" },
  { icon: ShieldIcon, text: "Quiero una chapa más segura", msg: "Hola, quiero instalar una chapa de seguridad. ¿Me cotizan?" },
];

const steps = [
  ["Nos cuentas qué pasó", "Por llamada, WhatsApp o con el formulario. Si puedes, mándanos una foto de la chapa."],
  ["Te decimos el precio", "Antes de salir ya sabes cuánto cuesta. Sin cobros sorpresa al terminar."],
  ["Llegamos y lo resolvemos", `En ${site.arrival} estamos donde estés. Pagas cuando el trabajo esté listo.`],
];

const faq = [
  ["¿Cuánto se demoran en llegar?", `Normalmente ${site.arrival} dentro de la ciudad. Te confirmamos el tiempo exacto cuando nos escribes.`],
  ["¿Atienden de noche y festivos?", "Sí. Atendemos las 24 horas, todos los días del año. En la noche puede haber un recargo y te lo decimos antes."],
  ["¿Abrir mi carro le hace daño?", "No. Usamos herramientas de apertura que no rompen vidrios ni rayan la pintura."],
  ["¿Pueden hacer la llave de mi moto si no tengo ninguna copia?", "Sí. Hacemos la llave a partir del suiche de la moto. Ten a mano la tarjeta de propiedad."],
  ["¿Cómo puedo pagar?", "En efectivo, Nequi, Daviplata o transferencia, cuando termine el trabajo."],
];

// La llave del hero: los dientes se cortan al cargar y del llavero cuelga el precio real.
function HeroKey({ price }: { price: string }) {
  const cuts = [
    [262, 20], [304, 32], [346, 14], [388, 28], [430, 22], [472, 36], [514, 16],
  ];
  return (
    <svg viewBox="-50 10 700 410" className="h-auto w-full" role="img" aria-label={`Llave de latón. Copias desde ${price}`}>
      {/* llave */}
      <g>
        <circle cx="150" cy="150" r="96" fill="var(--brass)" />
        <circle cx="150" cy="150" r="72" fill="none" stroke="var(--brass-dark)" strokeWidth="3" opacity=".55" />
        <circle cx="104" cy="150" r="20" fill="var(--surface)" />
        <rect x="236" y="116" width="26" height="68" rx="4" fill="var(--brass)" />
        <path d="M250 128 H580 L612 150 L580 172 H250 Z" fill="var(--brass)" />
        <path d="M272 145 H566" stroke="var(--brass-dark)" strokeWidth="5" strokeLinecap="round" opacity=".7" />
        {cuts.map(([x, d], i) => (
          <path
            key={x}
            className="key-cut"
            style={{ "--i": i } as React.CSSProperties}
            d={`M${x - 21} 173 L${x} ${172 - d} L${x + 21} 173 Z`}
            fill="var(--surface)"
          />
        ))}
      </g>
      {/* argolla (pasa por el hueco de la llave) y llavero */}
      <circle cx="80" cy="190" r="47" fill="none" stroke="var(--muted)" strokeWidth="5" />
      <g transform="translate(80 237)">
        <g className="key-tag">
          <path d="M0 0 V16" stroke="var(--muted)" strokeWidth="3" />
          <rect x="-78" y="16" width="156" height="136" rx="14" fill="var(--sunk)" stroke="var(--line)" strokeWidth="2" />
          <circle cx="0" cy="36" r="7" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
          <text x="0" y="78" textAnchor="middle" fill="var(--ink)" fontSize="17" style={{ fontFamily: "var(--font-schibsted)" }}>
            Copias desde
          </text>
          <text x="0" y="122" textAnchor="middle" fill="var(--brass-text)" fontSize="38" fontWeight="800" style={{ fontFamily: "var(--font-shoulders)" }}>
            {price}
          </text>
        </g>
      </g>
    </svg>
  );
}

export default async function Home() {
  const prices = await cachedPrices();

  return (
    <div className="pb-20 md:pb-0">
      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight whitespace-nowrap">
            <Logo className="size-8" /> {site.name}
          </a>
          <div className="ml-auto hidden items-center gap-6 text-sm whitespace-nowrap text-muted lg:flex">
            <a href="#servicios" className="transition hover:text-ink">Servicios y precios</a>
            <a href="#como" className="transition hover:text-ink">Cómo trabajamos</a>
            <a href="#preguntas" className="transition hover:text-ink">Preguntas</a>
            <a href="#contacto" className="transition hover:text-ink">Contacto</a>
          </div>
          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <QuoteButton />
            <ThemeToggle />
            <a
              href={`tel:${site.phone}`}
              className="hidden items-center gap-2 rounded-lg bg-brass px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-on-brass transition hover:bg-brass-dark hover:text-white sm:flex"
            >
              <PhoneIcon className="size-4" /> {site.phoneDisplay}
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pt-20 lg:pb-24">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
              </span>
              Atendiendo ahora en {site.city}, {site.region}
            </p>
            <h1 className="mt-5 font-display text-[3.6rem] leading-[0.92] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-[6.2rem]">
              Cerrajero a domicilio en {site.city}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Duplicamos llaves, cambiamos guardas, instalamos chapas y abrimos carros y motos. Llegamos en {site.arrival}, de día o de noche.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={`tel:${site.phone}`} className="flex items-center justify-center gap-2 rounded-lg bg-brass px-6 py-3.5 font-semibold text-on-brass transition hover:bg-brass-dark hover:text-white">
                <PhoneIcon className="size-5" /> Llamar al {site.phoneDisplay}
              </a>
              <a href={waLink()} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-lg border border-ink/80 px-6 py-3.5 font-semibold transition hover:bg-ink hover:text-bg">
                <WhatsAppIcon className="size-5" /> Escribir por WhatsApp
              </a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl rounded-[28px] border border-line bg-surface px-4 pt-8 pb-2 sm:px-8">
            <HeroKey price={cop(prices.llaves)} />
          </div>
        </section>

        {/* Casos */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">¿Qué te pasó?</h2>
              <p className="mt-3 text-muted">Elige tu caso y se abre WhatsApp con el mensaje ya escrito.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cases.map(({ icon: Icon, text, msg }) => (
                <a
                  key={text}
                  href={waLink(msg)}
                  target="_blank"
                  rel="noopener"
                  className="group flex items-center gap-4 rounded-xl border border-line bg-bg p-4 transition hover:border-brass sm:flex-col sm:items-start sm:p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface text-brass-text ring-1 ring-line transition group-hover:bg-brass group-hover:text-on-brass group-hover:ring-brass">
                    <Icon />
                  </span>
                  <span className="font-medium leading-snug">{text}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section id="servicios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Servicios y precios</h2>
            <p className="max-w-sm text-sm text-muted md:text-right">
              Agrega lo que necesites y envíanos la cotización por WhatsApp. Son precios de referencia: el valor final te lo confirmamos antes de empezar.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = serviceIcons[s.slug];
              const featured = i === 0;
              return (
                <article
                  key={s.slug}
                  className={`flex flex-col rounded-2xl border border-line bg-surface p-6 ${featured ? "md:col-span-2 lg:col-span-1 lg:row-span-2 lg:p-8" : ""}`}
                >
                  <Icon className={featured ? "size-10 text-brass-text" : "size-7 text-brass-text"} />
                  <h3 className={`mt-5 font-display font-bold tracking-tight ${featured ? "text-4xl leading-none" : "text-2xl"}`}>{s.title}</h3>
                  <p className="mt-2 text-muted">{s.desc}</p>
                  {s.details.length > 0 && (
                    <ul className="mt-6 grid gap-2.5 border-t border-line pt-6 text-sm">
                      {s.details.map((d) => (
                        <li key={d} className="flex gap-2.5">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brass" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                    <span className="tag">
                      <span className="text-muted">desde</span>
                      <strong className="font-display text-xl font-bold">{cop(prices[s.slug])}</strong>
                    </span>
                    <AddToQuote slug={s.slug} title={s.title} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Cómo trabajamos */}
        <section id="como" className="bg-[#15202b] text-[#e8ecf0] dark:bg-sunk">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Cómo trabajamos</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map(([t, d], i) => (
                <li key={t} className="relative border-l-2 border-brass pl-6 md:border-t-2 md:border-l-0 md:pt-6 md:pl-0">
                  <span className="font-display text-6xl leading-none font-extrabold text-brass">{i + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold">{t}</h3>
                  <p className="mt-2 max-w-xs opacity-75">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Preguntas */}
        <section id="preguntas" className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Preguntas frecuentes</h2>
            <p className="mt-3 text-muted">
              ¿Tienes otra duda? <a href={waLink()} target="_blank" rel="noopener" className="font-semibold text-brass-text underline underline-offset-4">Pregúntanos por WhatsApp</a>.
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {faq.map(([q, a]) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium">
                  {q}
                  <PlusIcon className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="max-w-prose pb-6 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="border-t border-line bg-sunk/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Escríbenos</h2>
              <p className="mt-3 max-w-md text-muted">
                Para pedir un servicio, dejar una queja o cualquier otra cosa. Leemos todos los mensajes.
              </p>
              <dl className="mt-10 grid gap-6">
                <div>
                  <dt className="text-sm text-muted">Teléfono y WhatsApp</dt>
                  <dd className="mt-1">
                    <a href={`tel:${site.phone}`} className="font-display text-4xl font-bold tracking-tight hover:text-brass-text">{site.phoneDisplay}</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Horario</dt>
                  <dd className="mt-1 text-lg">{site.hours}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Dónde atendemos</dt>
                  <dd className="mt-1 text-lg">{site.coverage}</dd>
                </div>
              </dl>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2"><Logo className="size-6" /> {site.name}, cerrajería en {site.city}</p>
          <p>{site.hours}</p>
        </div>
      </footer>

      <QuoteDialog prices={prices} />

      {/* Barra de acción en celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-bg/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <a href={`tel:${site.phone}`} className="flex items-center justify-center gap-2 rounded-lg bg-brass py-3 font-semibold text-on-brass">
          <PhoneIcon className="size-5" /> Llamar
        </a>
        <a href={waLink()} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-lg bg-ink py-3 font-semibold text-bg">
          <WhatsAppIcon className="size-5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
