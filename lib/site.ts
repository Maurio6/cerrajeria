// Datos del negocio: cambia todo aquí (placeholders por ahora).
export const site = {
  name: "Llaves Express",
  city: "Florencia",
  region: "Caquetá",
  coverage: "Florencia, Caquetá",
  whatsapp: "573232483692", // con indicativo, sin + ni espacios
  phone: "+573232483692",
  phoneDisplay: "323 248 3692",
  hours: "Todos los días, 24 horas",
  arrival: "unos 30 minutos",
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
