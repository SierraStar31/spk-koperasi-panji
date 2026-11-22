import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  let baseStyles = "inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";
  
  let variantStyles = "";
  if (variant === "primary") {
    variantStyles = disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
      : "bg-[#1b4d3e] text-white hover:bg-[#143a2e] focus:ring-[#1b4d3e]";
  } else if (variant === "secondary") {
    variantStyles = disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
      : "bg-white text-[#1f1e1c] border border-[#e6e2dc] hover:bg-[#f7f5f0] focus:ring-[#1b4d3e]";
  } else if (variant === "danger") {
    variantStyles = disabled
      ? "bg-red-100 text-red-300 cursor-not-allowed shadow-none"
      : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600";
  }

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
