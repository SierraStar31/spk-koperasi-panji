"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isCriteria = pathname === "/criteria";
  const isHistory = pathname === "/calculation/history";
  const isCalculation = pathname === "/calculation";

  const navItems = [
    { label: "Beranda", href: "/", active: isHome },
    { label: "Kriteria dan Bobot", href: "/criteria", active: isCriteria },
    { label: "Data Pengaju dan Perhitungan", href: "/calculation", active: isCalculation },
    { label: "Riwayat/Laporan", href: "/calculation/history", active: isHistory },
  ];

  return (
    <nav className="space-y-1.5">
      {navItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d3e] focus-visible:ring-offset-2 ${
            item.active
              ? "bg-[#1b4d3e] text-white shadow-sm"
              : "text-[#5e5b56] hover:bg-[#f7f5f0] hover:text-[#1f1e1c]"
          }`}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
