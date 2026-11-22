import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { criteria, calculateRocWeights, convertToScore } from "@/src/lib/criteria";
import { calculateWaspas } from "@/src/lib/waspas";
import { testFixtures } from "@/src/lib/__tests__/fixtures";
import { AppLayout } from "@/app/components/AppLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import { Notification } from "@/app/components/ui/Notification";

export async function addApplicantAction(formData: FormData) {
  "use server";
  const nama = formData.get("nama")?.toString().trim();
  const simpanan = parseInt(formData.get("simpanan")?.toString() || "0", 10);
  const pinjamanDiajukan = parseInt(formData.get("pinjamanDiajukan")?.toString() || "0", 10);
  const urgensi = parseInt(formData.get("urgensi")?.toString() || "1", 10);
  const tanggungan = parseInt(formData.get("tanggungan")?.toString() || "0", 10);
  const umur = parseInt(formData.get("umur")?.toString() || "30", 10);

  if (!nama || isNaN(simpanan) || isNaN(pinjamanDiajukan) || isNaN(urgensi) || isNaN(tanggungan) || isNaN(umur)) {
    redirect("/calculation?error=" + encodeURIComponent("Mohon isi semua data pengaju dengan benar."));
  }

  await prisma.applicant.create({
    data: { nama, simpanan, pinjamanDiajukan, urgensi, tanggungan, umur },
  });

  redirect("/calculation");
}

export async function loadFixturesAction() {
  "use server";
  await prisma.applicant.deleteMany({});
  for (const f of testFixtures) {
    await prisma.applicant.create({
      data: {
        nama: f.nama,
        simpanan: f.simpanan,
        pinjamanDiajukan: f.pinjamanDiajukan,
        urgensi: f.urgensi,
        tanggungan: f.tanggungan,
        umur: f.umur,
      },
    });
  }
  redirect("/calculation");
}

export async function clearApplicantsAction() {
  "use server";
  await prisma.calculationResult.deleteMany({});
  await prisma.calculation.deleteMany({});
  await prisma.applicant.deleteMany({});
  redirect("/calculation");
}

export async function calculateAction() {
  "use server";
  const applicants = await prisma.applicant.findMany({ orderBy: { id: "asc" } });
  if (applicants.length === 0) {
    redirect("/calculation?error=" + encodeURIComponent("Isi data pengaju terlebih dahulu"));
  }

  const weights = calculateRocWeights(criteria.length);
  const criteriaConfig = criteria.map((c, idx) => ({
    code: c.code,
    type: c.type,
    weight: weights[idx],
  }));

  const alternatives = applicants.map((app) => ({
    id: String(app.id),
    name: app.nama,
    scores: {
      C1: convertToScore("C1", app.simpanan),
      C2: convertToScore("C2", app.pinjamanDiajukan),
      C3: convertToScore("C3", app.urgensi),
      C4: convertToScore("C4", app.tanggungan),
      C5: convertToScore("C5", app.umur),
    },
  }));

  const waspasOutput = calculateWaspas(alternatives, criteriaConfig);

  await prisma.$transaction(async (tx) => {
    const calculation = await tx.calculation.create({ data: {} });

    for (const res of waspasOutput.results) {
      const applicant = applicants.find((a) => String(a.id) === res.id)!;
      const c1 = convertToScore("C1", applicant.simpanan);
      const c2 = convertToScore("C2", applicant.pinjamanDiajukan);
      const c3 = convertToScore("C3", applicant.urgensi);
      const c4 = convertToScore("C4", applicant.tanggungan);
      const c5 = convertToScore("C5", applicant.umur);

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
          c1,
          c2,
          c3,
          c4,
          c5,
        },
      });
    }
  });

  redirect("/calculation#perhitungan");
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

async function CalculationContent({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const params = await searchParams;
  const errorMessage = params.error;

  const applicants = await prisma.applicant.findMany({ orderBy: { id: "asc" } });
  const hasApplicants = applicants.length > 0;

  const latestCalculation = await prisma.calculation.findFirst({
    orderBy: { id: "desc" },
    include: {
      results: {
        orderBy: { rank: "asc" },
      },
    },
  });

  let waspasOutput = null;
  if (hasApplicants) {
    const weights = calculateRocWeights(criteria.length);
    const criteriaConfig = criteria.map((c, idx) => ({
      code: c.code,
      type: c.type,
      weight: weights[idx],
    }));

    const alternatives = applicants.map((app) => ({
      id: String(app.id),
      name: app.nama,
      scores: {
        C1: convertToScore("C1", app.simpanan),
        C2: convertToScore("C2", app.pinjamanDiajukan),
        C3: convertToScore("C3", app.urgensi),
        C4: convertToScore("C4", app.tanggungan),
        C5: convertToScore("C5", app.umur),
      },
    }));

    waspasOutput = calculateWaspas(alternatives, criteriaConfig);
  }

  const results = latestCalculation?.results || [];
  const topN = results.slice(0, 3);
  const totalPinjamanTop3 = topN.reduce((sum, r) => sum + r.pinjamanDiajukan, 0);

  return (
    <AppLayout sessionUsername={session?.value}>
      <div className="space-y-8">
        {errorMessage && <Notification type="error" message={errorMessage} />}

        {/* Action Panel & Applicant Management */}
        <Card
          title="Data Pengaju & Eksekusi Perhitungan"
          description="Kelola data pengaju pinjaman dan jalankan metode WASPAS dengan pembobotan ROC."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/calculation/history">
                <Button variant="secondary" className="text-xs">
                  📜 Riwayat Laporan
                </Button>
              </Link>
              <form action={loadFixturesAction}>
                <Button variant="secondary" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                  ⚡ Muat Data Contoh (7 Pengaju)
                </Button>
              </form>
              {hasApplicants && (
                <form action={clearApplicantsAction}>
                  <Button variant="danger" className="text-xs">
                    Hapus Semua Data
                  </Button>
                </form>
              )}
            </div>
          }
        >
          <div className="space-y-6 pt-2">
            {/* Hitung Button Form */}
            <div className="bg-[#f7f5f0] border border-[#e6e2dc] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-[#1f1e1c] text-sm">Proses Kalkulasi WASPAS</h4>
                <p className="text-xs text-[#5e5b56] mt-0.5">
                  {hasApplicants
                    ? `Terdapat ${applicants.length} pengaju siap dihitung dalam sistem.`
                    : "Belum ada data pengaju. Silakan tambah data atau muat data contoh."}
                </p>
              </div>
              <form action={calculateAction}>
                <Button
                  type="submit"
                  disabled={!hasApplicants}
                  variant="primary"
                >
                  Hitung Sekarang
                </Button>
              </form>
            </div>
            {!hasApplicants && (
              <p className="text-xs text-amber-700 font-medium italic">
                * Tombol &quot;Hitung Sekarang&quot; nonaktif karena belum ada data pengaju.
              </p>
            )}

            {/* Add Applicant Form */}
            <details className="border border-[#e6e2dc] rounded-xl p-5 bg-white group">
              <summary className="font-semibold text-sm text-[#1b4d3e] cursor-pointer select-none flex items-center gap-2">
                <span className="text-lg">＋</span> Tambah Pengaju Baru Secara Manual
              </summary>
              <form action={addApplicantAction} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#e6e2dc]">
                <Input label="Nama Lengkap" name="nama" required placeholder="Contoh: Budi Santoso" />
                <Input label="Jumlah Simpanan (Rp)" name="simpanan" type="number" required placeholder="3500000" />
                <Input label="Pinjaman Diajukan (Rp)" name="pinjamanDiajukan" type="number" required placeholder="2000000" />
                <Input label="Tingkat Urgensi (1-3)" name="urgensi" type="number" min="1" max="3" required placeholder="2" />
                <Input label="Jumlah Tanggungan" name="tanggungan" type="number" min="0" required placeholder="2" />
                <Input label="Umur (Tahun)" name="umur" type="number" min="17" max="80" required placeholder="40" />
                <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                  <Button type="submit" variant="primary">
                    Simpan Pengaju
                  </Button>
                </div>
              </form>
            </details>
          </div>
        </Card>

        {/* Applicants List Table */}
        <Card title={`Daftar Pengaju Saat Ini (${applicants.length})`}>
          {applicants.length === 0 ? (
            <p className="text-[#5e5b56] text-sm italic py-4">Belum ada data pengaju di sistem.</p>
          ) : (
            <div className="overflow-x-auto pt-2">
              <table className="min-w-full divide-y divide-[#e6e2dc] border border-[#e6e2dc] rounded-lg">
                <thead className="bg-[#f7f5f0]">
                  <tr>
                    <th className="px-3.5 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">No</th>
                    <th className="px-3.5 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">Nama</th>
                    <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">C1 Simpanan</th>
                    <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">C2 Pinjaman</th>
                    <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C3 Urgensi</th>
                    <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C4 Tanggungan</th>
                    <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">C5 Umur</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e6e2dc] text-sm">
                  {applicants.map((app, idx) => (
                    <tr key={app.id} className="hover:bg-[#fcfbf9] transition-colors">
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-[#5e5b56]">{idx + 1}</td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap font-semibold text-[#1f1e1c]">{app.nama}</td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-right font-mono text-[#1f1e1c]">Rp {app.simpanan.toLocaleString("id-ID")}</td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-right font-mono text-[#1f1e1c]">Rp {app.pinjamanDiajukan.toLocaleString("id-ID")}</td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-center text-[#5e5b56]">{app.urgensi}</td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-center text-[#5e5b56]">{app.tanggungan}</td>
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-center text-[#5e5b56]">{app.umur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Calculation Results & Matrices (Scroll Target #perhitungan) */}
        <div id="perhitungan" className="space-y-8 scroll-mt-8">
          {waspasOutput && (
            <div className="space-y-8">
              {/* Decision Matrix */}
              <Card title="1. Matriks Keputusan (Skor Konversi C1 - C5)" description="Nilai asli pengaju yang dikonversi ke skor ordinal (1-5).">
                <div className="overflow-x-auto pt-2">
                  <table className="min-w-full divide-y divide-[#e6e2dc] border border-[#e6e2dc] rounded-lg">
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
                    <tbody className="bg-white divide-y divide-[#e6e2dc] text-sm">
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
              </Card>

              {/* Normalized Matrix */}
              <Card title="2. Matriks Normalisasi (r_ij)" description="Hasil normalisasi kriteria benefit dan cost.">
                <div className="overflow-x-auto pt-2">
                  <table className="min-w-full divide-y divide-[#e6e2dc] border border-[#e6e2dc] rounded-lg">
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
                    <tbody className="bg-white divide-y divide-[#e6e2dc] text-sm font-mono">
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
              </Card>
            </div>
          )}

          {/* Ranking & Results Table */}
          {latestCalculation && results.length > 0 && (
            <Card
              title="3. Tabel Peringkat & Nilai WASPAS (WSM, WPM, Q_i)"
              description="Diurutkan berdasarkan nilai utilitas gabungan Q_i terbesar."
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
                        <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">WSM</th>
                        <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">WPM</th>
                        <th className="px-3.5 py-3 text-right text-xs font-semibold text-[#1f1e1c] uppercase">Q_i (Utilitas)</th>
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
                        Peringkat {r.rank}: <strong className="text-[#1b4d3e]">{r.nama}</strong> (Q_i: {Number(r.qi).toFixed(4)}, Pinjaman: Rp {r.pinjamanDiajukan.toLocaleString("id-ID")})
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
