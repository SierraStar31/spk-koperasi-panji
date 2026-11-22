import React from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-xl border border-stone-200/80 shadow-xs p-6 transition-all duration-200 hover:shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-stone-100">
          <div>
            {title && <h3 className="text-lg font-semibold text-stone-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-150 shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-700",
    secondary: "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900 focus:ring-stone-500",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full px-3.5 py-2 rounded-lg border text-sm text-stone-900 bg-white placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 ${
          error ? "border-rose-500 focus:ring-rose-500" : "border-stone-300 hover:border-stone-400"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">{label}</label>}
      <select
        className={`w-full px-3.5 py-2 rounded-lg border text-sm text-stone-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 ${
          error ? "border-rose-500 focus:ring-rose-500" : "border-stone-300 hover:border-stone-400"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "benefit" | "cost" | "recommended" | "neutral" | "warning" | "success" | "danger";
}) {
  const styles = {
    benefit: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    cost: "bg-amber-50 text-amber-800 border border-amber-200",
    recommended: "bg-teal-50 text-teal-800 border border-teal-200 font-semibold",
    neutral: "bg-stone-100 text-stone-700 border border-stone-200",
    warning: "bg-amber-100 text-amber-900 border border-amber-200",
    success: "bg-emerald-100 text-emerald-900 border border-emerald-200",
    danger: "bg-rose-100 text-rose-900 border border-rose-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title = "Belum ada data",
  description = "Data belum tersedia di sistem.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4 bg-stone-50/50 rounded-xl border border-dashed border-stone-300">
      <div className="text-3xl mb-3">📂</div>
      <h4 className="text-base font-semibold text-stone-800">{title}</h4>
      <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Notification({
  message,
  type = "error",
}: {
  message?: string;
  type?: "error" | "success" | "warning";
}) {
  if (!message) return null;

  const styles = {
    error: "bg-rose-50 border-rose-200 text-rose-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };

  const icons = {
    error: "⚠️",
    success: "✅",
    warning: "🔔",
  };

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium shadow-2xs ${styles[type]}`}>
      <span className="text-base">{icons[type]}</span>
      <span className="flex-1">{message}</span>
    </div>
  );
}
