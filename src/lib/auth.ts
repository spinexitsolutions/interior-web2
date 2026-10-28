import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { readDB } from "./db";
import { SESSION_COOKIE, signSession, verifySession } from "./session";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function checkHash(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Credentials saved from the admin panel win; otherwise fall back to env / defaults. */
export async function checkCredentials(email: string, password: string) {
  const db = await readDB();
  if (db.admin?.passwordHash) {
    return email.toLowerCase() === db.admin.email.toLowerCase() && checkHash(password, db.admin.passwordHash);
  }
  const envEmail = process.env.ADMIN_EMAIL || "admin@aangan.studio";
  const envPass = process.env.ADMIN_PASSWORD || "admin123";
  return email.toLowerCase() === envEmail.toLowerCase() && password === envPass;
}

export async function createSession(email: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getAdmin() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
