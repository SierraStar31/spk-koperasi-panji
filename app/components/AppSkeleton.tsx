import React from "react";

export function AppSkeleton({
  children,
  navItems = 5,
}: {
  children: React.ReactNode;
  navItems?: number;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfbf9] text-[#1f1e1c] animate-pulse">
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#e6e2dc] p-6 space-y-6 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-200 rounded-lg"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
            <div className="h-3 bg-stone-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3 pt-4">
          {Array.from({ length: navItems }, (_, i) => (
            <div key={i} className="h-10 bg-stone-100 rounded-lg"></div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        {children}
      </div>
    </div>
  );
}
