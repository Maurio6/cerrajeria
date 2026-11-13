// Datos del negocio: centralizados aquí para toda la web, metadatos y Schema.org.
const fallbackUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.cerrajeriasegurox.com";

const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : fallbackUrl);

export const site = {
  name: "Cerrajería Segurox",
  alternateNames: ["Segurox", "Cerrajeria Segurox", "Cerrajería Segurox Florencia"],
  city: "Florencia",
  region: "Caquetá",
  country: "CO",
  coverage: "Florencia, Caquetá",
  whatsapp: "573232483692", // con indicativo, sin + ni espacios
  phone: "+573232483692",
  phoneDisplay: "323 248 3692",
  hours: "Todos los días, 24 horas", // si lo cambias, cambia también el horario del jsonLd en app/page.tsx
  arrival: "unos 30 minutos",
  description:
    "Cerrajería Segurox en Florencia, Caquetá. Cerrajero a domicilio 24 horas: copias de llaves, cambio de guardas, chapas, apertura de carros y llaves de motos.",
  // Dominio público: prioridad a env explícito, luego Vercel, luego dominio de producción.
  url: rawUrl.replace(/\/$/, ""),
  sameAs: [] as string[],
};

export const services = [
  {
    slug: "llaves",
    title: "Duplicado y elaboración de llaves",
    desc: "Copias exactas en el momento, o una llave nueva aunque no tengas la original.",
    details: ["Llaves de casa y oficina", "Llaves de seguridad y multipunto", "Candados y archivadores"],
    defaultPrice: 3000,
  },
  {
    slug: "guardas",
    title: "Cambio de guardas",
    desc: "Si perdiste las llaves o te mudaste, cambiamos la guarda de cualquier chapa.",
    details: [],
    defaultPrice: 30000,
  },
  {
    slug: "instalacion",
    title: "Instalación de chapas",
    desc: "Chapas para alcobas, puertas principales y chapas de seguridad.",
    details: [],
    defaultPrice: 50000,
  },
  {
    slug: "carros",
    title: "Apertura de carros",
    desc: "Abrimos tu carro sin romper vidrios ni dañar la puerta.",
    details: [],
    defaultPrice: 30000,
  },
  {
    slug: "motos",
    title: "Llaves para motos",
    desc: "Hacemos la llave de tu moto, también si se te perdió la única.",
    details: [],
    defaultPrice: 40000,
  },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

export const waLink = (text = "Hola, necesito un cerrajero") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
