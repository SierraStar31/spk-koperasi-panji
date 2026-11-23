import React from "react";
import { IconCheck, IconWarning, IconError, IconInfo } from "./Icons";

interface NotificationProps {
  type?: "success" | "warning" | "error" | "info";
  message: string;
  className?: string;
}

export function Notification({ type = "info", message, className = "" }: NotificationProps) {
  let styles = "p-4 rounded-xl text-sm border flex items-start gap-3 shadow-xs";
  let icon = <IconInfo className="w-5 h-5 text-[#1b4d3e] shrink-0 mt-0.5" />;

  if (type === "success") {
    styles += " bg-[#1b4d3e]/5 border-[#1b4d3e]/20 text-[#1b4d3e]";
    icon = <IconCheck className="w-5 h-5 text-[#1b4d3e] shrink-0 mt-0.5" />;
  } else if (type === "warning") {
    styles += " bg-amber-50 border-amber-200 text-amber-800";
    icon = <IconWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
  } else if (type === "error") {
    styles += " bg-red-50 border-red-200 text-red-800";
    icon = <IconError className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />;
  } else {
    styles += " bg-[#1b4d3e]/5 border-[#1b4d3e]/20 text-[#1b4d3e]";
  }

  return (
    <div className={`${styles} ${className}`}>
      {icon}
      <div className="flex-1 leading-relaxed">{message}</div>
    </div>
  );
}
