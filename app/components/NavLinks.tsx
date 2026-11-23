"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isCriteria = pathname === "/criteria";
  const isApplicants = pathname === "/applicants" || pathname.startsWith("/applicants/");
  const isHistory = pathname === "/calculation/history";
  const isCalculation = pathname === "/calculation";

  const navItems = [
    { label: "Beranda", href: "/", active: isHome },
    { label: "Kriteria dan Bobot", href: "/criteria", active: isCriteria },
    { label: "Input Data Pengaju", href: "/applicants", active: isApplicants },
    { label: "Perhitungan", href: "/calculation", active: isCalculation },
    { label: "Riwayat dan Laporan", href: "/calculation/history", active: isHistory },
  ];

  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`block px-3 py-2 rounded-md text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b4d3e] ${
            item.active
              ? "bg-[#fcfbf9] font-semibold text-[#1b4d3e]"
              : "font-medium text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
