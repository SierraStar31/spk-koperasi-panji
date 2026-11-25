import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { AppLayout } from "@/app/components/AppLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Notification } from "@/app/components/ui/Notification";
import { ConfirmForm } from "@/app/components/ConfirmForm";
import { Tex } from "@/src/components/Tex";

export async function deleteCalculationAction(formData: FormData) {
  "use server";
  await requireSession();
  const idStr = formData.get("calculationId")?.toString();
  if (!idStr) return;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return;
  // Hapus permanen: baris calculation dihapus, results ikut terhapus lewat onDelete: Cascade.
  await prisma.calculation.delete({ where: { id } });
  revalidatePath("/calculation/history");
  revalidatePath("/calculation");
  redirect("/calculation/history?success=" + encodeURIComponent("Perhitungan berhasil dihapus."));
}

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

async function HistoryContent({ searchParams }: PageProps) {
  const sessionUsername = await requireSession();
  const params = await searchParams;
  const errorMessage = params.error;
  const successMessage = params.success;

  const calculations = await prisma.calculation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      results: {
        orderBy: { rank: "asc" },
      },
    },
  });

  return (
    <AppLayout sessionUsername={sessionUsername}>
      <div className="space-y-6">
        {errorMessage && <Notification type="error" message={errorMessage} />}
        {successMessage && <Notification type="success" message={successMessage} />}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1f1e1c]">Riwayat & Laporan Perhitungan</h2>
            <p className="text-[#5e5b56] text-sm mt-1">
              Arsip laporan perhitungan WASPAS sebelumnya yang tersimpan secara permanen untuk referensi dan cetak laporan resmi.
            </p>
          </div>
          <Link href="/calculation">
            <Button variant="secondary" className="text-xs">
              ← Kembali ke Perhitungan
            </Button>
          </Link>
        </div>

        <Card>
          {calculations.length === 0 ? (
            <EmptyState
              title="Belum ada riwayat perhitungan"
              description="Lakukan perhitungan data pengaju terlebih dahulu untuk menyimpan laporan riwayat."
              action={
                <Link href="/calculation">
                  <Button variant="primary">Mulai Perhitungan Baru</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto pt-2">
              <table className="min-w-full divide-y divide-[#e6e2dc] border border-[#e6e2dc] rounded-lg">
                <thead className="bg-[#f7f5f0]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">ID Kalkulasi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">Tanggal & Waktu</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">Jumlah Alternatif</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#1f1e1c] uppercase">Peringkat 1 (Teratas)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#e6e2dc] text-sm">
                  {calculations.map((calc) => {
                    const topCandidate = calc.results.find((r) => r.rank === 1);
                    const formattedDate = new Date(calc.createdAt).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "medium",
                    });
                    return (
                      <tr key={calc.id} className="hover:bg-[#fcfbf9] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-semibold text-[#1f1e1c]">#{calc.id}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-[#5e5b56]">{formattedDate}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center text-[#5e5b56]">{calc.results.length} Pengaju</td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-[#1f1e1c]">
                          {topCandidate ? <>{topCandidate.nama} (<Tex>{"Q_i"}</Tex>: {Number(topCandidate.qi).toFixed(4)})</> : "-"}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/calculation/${calc.id}/print`}>
                              <Button variant="primary" className="text-xs py-1.5 px-3">
                                Cetak Laporan
                              </Button>
                            </Link>
                            <ConfirmForm
                              action={deleteCalculationAction}
                              message="Hapus perhitungan ini dari riwayat? Data perhitungan akan dihapus permanen."
                            >
                              <input type="hidden" name="calculationId" value={calc.id} />
                              <Button variant="danger" className="text-xs py-1.5 px-3">
                                Hapus dari daftar
                              </Button>
                            </ConfirmForm>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

export default function CalculationHistoryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#1b4d3e]">Memuat riwayat...</div>}>
      <HistoryContent searchParams={searchParams} />
    </Suspense>
  );
}
