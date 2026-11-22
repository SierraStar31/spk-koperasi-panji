import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6 text-center text-gray-900">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-200 space-y-4">
        <div className="text-4xl font-extrabold text-indigo-600">404</div>
        <h1 className="text-xl font-bold text-gray-900">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-gray-600">
          Maaf, halaman atau laporan perhitungan yang Anda cari tidak ditemukan atau telah dihapus.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 shadow-sm"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/calculation/history"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
          >
            Riwayat Perhitungan
          </Link>
        </div>
      </div>
    </div>
  );
}
