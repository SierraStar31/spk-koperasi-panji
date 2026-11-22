import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbf9] items-center justify-center px-4 py-12 text-center text-[#1f1e1c]">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-[#e6e2dc] p-8 space-y-4">
        <Image
          src="/logo%20koperasi.svg"
          alt="Logo Koperasi Panji Borneo Mandiri"
          width={64}
          height={64}
          className="w-16 h-16 mx-auto rounded-2xl shadow-sm"
        />
        <div className="text-4xl font-bold tracking-tight text-[#1b4d3e]">404</div>
        <h1 className="text-xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-[#5e5b56] leading-relaxed">
          Maaf, halaman atau laporan perhitungan yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto">Kembali ke Beranda</Button>
          </Link>
          <Link href="/calculation/history">
            <Button variant="secondary" className="w-full sm:w-auto">Riwayat Perhitungan</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
