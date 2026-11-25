import { createHmac, timingSafeEqual } from "node:crypto";

export const CONFIRM_COOKIE = "confirm";
export const CONFIRM_TTL_MS = 2 * 60 * 1000; // token berlaku 2 menit

export interface ConfirmationTarget {
  /** Operasi yang dikonfirmasi, mis. "applicants.clear" atau "applicant.delete:12". */
  action: string;
}

function confirmSignature(): Buffer {
  // Kunci turunan dari secret sesi: token konfirmasi tidak bisa dipalsukan tanpa server,
  // dan memisahkan domain kriptografinya dari cookie sesi.
  return createHmac("sha256", process.env.SESSION_SECRET ?? "").update("confirm-token:v1").digest();
}

function digest(target: string): string {
  return createHmac("sha256", confirmSignature()).update(target).digest("base64url");
}

/** Membuat token terikat sesi + target; murni, tanpa akses cookie. */
export function createConfirmationToken(username: string, action: string, now = Date.now()): string {
  const payload = `${now + CONFIRM_TTL_MS}:${action}`;
  return `${digest(username).slice(0, 16)}.${Buffer.from(payload, "utf8").toString("base64url")}.${digest(`${username}|${payload}`)}`;
}

/** Verifikasi token; murni, tanpa akses cookie. */
export function verifyConfirmationToken(
  username: string | null,
  stored: string | undefined,
  submitted: FormDataEntryValue | null,
  target: ConfirmationTarget,
  now = Date.now(),
): boolean {
  const token = typeof submitted === "string" ? submitted : "";
  if (!username || !stored || !token || token !== stored) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [sessionTag, payloadPart, signature] = parts;
  const expectedTag = digest(username).slice(0, 16);
  if (sessionTag.length !== expectedTag.length) return false;
  if (!timingSafeEqual(Buffer.from(sessionTag), Buffer.from(expectedTag))) return false;

  let payload: string;
  try {
    payload = Buffer.from(payloadPart, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expectedSignature = Buffer.from(digest(`${username}|${payload}`));
  const actualSignature = Buffer.from(signature);
  if (expectedSignature.length !== actualSignature.length) return false;
  if (!timingSafeEqual(expectedSignature, actualSignature)) return false;

  const separator = payload.indexOf(":");
  if (separator < 0) return false;
  const expiresAt = Number(payload.slice(0, separator));
  const action = payload.slice(separator + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false;
  return action === target.action;
}
