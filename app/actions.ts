"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { addRequest, saveStatus, savePrice, type RequestType, type Status } from "@/lib/db";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { services } from "@/lib/site";

export type FormState = { ok: boolean; msg: string } | null;

const TYPES: RequestType[] = ["solicitud", "queja", "otro"];
const STATUSES: Status[] = ["nuevo", "en_proceso", "resuelto"];
const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);

export async function submitRequest(_: FormState, f: FormData): Promise<FormState> {
  if (str(f, "website", 100)) return { ok: true, msg: "¡Recibido!" }; // honeypot: los bots lo llenan

  const type = str(f, "type", 20) as RequestType;
  const name = str(f, "name", 80);
  const phone = str(f, "phone", 20);
  const service = str(f, "service", 40);
  const message = str(f, "message", 1000);

  if (!TYPES.includes(type)) return { ok: false, msg: "Elige el tipo de mensaje." };
  if (name.length < 2) return { ok: false, msg: "Escribe tu nombre." };
  if (!/^[\d\s+()-]{7,20}$/.test(phone)) return { ok: false, msg: "Escribe un teléfono válido." };
  if (service && !services.some((s) => s.slug === service)) return { ok: false, msg: "Servicio no válido." };
  if (message.length < 5) return { ok: false, msg: "Cuéntanos un poco más en el mensaje." };

  try {
    await addRequest({ type, name, phone, service, message });
  } catch (e) {
    console.error(e);
    return { ok: false, msg: "No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp." };
  }
  return { ok: true, msg: "¡Listo! Te contactaremos muy pronto." };
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  if (!checkPassword(str(f, "password", 200))) return { ok: false, msg: "Contraseña incorrecta." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setStatus(f: FormData) {
  await guard();
  const id = Number(f.get("id"));
  const status = String(f.get("status")) as Status;
  if (!Number.isInteger(id) || !STATUSES.includes(status)) return;
  await saveStatus(id, status);
  refresh();
}

export async function setPrice(f: FormData) {
  await guard();
  const slug = String(f.get("slug"));
  const price = Math.round(Number(f.get("price")));
  if (!services.some((s) => s.slug === slug) || !Number.isFinite(price) || price < 0 || price > 100_000_000) return;
  await savePrice(slug, price);
  updateTag("prices");
}
