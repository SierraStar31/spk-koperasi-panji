import React from "react";

interface BadgeProps {
  variant?: "benefit" | "cost" | "rekomendasi" | "success" | "warning" | "error" | "neutral";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  let styles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold";
  
  if (variant === "benefit" || variant === "success") {
    styles += " bg-emerald-100 text-emerald-800 border border-emerald-200";
  } else if (variant === "cost" || variant === "warning") {
    styles += " bg-amber-100 text-amber-800 border border-amber-200";
  } else if (variant === "rekomendasi") {
    styles += " bg-[#1b4d3e]/10 text-[#1b4d3e] border border-[#1b4d3e]/20";
  } else if (variant === "error") {
    styles += " bg-red-100 text-red-800 border border-red-200";
  } else {
    styles += " bg-gray-100 text-gray-700 border border-gray-200";
  }

  return <span className={`${styles} ${className}`}>{children}</span>;
}
