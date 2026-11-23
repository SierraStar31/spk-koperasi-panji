"use client";

import { useState } from "react";
import { Input } from "./Input";
import { formatThousands } from "@/src/lib/format";

interface CurrencyInputProps {
  label: string;
  name: string;
  defaultValue?: number | string;
  required?: boolean;
  placeholder?: string;
}

export function CurrencyInput({
  label,
  name,
  defaultValue = "",
  required,
  placeholder,
}: CurrencyInputProps) {
  const [value, setValue] = useState(() => formatThousands(String(defaultValue)));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const digitsBeforeCaret = el.value.slice(0, el.selectionStart ?? 0).replace(/\D/g, "").length;
    const formatted = formatThousands(el.value);
    setValue(formatted);

    requestAnimationFrame(() => {
      let pos = 0;
      let seen = 0;
      while (pos < formatted.length && seen < digitsBeforeCaret) {
        if (/\d/.test(formatted[pos])) seen++;
        pos++;
      }
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <Input
      label={label}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  );
}
