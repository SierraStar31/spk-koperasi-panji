"use client";

import { useState } from "react";
import { Input } from "./Input";
import { parseThousands } from "@/src/lib/format";

interface PositiveIntInputProps {
  label: string;
  name: string;
  min?: number;
  max?: number;
  required?: boolean;
  placeholder?: string;
  defaultValue?: number;
}

export function PositiveIntInput({
  label,
  name,
  min,
  max,
  required,
  placeholder,
  defaultValue,
}: PositiveIntInputProps) {
  const [value, setValue] = useState(defaultValue === undefined ? "" : String(defaultValue));

  return (
    <Input
      label={label}
      name={name}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      required={required}
      placeholder={placeholder}
      value={value}
      // parseThousands membuang semua non-digit, jadi "-" tidak pernah tersimpan.
      onChange={(e) => setValue(parseThousands(e.target.value))}
    />
  );
}
