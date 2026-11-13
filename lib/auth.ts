import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

const COOKIE = "admin";
const DAYS = 30;

function secret() {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Falta ADMIN_PASSWORD");
  return s;
}

const sign = (exp: string) => createHmac("sha256", secret()).update(exp).digest("hex");

function safeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const checkPassword = (pw: string) => safeEq(pw, secret());

export async function startSession() {
  const exp = String(Date.now() + DAYS * 864e5);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  await connection();
  const [exp, mac] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  return !!exp && !!mac && Number(exp) > Date.now() && safeEq(mac, sign(exp));
}
