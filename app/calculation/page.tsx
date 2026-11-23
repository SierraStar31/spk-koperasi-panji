import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { criteria, calculateRocWeights, convertToScore } from "@/src/lib/criteria";
import { calculateWaspas } from "@/src/lib/waspas";

import { AppLayout } from "@/app/components/AppLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Notification } from "@/app/components/ui/Notification";
import { Tex } from "@/src/components/Tex";

interface ApplicantRow {
  id: number;
  nama: string;
  simpanan: number;
  pinjamanDiajukan: number;
  urgensi: number;
  tanggungan: number;
  umur: number;
}

function buildWaspasInput(applicants: ApplicantRow[]) {
  const weights = calculateRocWeights(criteria.length);
  return {
    criteriaConfig: criteria.map((c, idx) => ({
      code: c.code,
      type: c.type,
      weight: weights[idx],
    })),
    alternatives: applicants.map((app) => ({
      id: String(app.id),
      name: app.nama,
      scores: {
        C1: convertToScore("C1", app.simpanan),
        C2: convertToScore("C2", app.pinjamanDiajukan),
        C3: convertToScore("C3", app.urgensi),
        C4: convertToScore("C4", app.tanggungan),
        C5: convertToScore("C5", app.umur),
      },
    })),
  };
}

export async function calculateAction() {
  "use server";
  const applicants = await prisma.applicant.findMany({ orderBy: { id: "asc" } });
  if (applicants.length === 0) {
    redirect("/calculation?error=" + encodeURIComponent("Isi data pengaju terlebih dahulu"));
  }

  const { criteriaConfig, alternatives } = buildWaspasInput(applicants);
  const waspasOutput = calculateWaspas(alternatives, criteriaConfig);

  await prisma.$transaction(async (tx) => {
    const calculation = await tx.calculation.create({ data: {} });

    for (const res of waspasOutput.results) {
      const applicant = applicants.find((a) => String(a.id) === res.id)!;
      const scores = alternatives.find((a) => a.id === res.id)!.scores;

      await tx.calculationResult.create({
        data: {
          calculationId: calculation.id,
          rank: res.rank,
          qi: res.qi,
          wsm: res.wsm,
          wpm: res.wpm,
          nama: applicant.nama,
          simpanan: applicant.simpanan,
          pinjamanDiajukan: applicant.pinjamanDiajukan,
          urgensi: applicant.urgensi,
          tanggungan: applicant.tanggungan,
          umur: applicant.umur,
          c1: scores.C1,
          c2: scores.C2,
          c3: scores.C3,
          c4: scores.C4,
          c5: scores.C5,
        },
      });
    }
  });

  revalidatePath("/calculation");
  revalidatePath("/calculation/history");
  redirect("/calculation#perhitungan");
}

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

async function CalculationContent({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const params = await searchParams;
  const errorMessage = params.error;
  const successMessage = params.success;

  const applicants = await prisma.applicant.findMany({ orderBy: { id: "asc" } });
  const hasApplicants = applicants.length > 0;

  const latestCalculation = await prisma.calculation.findFirst({
    where: { deletedAt: null },
    orderBy: { id: "desc" },
    include: {
      results: {
        orderBy: { rank: "asc" },
      },
    },
  });

  let waspasOutput = null;
  if (hasApplicants) {
    const { criteriaConfig, alternatives } = buildWaspasInput(applicants);
    waspasOutput = calculateWaspas(alternatives, criteriaConfig);
  }

  const results = latestCalculation?.results || [];
  const topN = results.slice(0, 3);
  const totalPinjamanTop3 = topN.reduce((sum, r) => sum + r.pinjamanDiajukan, 0);

  return (
    <AppLayout sessionUsername={session?.value}>
      <div className="space-y-8">
        {errorMessage && <Notification type="error" message={errorMessage} />}
        {successMessage && <Notification type="success" message={successMessage} />}

        {/* Calculation Execution */}
        <Card
          title="Eksekusi Perhitungan WASPAS"
          description="Jalankan perhitungan dari data pengaju yang sudah tersimpan. Metode dan rumus dihitung otomatis di balik layar."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/applicants">
                <Button variant="secondary" className="text-xs">
                  Kelola Data Pengaju
                </Button>
              </Link>
              <Link href="/calculation/history">
                <Button variant="secondary" className="text-xs">
                  📜 Riwayat Laporan
                </Button>
              </Link>
            </div>
          }
        >
          <div className="bg-[#f7f5f0] border border-[#e6e2dc] rounded-xl p-5 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-[#1f1e1c] text-sm">Proses Kalkulasi WASPAS</h4>
              <p className="text-xs text-[#5e5b56] mt-0.5">
                {hasApplicants
                  ? `Terdapat ${applicants.length} pengaju siap dihitung dalam sistem.`
                  : "Belum ada data pengaju. Tambahkan data pengaju terlebih dahulu."}
              </p>
            </div>
            {hasApplicants ? (
              <form action={calculateAction}>
                <Button type="submit" variant="primary">
                  Hitung Sekarang
                </Button>
              </form>
            ) : (
              <Link href="/applicants">
                <Button variant="primary">Tambah Data Pengaju</Button>
              </Link>
            )}
          </div>
          {!hasApplicants && (
            <p className="text-xs text-amber-700 font-medium italic pt-3">
              * Tombol &quot;Hitung Sekarang&quot; nonaktif karena belum ada data pengaju.
            </p>
          )}
        </Card>

        {/* Calculation Results & Matrices (Scroll Target #perhitungan) */}
        <div id="perhitungan" className="space-y-8 scroll-mt-8">
          {waspasOutput && (
            <Card
              title="Rincian Matriks"
              description="Opsional — rincian perhitungan di balik layar."
            >
              <details className="border border-[#e6e2dc] rounded-xl p-4 bg-[#fcfbf9] mt-2">
                <summary className="font-semibold text-sm text-[#1b4d3e] cursor-pointer select-none">
                  Lihat matriks keputusan (<Tex>{"X"}</Tex>) dan matriks normalisasi (<Tex>{"r_{ij}"}</Tex>)
                </summary>

                <div className="space-y-6 pt-4">
                  <div>
                    <h4 className="font-semibold text-[#1f1e1c] text-sm mb-2">
                      1. Matriks Keputusan (<Tex>{"X"}</Tex> / Skor Konversi C1 - C5)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#e6e2dc] border border-[#e6e2dc] rounded-lg bg-white">
                        <thead className="bg-[#f7f5f0]">
                          <tr>
                            <th className="px-3.5 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">Alternatif</th>
                            <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C1 (Simpanan)</th>
                            <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C2 (Pinjaman)</th>
                            <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C3 (Urgensi)</th>
                            <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C4 (Tanggungan)</th>
                            <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C5 (Umur)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e6e2dc] text-sm">
                          {waspasOutput.decisionMatrix.map((item) => (
                            <tr key={item.id} className="hover:bg-[#fcfbf9] transition-colors">
                              <td className="px-3.5 py-3.5 font-semibold text-[#1f1e1c]">{item.name}</td>
                              <td className="px-3.5 py-3.5 text-center font-mono text-[#5e5b56]">{item.values.C1}</td>
                              <td className="px-3.5 py-3.5 text-center font-mono text-[#5e5b56]">{item.values.C2}</td>
                              <td className="px-3.5 py-3.5 text-center font-mono text-[#5e5b56]">{item.values.C3}</td>
                              <td className="px-3.5 py-3.5 text-center font-mono text-[#5e5b56]">{item.values.C4}</td>
                              <td className="px-3.5 py-3.5 text-center font-mono text-[#5e5b56]">{item.values.C5}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#1f1e1c] text-sm mb-2">
                      2. Matriks Normalisasi (<Tex>{"r_{ij}"}</Tex>)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#e6e2dc] border border-[#e6e2dc] rounded-lg bg-white">
                        <thead className="bg-[#f7f5f0]">
                          <tr>
                            <th className="px-3.5 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">Alternatif</th>
                            <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">C1</th>
                            <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">C2</th>
                            <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">C3</th>
                            <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">C4</th>
                            <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">C5</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e6e2dc] text-sm font-mono">
                          {waspasOutput.normalizedMatrix.map((item) => (
                            <tr key={item.id} className="hover:bg-[#fcfbf9] transition-colors">
                              <td className="px-3.5 py-3.5 font-sans font-semibold text-[#1f1e1c]">{item.name}</td>
                              <td className="px-3.5 py-3.5 text-right text-[#5e5b56]">{item.values.C1.toFixed(4)}</td>
                              <td className="px-3.5 py-3.5 text-right text-[#5e5b56]">{item.values.C2.toFixed(4)}</td>
                              <td className="px-3.5 py-3.5 text-right text-[#5e5b56]">{item.values.C3.toFixed(4)}</td>
                              <td className="px-3.5 py-3.5 text-right text-[#5e5b56]">{item.values.C4.toFixed(4)}</td>
                              <td className="px-3.5 py-3.5 text-right text-[#5e5b56]">{item.values.C5.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </details>
            </Card>
          )}

          {/* Ranking & Results Table */}
          {latestCalculation && results.length > 0 && (
            <Card
              title={<>Tabel Peringkat & Nilai WASPAS (<Tex>{"WSM"}</Tex>, <Tex>{"WPM"}</Tex>, <Tex>{"Q_i"}</Tex>)</>}
              description={<>Diurutkan berdasarkan nilai utilitas gabungan <Tex>{"Q_i"}</Tex> terbesar.</>}
              action={
                <Link href={`/calculation/${latestCalculation.id}/print`}>
                  <Button variant="primary" className="text-xs">
                    🖨️ Cetak Laporan / PDF
                  </Button>
                </Link>
              }
            >
              <div className="space-y-6 pt-2">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#e6e2dc] border border-[#e6e2dc] rounded-lg">
                    <thead className="bg-[#f7f5f0]">
                      <tr>
                        <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">Peringkat</th>
                        <th className="px-3.5 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">Nama Pengaju</th>
                        <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">Pinjaman Diajukan</th>
                        <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase"><Tex>{"WSM"}</Tex></th>
                        <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase"><Tex>{"WPM"}</Tex></th>
                        <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase"><Tex>{"Q_i"}</Tex> (Utilitas)</th>
                        <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#e6e2dc] text-sm">
                      {results.map((res) => {
                        const isRecommended = res.rank <= 3;
                        return (
                          <tr key={res.id} className={isRecommended ? "bg-[#1b4d3e]/5" : "hover:bg-[#fcfbf9] transition-colors"}>
                            <td className="px-3.5 py-3.5 text-center font-bold text-[#1f1e1c]">{res.rank}</td>
                            <td className="px-3.5 py-3.5 font-semibold text-[#1f1e1c]">{res.nama}</td>
                            <td className="px-3.5 py-3.5 text-right font-mono text-[#1f1e1c]">Rp {res.pinjamanDiajukan.toLocaleString("id-ID")}</td>
                            <td className="px-3.5 py-3.5 text-right font-mono text-[#5e5b56]">{Number(res.wsm).toFixed(4)}</td>
                            <td className="px-3.5 py-3.5 text-right font-mono text-[#5e5b56]">{Number(res.wpm).toFixed(4)}</td>
                            <td className="px-3.5 py-3.5 text-right font-mono font-bold text-[#1b4d3e]">{Number(res.qi).toFixed(4)}</td>
                            <td className="px-3.5 py-3.5 text-center">
                              {isRecommended ? (
                                <Badge variant="rekomendasi">Rekomendasi</Badge>
                              ) : (
                                <span className="text-xs text-[#5e5b56]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Box for Top 3 */}
                <div className="bg-[#1b4d3e]/5 border border-[#1b4d3e]/20 rounded-xl p-5 space-y-3">
                  <h4 className="font-bold text-[#1b4d3e] text-sm">Ringkasan Rekomendasi (3 Peringkat Teratas):</h4>
                  <ul className="text-sm text-[#1f1e1c] list-disc list-inside space-y-1.5">
                    {topN.map((r) => (
                      <li key={r.id}>
                        Peringkat {r.rank}: <strong className="text-[#1b4d3e]">{r.nama}</strong> (<Tex>{"Q_i"}</Tex>: {Number(r.qi).toFixed(4)}, Pinjaman: Rp {r.pinjamanDiajukan.toLocaleString("id-ID")})
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-[#1b4d3e]/20 text-sm font-bold text-[#1b4d3e]">
                    Total Pinjaman Diajukan (3 Peringkat Teratas): Rp {totalPinjamanTop3.toLocaleString("id-ID")}
                  </div>
                </div>

                {/* Note about final decision */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
                  <strong>Catatan:</strong> Sistem ini hanya memberikan rekomendasi peringkat dan perhitungan objektif. Keputusan akhir mutlak ada pada Ketua Koperasi.
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function CalculationPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#1b4d3e]">Memuat...</div>}>
      <CalculationContent searchParams={searchParams} />
    </Suspense>
  );
}
