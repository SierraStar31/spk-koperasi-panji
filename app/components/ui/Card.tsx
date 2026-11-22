import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = "", title, description, action }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#e6e2dc] p-6 transition-all duration-200 hover:shadow-md ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-[#e6e2dc]">
          <div>
            {title && <h3 className="text-lg font-semibold text-[#1f1e1c]">{title}</h3>}
            {description && <p className="text-xs text-[#5e5b56] mt-0.5">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
