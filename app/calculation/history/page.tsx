import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { AppLayout } from "@/app/components/AppLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ConfirmForm } from "@/app/components/ConfirmForm";
import { Tex } from "@/src/components/Tex";

export async function deleteCalculationAction(formData: FormData) {
  "use server";
  const idStr = formData.get("calculationId")?.toString();
  if (!idStr) return;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return;
  // Soft delete: baris tetap tersimpan agar riwayat tidak hilang permanen.
  await prisma.calculation.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/calculation/history");
  revalidatePath("/calculation");
  redirect("/calculation/history");
}

async function HistoryContent() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  const calculations = await prisma.calculation.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      results: {
        orderBy: { rank: "asc" },
      },
    },
  });

  return (
    <AppLayout sessionUsername={session?.value}>
      <div className="space-y-6">
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
                              message="Sembunyikan perhitungan ini dari daftar? Data tetap tersimpan di database dan tidak hilang permanen."
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

export default function CalculationHistoryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#1b4d3e]">Memuat riwayat...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
