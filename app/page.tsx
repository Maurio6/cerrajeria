import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getPrices } from "@/lib/db";
import { cop, services, site, waLink, type ServiceSlug } from "@/lib/site";
import { ContactForm, ThemeToggle } from "./ui";
import { AddToQuote, QuoteButton, QuoteDialog } from "./cart";
import { Reveal } from "./reveal";
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
  ["¿En qué zonas de Florencia atiende Cerrajería Segurox?", `En ${site.name} prestamos servicio a domicilio en toda ${site.coverage}: centro, norte, sur y barrios cercanos.`],
  ["¿Cuánto se demoran en llegar?", `Normalmente ${site.arrival} dentro de la ciudad. Te confirmamos el tiempo exacto cuando nos escribes.`],
  ["¿Atienden de noche y festivos?", "Sí. Atendemos las 24 horas, todos los días del año. En la noche puede haber un recargo y te lo decimos antes."],
  ["¿Abrir mi carro le hace daño?", "No. Usamos herramientas de apertura que no rompen vidrios ni rayan la pintura."],
  ["¿Pueden hacer la llave de mi moto si no tengo ninguna copia?", "Sí. Hacemos la llave a partir del suiche de la moto. Ten a mano la tarjeta de propiedad."],
  ["¿Cómo puedo pagar?", "En efectivo, Nequi, Daviplata o transferencia, cuando termine el trabajo."],
];

// URL oficial para Google: así el link con ?fbclid=... o el .vercel.app no cuentan como páginas aparte.
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Construye los datos estructurados Schema.org (WebSite, Locksmith y FAQPage). */
function buildJsonLd(prices: Record<ServiceSlug, number>) {
  const businessId = `${site.url}/#business`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        alternateName: site.alternateNames,
        inLanguage: "es-CO",
        publisher: { "@id": businessId },
      },
      {
        "@type": "Locksmith",
        "@id": businessId,
        name: site.name,
        alternateName: site.alternateNames,
        description: site.description,
        url: site.url,
        image: `${site.url}/opengraph-image`,
        telephone: site.phone,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: site.city,
          addressRegion: site.region,
          addressCountry: site.country,
        },
        areaServed: {
          "@type": "City",
          name: site.city,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: site.region,
          },
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59", // así marca Google "24 horas"
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `Servicios de ${site.name}`,
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            priceCurrency: "COP",
            price: prices[s.slug],
            itemOffered: {
              "@type": "Service",
              name: s.title,
              description: s.desc,
            },
          })),
        },
        ...(site.sameAs.length > 0 ? { sameAs: site.sameAs } : {}),
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faq.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: {
            "@type": "Answer",
            text: a,
          },
        })),
      },
    ],
  }).replace(/</g, "\\u003c");
}

// La llave del hero, en bucle: entra una llave en blanco, la cortadora talla los dientes, un brillo
// la recorre, el llavero (con el precio real) se balancea, y sale para dar paso a la siguiente.
// Todo va en un mismo reloj de T segundos dentro del SVG, así nada se desfasa.
const PROFILE = "M290 110 L311 124 L332 110 L353 140 L374 110 L395 130 L416 110 L437 146 L458 110 L479 122 L500 110 L521 136 L542 110 L563 132 L584 110";
const BOW =
  "M110 60 H160 A70 70 0 0 1 230 130 V170 A70 70 0 0 1 160 240 H110 A70 70 0 0 1 40 170 V130 A70 70 0 0 1 110 60 Z M117 150 A22 22 0 1 0 73 150 A22 22 0 1 0 117 150 Z";
const BLADE = `M226 120 H262 V108 H276 V110 H290 ${PROFILE.slice(9)} H592 L622 140 V168 L604 180 H276 V192 H262 V180 H226 Z`;
const TEETH = Array.from({ length: 20 }, (_, i) => {
  const p = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r - 34).toFixed(1)}`;
  };
  const a = i * 18;
  return `M${p(a - 6, 33)} L${p(a, 40)} L${p(a + 6, 33)} Z`;
}).join(" ");

const T = 7; // segundos por ciclo
const CUT = [0.5, 2.3] as const; // la cortadora entra y sale
const loop = { dur: `${T}s`, repeatCount: "indefinite" } as const;
const kt = (...s: number[]) => s.map((x) => (x / T).toFixed(4)).join(";");

// La cortadora sigue el perfil por distancia recorrida, pero el corte avanza parejo en x.
// Para que coincidan, a cada vértice le damos el instante que le toca según su x.
const PTS = PROFILE.slice(1).split(" L").map((p) => p.split(" ").map(Number));
const LEN = PTS.map((_, i) => PTS.slice(1, i + 1).reduce((d, [x, y], j) => d + Math.hypot(x - PTS[j][0], y - PTS[j][1]), 0));
const [X0, X1] = [PTS[0][0], PTS.at(-1)![0]];
const MOTION = {
  keyPoints: ["0", ...LEN.map((l) => (l / LEN.at(-1)!).toFixed(4)), "1"].join(";"),
  keyTimes: kt(0, ...PTS.map(([x]) => CUT[0] + ((x - X0) / (X1 - X0)) * (CUT[1] - CUT[0])), T),
};
const CUT_TIMES = kt(0, CUT[0], CUT[1], T);

function HeroKey({ price }: { price: string }) {
  return (
    <svg viewBox="-40 30 680 390" className="h-auto w-full" role="img" aria-label={`Llave de latón recién cortada. Copias desde ${price}`}>
      <defs>
        <path id="k-bow" d={BOW} fillRule="evenodd" />
        <path id="k-blade" d={BLADE} />
        <linearGradient id="k-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        {/* mismo brillo para la hoja y el material sin cortar, así no se nota la diferencia */}
        <linearGradient id="k-sheen-blade" gradientUnits="userSpaceOnUse" x1="0" y1="108" x2="0" y2="192">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id="k-glint" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="k-shape">
          <use href="#k-bow" />
          <use href="#k-blade" />
        </clipPath>
        {/* lo que falta por cortar: todo lo que está a la derecha de la cortadora */}
        <clipPath id="k-stock-clip">
          <rect x={X0} y="0" width="400" height="300">
            <animate attributeName="x" values={`${X0};${X0};${X1};${X1}`} keyTimes={CUT_TIMES} {...loop} />
          </rect>
        </clipPath>
        <filter id="k-shadow" x="-10%" y="-20%" width="120%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000" floodOpacity=".2" />
        </filter>
      </defs>

      {/* cada ciclo: entra subiendo, se queda, y sale hacia arriba */}
      <g className="key-loop">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes={kt(0, 0.5, T - 0.5, T)} {...loop} />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 16;0 0;0 0;0 -12"
          keyTimes={kt(0, 0.5, T - 0.5, T)}
          calcMode="spline"
          keySplines=".2 .8 .2 1;0 0 1 1;.5 0 .9 .5"
          {...loop}
        />

        {/* argolla: pasa por detrás de la cabeza y se ve por el hueco */}
        <circle cx="70" cy="200" r="56" fill="none" stroke="var(--muted)" strokeWidth="6" />
        <circle cx="70" cy="200" r="56" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1.5" />

        <g filter="url(#k-shadow)">
          <use href="#k-bow" fill="var(--brass)" stroke="var(--brass-dark)" strokeWidth="1.5" />
          <use href="#k-blade" fill="var(--brass)" stroke="var(--brass-dark)" strokeWidth="1.5" />
          <use href="#k-bow" fill="url(#k-sheen)" />
          <use href="#k-blade" fill="url(#k-sheen-blade)" />
          {/* relieve en la cabeza: marco y la marca del negocio */}
          <rect x="56" y="76" width="158" height="148" rx="56" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="2" />
          <g fill="var(--brass-dark)" opacity=".55">
            <circle cx="172" cy="143" r="11" />
            <path d="M166 150 L162 172 H182 L178 150 Z" />
          </g>
          {/* canal fresado de la hoja */}
          <path d="M300 154 H594 V161 H300 Z" fill="#000" opacity=".16" />
          <path d="M300 165 H590" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />
          {/* material sin cortar: desaparece detrás de la cortadora */}
          <g className="key-stock" clipPath="url(#k-stock-clip)">
            <path d={`${PROFILE} Z`} fill="var(--brass)" />
            <path d={`${PROFILE} Z`} fill="url(#k-sheen-blade)" />
            <path d={`M${X0} 110 H${X1}`} stroke="var(--brass-dark)" strokeWidth="1.5" />
          </g>
        </g>

        {/* cortadora */}
        <g className="key-cutter" opacity="0">
          <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={kt(0, CUT[0], CUT[0] + 0.15, CUT[1], CUT[1] + 0.4, T)} {...loop} />
          <animateMotion path={PROFILE} keyPoints={MOTION.keyPoints} keyTimes={MOTION.keyTimes} calcMode="linear" {...loop} />
          <rect x="-5" y="-130" width="10" height="96" rx="3" fill="var(--muted)" opacity=".45" />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 0 -34;0 0 -34;-1440 0 -34;-1440 0 -34" keyTimes={CUT_TIMES} {...loop} />
            <circle cx="0" cy="-34" r="34" fill="var(--muted)" />
            <path d={TEETH} fill="var(--muted)" />
            <circle cx="0" cy="-34" r="22" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1.5" />
            <path d="M0 -56 V-12 M-22 -34 H22" stroke="#fff" strokeOpacity=".2" strokeWidth="2" />
            <circle cx="0" cy="-34" r="7" fill="var(--surface)" />
          </g>
          {/* virutas (solo se ven mientras la cortadora está visible) */}
          {[0, 0.17, 0.33].map((d, i) => (
            <circle key={d} cx={i * 4 - 4} cy="2" r="2.2" fill="var(--brass)">
              <animate attributeName="cy" values="2;30" dur="0.5s" begin={`${d}s`} repeatCount="indefinite" />
              <animate attributeName="cx" values={`${i * 4 - 4};${i * 9 - 9}`} dur="0.5s" begin={`${d}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="0.5s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        {/* brillo que recorre la llave terminada */}
        <g clipPath="url(#k-shape)" className="key-glint">
          <rect x="-160" y="20" width="120" height="280" fill="url(#k-glint)" transform="skewX(-20)">
            <animate attributeName="x" values="-160;-160;760;760" keyTimes={kt(0, 2.4, 3.3, T)} {...loop} />
          </rect>
        </g>

        {/* llavero con el precio: se balancea cuando la cortadora suelta la llave */}
        <g transform="translate(70 256)">
          <g className="key-tag">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0;0;14;-7;3;0;0"
              keyTimes={kt(0, CUT[1], 2.65, 3.05, 3.45, 3.85, T)}
              calcMode="spline"
              keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;0 0 1 1"
              {...loop}
            />
            <path d="M0 0 V14" stroke="var(--muted)" strokeWidth="3" />
            <rect x="-78" y="14" width="156" height="132" rx="14" fill="var(--sunk)" stroke="var(--line)" strokeWidth="2" />
            <circle cx="0" cy="34" r="8" fill="var(--surface)" stroke="var(--muted)" strokeWidth="2.5" />
            <text x="0" y="76" textAnchor="middle" fill="var(--ink)" fontSize="17" style={{ fontFamily: "var(--font-schibsted)" }}>
              Copias desde
            </text>
            <text x="0" y="120" textAnchor="middle" fill="var(--brass-text)" fontSize="38" fontWeight="800" style={{ fontFamily: "var(--font-shoulders)" }}>
              {price}
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default async function Home() {
  const prices = await cachedPrices();
  const jsonLd = buildJsonLd(prices);

  return (
    <div className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <nav aria-label="Navegación principal" className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          {/* el nombre pasa a dos líneas solo en celulares muy angostos */}
          <a href="#" className="flex items-center gap-2.5 font-display text-2xl leading-none font-extrabold tracking-tight">
            <Logo className="size-8 shrink-0" /> {site.name}
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
            <h1 className="mt-5 font-display text-[3.4rem] leading-[0.94] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-[5.8rem]">
              <span className="mb-2 block text-[0.42em] tracking-normal text-brass-text uppercase">
                {site.name}
              </span>
              Cerrajero a domicilio en {site.city}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              En <strong className="font-semibold text-ink">{site.name}</strong> duplicamos llaves, cambiamos guardas, instalamos chapas y abrimos carros y motos en {site.coverage}. Llegamos en {site.arrival}, de día o de noche.
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
              <h2 className="rv-title font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><span>¿Qué te pasó?</span></h2>
              <p className="rv mt-3 text-muted" style={{ "--i": 1 } as React.CSSProperties}>Elige tu caso y se abre WhatsApp con el mensaje ya escrito.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cases.map(({ icon: Icon, text, msg }, i) => (
                <div key={text} className="rv" style={{ "--i": (i % 4) + 1 } as React.CSSProperties}>
                <a
                  href={waLink(msg)}
                  target="_blank"
                  rel="noopener"
                  className="group flex h-full items-center gap-4 rounded-xl border border-line bg-bg p-4 transition hover:border-brass sm:flex-col sm:items-start sm:p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface text-brass-text ring-1 ring-line transition group-hover:bg-brass group-hover:text-on-brass group-hover:ring-brass">
                    <Icon />
                  </span>
                  <span className="font-medium leading-snug">{text}</span>
                </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section id="servicios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 className="rv-title font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><span>Servicios y precios</span></h2>
            <p className="rv max-w-sm text-sm text-muted md:text-right" style={{ "--i": 1 } as React.CSSProperties}>
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
                  style={{ "--i": (i % 3) + 1 } as React.CSSProperties}
                  className={`rv flex flex-col rounded-2xl border border-line bg-surface p-6 ${featured ? "md:col-span-2 lg:col-span-1 lg:row-span-2 lg:p-8" : ""}`}
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
            <h2 className="rv-title font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><span>Cómo trabajamos</span></h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map(([t, d], i) => (
                <li key={t} className="relative pl-6 md:pt-6 md:pl-0">
                  <span aria-hidden className="rv-bar absolute top-0 left-0 h-full w-0.5 origin-top bg-brass md:h-0.5 md:w-full md:origin-left" style={{ "--i": i } as React.CSSProperties} />
                  <span className="rv block font-display text-6xl leading-none font-extrabold text-brass" style={{ "--i": i * 3 } as React.CSSProperties}>{i + 1}</span>
                  <h3 className="rv mt-3 text-xl font-semibold" style={{ "--i": i * 3 + 1 } as React.CSSProperties}>{t}</h3>
                  <p className="rv mt-2 max-w-xs opacity-75" style={{ "--i": i * 3 + 2 } as React.CSSProperties}>{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Preguntas */}
        <section id="preguntas" className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <h2 className="rv-title font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><span>Preguntas frecuentes</span></h2>
            <p className="rv mt-3 text-muted" style={{ "--i": 1 } as React.CSSProperties}>
              ¿Tienes otra duda? <a href={waLink()} target="_blank" rel="noopener" className="font-semibold text-brass-text underline underline-offset-4">Pregúntanos por WhatsApp</a>.
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {faq.map(([q, a], i) => (
              <details key={q} className="rv group" style={{ "--i": i + 1 } as React.CSSProperties}>
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
              <h2 className="rv-title font-display text-4xl font-extrabold tracking-tight sm:text-5xl"><span>Escríbenos</span></h2>
              <p className="rv mt-3 max-w-md text-muted" style={{ "--i": 1 } as React.CSSProperties}>
                Contacta directamente a {site.name} en {site.coverage} para pedir un servicio, cotizar o dejar una queja. Leemos todos los mensajes.
              </p>
              <dl className="rv mt-10 grid gap-6" style={{ "--i": 2 } as React.CSSProperties}>
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
            <div className="rv" style={{ "--i": 1 } as React.CSSProperties}>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2"><Logo className="size-6" /> {site.name} · {site.coverage}</p>
          <p>{site.hours}</p>
        </div>
      </footer>

      <QuoteDialog prices={prices} />
      <Reveal />

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
