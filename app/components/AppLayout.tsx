import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
import { NavLinks } from "./NavLinks";

interface AppLayoutProps {
  children: React.ReactNode;
  sessionUsername?: string;
}

export function AppLayout({ children, sessionUsername }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfbf9] text-[#1f1e1c]">
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#e6e2dc] flex flex-col justify-between shrink-0 shadow-sm no-print">
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Image
                src="/logo%20koperasi.svg"
                alt="Logo Koperasi Panji Borneo Mandiri"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg shadow-sm shrink-0"
              />
              <h1 className="text-base font-bold text-[#1f1e1c] tracking-tight">Koperasi Panji Borneo Mandiri</h1>
            </div>
            <p className="text-xs text-[#5e5b56]">Sistem Pendukung Keputusan Penentuan Prioritas Penerima Pinjaman</p>
          </div>

          <NavLinks />
        </div>

        <div className="p-6 border-t border-[#e6e2dc] space-y-4 bg-[#fcfbf9]/50">
          {sessionUsername && (
            <div className="text-xs text-[#5e5b56]">
              Login sebagai:<br />
              <strong className="text-[#1f1e1c] text-sm font-semibold">{sessionUsername}</strong>
            </div>
          )}
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
