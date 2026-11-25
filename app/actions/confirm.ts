"use server";

import { mintConfirmationToken } from "@/lib/confirm";
import type { ConfirmationTarget } from "@/lib/confirm-token";

/** Server Action: mint token konfirmasi, aman dipanggil dari client component. */
export async function mintConfirmationTokenAction(target: ConfirmationTarget): Promise<string> {
  return mintConfirmationToken(target);
}
