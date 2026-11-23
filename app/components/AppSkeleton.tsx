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
      <div className="w-full md:w-64 md:h-screen md:sticky md:top-0 md:self-start bg-[#1b4d3e] hidden md:flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-white/15 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-md shrink-0"></div>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex-1 px-3 py-4">
          <div className="h-3 bg-white/10 rounded w-12 mx-2 mb-3"></div>
          <div className="space-y-0.5">
            {Array.from({ length: navItems }, (_, i) => (
              <div key={i} className="h-8 bg-white/10 rounded-md"></div>
            ))}
          </div>
        </div>
        <div className="px-3 py-4 border-t border-white/15">
          <div className="h-8 bg-white/10 rounded-md"></div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        {children}
      </div>
    </div>
  );
}
