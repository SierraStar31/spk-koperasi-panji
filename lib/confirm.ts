"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE, requireSession, verifySession } from "@/lib/session";
import {
  CONFIRM_COOKIE,
  CONFIRM_TTL_MS,
  createConfirmationToken,
  verifyConfirmationToken,
  type ConfirmationTarget,
} from "@/lib/confirm-token";

/**
 * Membuat token konfirmasi sekali pakai yang terikat pada sesi dan pada target mutasi.
 * Token disimpan di cookie bernilai tunggal sehingga hanya satu token hidup (single-use):
 * meminta token baru untuk target apa pun membatalkan token sebelumnya.
 */
export async function mintConfirmationToken(target: ConfirmationTarget): Promise<string> {
  const username = await requireSession();
  const token = createConfirmationToken(username, target.action);

  const cookieStore = await cookies();
  cookieStore.set({
    name: CONFIRM_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CONFIRM_TTL_MS / 1000,
    sameSite: "strict",
  });

  return token;
}

/**
 * Verifikasi server-side: token harus cocok dengan cookie yang tersimpan, belum kedaluwarsa,
 * dan terikat pada username sesi serta target mutasi yang sama. Token langsung dihapus
 * supaya tidak bisa dipakai dua kali.
 */
export async function consumeConfirmationToken(
  submitted: FormDataEntryValue | null,
  target: ConfirmationTarget,
): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(CONFIRM_COOKIE)?.value;
  cookieStore.delete(CONFIRM_COOKIE);

  const username = verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  return verifyConfirmationToken(username, stored, submitted, target);
}
