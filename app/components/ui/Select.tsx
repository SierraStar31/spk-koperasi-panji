import React from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, error, options, className = "", id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#1f1e1c] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 bg-white border ${
          error ? "border-red-500 focus:ring-red-500" : "border-[#e6e2dc] focus:border-[#1b4d3e]"
        } rounded-lg text-sm text-[#1f1e1c] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/20 transition-all duration-200`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
