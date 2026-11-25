import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const SESSION_COOKIE = "session";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET wajib diisi minimal 32 karakter.");
  }
  return secret;
}

function sign(username: string): string {
  return crypto.createHmac("sha256", getSecret()).update(username).digest("base64url");
}

export function serializeSession(username: string): string {
  return `${Buffer.from(username, "utf8").toString("base64url")}.${sign(username)}`;
}

export function verifySession(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;

  let username: string;
  try {
    username = Buffer.from(value.slice(0, dot), "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!username) return null;

  const expected = Buffer.from(sign(username));
  const actual = Buffer.from(value.slice(dot + 1));
  if (expected.length !== actual.length) return null;
  return crypto.timingSafeEqual(expected, actual) ? username : null;
}

export async function setSessionCookie(username: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: serializeSession(username),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Satu-satunya sumber identitas. Dipakai setiap halaman dan setiap Server Action,
 * karena middleware tidak melindungi Server Action yang dipanggil langsung.
 */
export const requireSession = cache(async (): Promise<string> => {
  const cookieStore = await cookies();
  const username = verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!username) redirect("/login");
  return username;
});
