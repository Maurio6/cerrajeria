import { neon } from "@neondatabase/serverless";
import { services } from "./site";

export type RequestType = "solicitud" | "queja" | "otro";
export type Status = "nuevo" | "en_proceso" | "resuelto";
export type Req = {
  id: number;
  type: RequestType;
  name: string;
  phone: string;
  service: string;
  message: string;
  status: Status;
  created_at: string;
};

const url = process.env.DATABASE_URL;
const sql = url ? neon(url) : null;

// ponytail: sin DATABASE_URL (solo en dev) se usa memoria para poder probar; se borra al reiniciar.
const g = globalThis as unknown as { __mem?: { requests: Req[]; prices: Record<string, number>; nextId: number } };
const mem = (g.__mem ??= { requests: [], prices: {}, nextId: 1 });
const memOk = () => {
  if (process.env.NODE_ENV === "production") throw new Error("Falta DATABASE_URL");
};

let ready: Promise<unknown> | null = null;
function ensureSchema() {
  if (!sql) return;
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'nuevo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS prices (slug TEXT PRIMARY KEY, price_from INT NOT NULL)`;
  })();
  return ready;
}

export async function getPrices(): Promise<Record<string, number>> {
  const out: Record<string, number> = Object.fromEntries(services.map((s) => [s.slug, s.defaultPrice]));
  if (!sql) return { ...out, ...mem.prices };
  await ensureSchema();
  for (const r of await sql`SELECT slug, price_from FROM prices`) out[r.slug] = r.price_from;
  return out;
}

export async function savePrice(slug: string, price: number) {
  if (!sql) {
    memOk();
    return void (mem.prices[slug] = price);
  }
  await ensureSchema();
  await sql`INSERT INTO prices (slug, price_from) VALUES (${slug}, ${price})
    ON CONFLICT (slug) DO UPDATE SET price_from = EXCLUDED.price_from`;
}

export async function addRequest(r: Pick<Req, "type" | "name" | "phone" | "service" | "message">) {
  if (!sql) {
    memOk();
    mem.requests.unshift({ ...r, id: mem.nextId++, status: "nuevo", created_at: new Date().toISOString() });
    return;
  }
  await ensureSchema();
  await sql`INSERT INTO requests (type, name, phone, service, message)
    VALUES (${r.type}, ${r.name}, ${r.phone}, ${r.service}, ${r.message})`;
}

export async function listRequests(type?: string, status?: string): Promise<Req[]> {
  if (!sql) {
    memOk();
    return mem.requests.filter((r) => (!type || r.type === type) && (!status || r.status === status));
  }
  await ensureSchema();
  return (await sql`SELECT * FROM requests
    WHERE (${type ?? null}::text IS NULL OR type = ${type ?? null})
      AND (${status ?? null}::text IS NULL OR status = ${status ?? null})
    ORDER BY created_at DESC LIMIT 500`) as Req[];
}

export async function saveStatus(id: number, status: Status) {
  if (!sql) {
    memOk();
    const r = mem.requests.find((x) => x.id === id);
    if (r) r.status = status;
    return;
  }
  await ensureSchema();
  await sql`UPDATE requests SET status = ${status} WHERE id = ${id}`;
}
