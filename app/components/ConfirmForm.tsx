"use client";

import React, { useRef, useState } from "react";
import { mintConfirmationTokenAction } from "@/app/actions/confirm";

interface ConfirmFormProps {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  /** Operasi yang dikonfirmasi, mis. "applicants.clear" atau "applicant.delete:12". */
  confirmAction: string;
  children: React.ReactNode;
  className?: string;
}

export function ConfirmForm({ action, message, confirmAction, children, className = "" }: ConfirmFormProps) {
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      action={action}
      className={className}
      onSubmit={async (e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
          return;
        }

        // Token konfirmasi hanya diminta setelah pengguna menyetujui dialog, dan dibuat
        // di server sehingga tidak dapat dipalsukan dari browser.
        e.preventDefault();
        const form = e.currentTarget;
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;

        if (pending) return;
        setPending(true);
        try {
          const token = await mintConfirmationTokenAction({ action: confirmAction });
          if (tokenInputRef.current) tokenInputRef.current.value = token;
          form.requestSubmit(submitter instanceof HTMLButtonElement ? submitter : undefined);
        } catch {
          setPending(false);
        }
      }}
    >
      <input ref={tokenInputRef} type="hidden" name="confirmToken" defaultValue="" />
      {children}
    </form>
  );
}
