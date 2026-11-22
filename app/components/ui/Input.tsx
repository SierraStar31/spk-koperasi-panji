import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#1f1e1c] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-white border ${
          error ? "border-red-500 focus:ring-red-500" : "border-[#e6e2dc] focus:border-[#1b4d3e]"
        } rounded-lg text-sm text-[#1f1e1c] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b4d3e]/20 transition-all duration-200`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
