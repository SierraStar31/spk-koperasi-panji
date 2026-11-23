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
      <aside className="w-full md:w-64 md:h-screen md:sticky md:top-0 md:self-start bg-[#1b4d3e] text-white flex flex-col shrink-0 no-print">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-white/15 flex items-center gap-2.5">
          <Image
            src="/logo%20koperasi.svg"
            alt="Logo Koperasi Panji Borneo Mandiri"
            width={36}
            height={36}
            className="w-9 h-9 rounded-md shrink-0 bg-white/95 p-0.5"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight leading-snug break-words">
              Koperasi Panji Borneo Mandiri
            </h1>
            <p className="text-[11px] text-white/60 leading-tight">
              SPK Penerima Pinjaman
            </p>
          </div>
        </div>

        {/* Navigation — satu-satunya bagian sidebar yang ikut scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Menu
          </p>
          <NavLinks />
        </div>

        {/* Account — selalu menempel di bawah, tidak ikut scroll */}
        <div className="px-3 py-4 border-t border-white/15 shrink-0">
          <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Akun
          </p>
          {sessionUsername && (
            <div className="px-2 mb-3">
              <p className="text-[11px] text-white/60">Login sebagai</p>
              <p className="text-sm font-semibold text-white truncate">{sessionUsername}</p>
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
