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
  /** Batas nilai (dalam rupiah) yang bisa diketik; input di atasnya dipotong otomatis. */
  max?: number;
}

function clampValue(raw: string, max: number): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  const numeric = Number(digits);
  if (!Number.isFinite(numeric) || numeric <= max) return formatThousands(digits);
  return formatThousands(String(max));
}

export function CurrencyInput({
  label,
  name,
  defaultValue = "",
  required,
  placeholder,
  max,
}: CurrencyInputProps) {
  const [value, setValue] = useState(() => {
    const initial = formatThousands(String(defaultValue));
    return max === undefined ? initial : clampValue(initial, max);
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const digitsBeforeCaret = el.value.slice(0, el.selectionStart ?? 0).replace(/\D/g, "").length;
    const formatted = max === undefined ? formatThousands(el.value) : clampValue(el.value, max);
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
