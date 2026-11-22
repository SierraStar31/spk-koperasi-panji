import React from "react";
import { IconFolder } from "./Icons";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-[#e6e2dc]">
      <div className="max-w-md mx-auto space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#1b4d3e]/10 flex items-center justify-center text-[#1b4d3e]">
          <IconFolder className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-[#1f1e1c]">{title}</h4>
        <p className="text-sm text-[#5e5b56]">{description}</p>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}
