import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-[#e6e2dc] shadow-2xs bg-white ${className}`}>
      <table className="min-w-full divide-y divide-[#e6e2dc]">
        <thead className="bg-[#f7f5f0]">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-4 py-3.5 text-left text-xs font-semibold text-[#1f1e1c] uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6e2dc] bg-white text-sm [&>tr:nth-child(even)]:bg-[#fcfbf9] [&>tr:hover]:bg-[#f4f2ec]/60 transition-colors">
          {children}
        </tbody>
      </table>
    </div>
  );
}
