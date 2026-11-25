import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { criteria, calculateRocWeights } from "@/src/lib/criteria";
import { Tex } from "@/src/components/Tex";
import PrintButton from "./PrintButton";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

async function PrintReportContent({ params }: PrintPageProps) {
  await requireSession();
  const { id } = await params;
  const calcId = parseInt(id, 10);

  if (isNaN(calcId)) {
    notFound();
  }

  const calculation = await prisma.calculation.findFirst({
    where: { id: calcId },
    include: {
      results: {
        orderBy: { rank: "asc" },
      },
    },
  });

  if (!calculation) {
    notFound();
  }

  const results = calculation.results;
  const weights = calculateRocWeights(criteria.length);
  const formattedDate = new Date(calculation.createdAt).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  return (
    <div className="print-report min-h-screen bg-white text-gray-900 print:bg-white print:text-black">
      {/* Top Navbar (hidden during print) */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-3 flex justify-between items-center no-print">
        <Link href="/calculation/history" className="text-sm font-medium text-[#1b4d3e] hover:text-[#143a2e] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d3e]">
          ← Kembali ke Riwayat
        </Link>
        <PrintButton />
      </div>

      <main className="max-w-4xl mx-auto p-8 space-y-8 print:p-0 print:max-w-none">
        {/* Report Header */}
        <div className="text-center border-b-2 border-gray-800 pb-6 space-y-2">
          <Image
            src="/logo%20koperasi.svg"
            alt="Logo Koperasi Panji Borneo Mandiri"
            width={72}
            height={72}
            priority
            unoptimized
            className="w-18 h-18 mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">
            KOPERASI PANJI BORNEO MANDIRI
          </h1>
          <h2 className="text-xl font-semibold text-gray-800">
            LAPORAN HASIL REKOMENDASI PEMILIHAN PENERIMA PINJAMAN
          </h2>
          <p className="text-sm text-gray-600">
            Metode: WASPAS (Weighted Aggregated Sum Product Assessment) & Pembobotan ROC (Rank Order Centroid)
          </p>
          <div className="pt-2 flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 mt-4">
            <span>ID Perhitungan: #{calculation.id}</span>
            <span>Tanggal Perhitungan: {formattedDate}</span>
          </div>
        </div>

        {/* Criteria & Weights Table */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1">
            1. Parameter Kriteria & Bobot ROC
          </h3>
          <p className="text-xs text-gray-600">
            Bobot kriteria dihitung menggunakan metode Rank Order Centroid (ROC) berdasarkan tingkat prioritas kriteria.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300 text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-800">Kode</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-800">Nama Kriteria</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-800">Atribut</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-800">Prioritas</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-800">Bobot (<Tex>{"w_j"}</Tex>)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {criteria.map((c, idx) => (
                  <tr key={c.code}>
                    <td className="px-3 py-1.5 font-mono font-medium">{c.code}</td>
                    <td className="px-3 py-1.5">{c.name}</td>
                    <td className="px-3 py-1.5 text-center capitalize">{c.type}</td>
                    <td className="px-3 py-1.5 text-center">{c.priority}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{weights[idx].toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Applicants Original Values & Scores */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1">
            2. Daftar Pengaju, Nilai Asli, dan Skor Konversi (<Tex>{"x_{ij}"}</Tex>)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300 text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-center font-semibold text-gray-800" rowSpan={2}>No</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-800" rowSpan={2}>Nama Pengaju</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-800 border-b border-gray-300" colSpan={5}>
                    Nilai Asli Pengaju (<Tex>{"x_{ij}"}</Tex>)
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-800 border-b border-gray-300" colSpan={5}>
                    Skor Konversi (1-5)
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 text-right font-medium text-gray-600">Simpanan</th>
                  <th className="px-2 py-1 text-right font-medium text-gray-600">Pinjaman</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">Urgensi</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">Tangg.</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">Umur</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">C1</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">C2</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">C3</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">C4</th>
                  <th className="px-2 py-1 text-center font-medium text-gray-600">C5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((res, index) => (
                  <tr key={res.id}>
                    <td className="px-2 py-1.5 text-center">{index + 1}</td>
                    <td className="px-3 py-1.5 font-medium">{res.nama}</td>
                    <td className="px-2 py-1.5 text-right font-mono">Rp {res.simpanan.toLocaleString("id-ID")}</td>
                    <td className="px-2 py-1.5 text-right font-mono">Rp {res.pinjamanDiajukan.toLocaleString("id-ID")}</td>
                    <td className="px-2 py-1.5 text-center">{res.urgensi}</td>
                    <td className="px-2 py-1.5 text-center">{res.tanggungan}</td>
                    <td className="px-2 py-1.5 text-center">{res.umur}</td>
                    <td className="px-2 py-1.5 text-center font-mono">{res.c1}</td>
                    <td className="px-2 py-1.5 text-center font-mono">{res.c2}</td>
                    <td className="px-2 py-1.5 text-center font-mono">{res.c3}</td>
                    <td className="px-2 py-1.5 text-center font-mono">{res.c4}</td>
                    <td className="px-2 py-1.5 text-center font-mono">{res.c5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ranking & Q_i Results */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1">
            3. Hasil Penilaian WASPAS & Peringkat Akhir (<Tex>{"Q_i"}</Tex>)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300 text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold text-gray-800">Peringkat</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-800">Nama Pengaju</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-800">Pinjaman Diajukan</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-800"><Tex>{"WSM"}</Tex></th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-800"><Tex>{"WPM"}</Tex></th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-800"><Tex>{"Q_i"}</Tex> (Utilitas)</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((res) => {
                  const isRecommended = res.rank <= 3;
                  return (
                    <tr key={res.id} className={isRecommended ? "bg-gray-50 font-medium" : ""}>
                      <td className="px-3 py-2 text-center font-bold text-sm">{res.rank}</td>
                      <td className="px-3 py-2">{res.nama}</td>
                      <td className="px-3 py-2 text-right font-mono">Rp {res.pinjamanDiajukan.toLocaleString("id-ID")}</td>
                      <td className="px-3 py-2 text-right font-mono">{Number(res.wsm).toFixed(4)}</td>
                      <td className="px-3 py-2 text-right font-mono">{Number(res.wpm).toFixed(4)}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-gray-900">{Number(res.qi).toFixed(4)}</td>
                      <td className="px-3 py-2 text-center">
                        {isRecommended ? (
                          <span className="font-semibold text-gray-900">Rekomendasi</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note / Disclaimer */}
        <div className="p-4 bg-gray-50 border border-gray-300 rounded text-xs text-gray-800 space-y-1">
          <p className="font-bold uppercase tracking-wider text-gray-900">Catatan Penting:</p>
          <p>
            Hasil perhitungan di atas murni merupakan rekomendasi objektif yang dihasilkan oleh sistem pendukung keputusan metode WASPAS dan pembobotan ROC. Hasil ini bersifat rekomendasi dan keputusan akhir pemberian pinjaman tetap menjadi wewenang penuh dan mutlak Ketua Koperasi.
          </p>
        </div>

        {/* Signature Area */}
        <div className="pt-12 flex justify-end text-xs text-center">
          <div>
            <p className="mb-16">Mengetahui,<br />Ketua Koperasi</p>
            <p className="font-bold underline">( _______________________ )</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PrintReportPage({ params }: PrintPageProps) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Memuat laporan...</div>}>
      <PrintReportContent params={params} />
    </Suspense>
  );
}
