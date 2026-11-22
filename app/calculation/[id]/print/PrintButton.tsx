"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer print:hidden"
    >
      Cetak / Simpan PDF
    </button>
  );
}
