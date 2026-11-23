"use client";

import React from "react";

interface ConfirmFormProps {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: React.ReactNode;
  className?: string;
}

export function ConfirmForm({ action, message, children, className = "" }: ConfirmFormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
