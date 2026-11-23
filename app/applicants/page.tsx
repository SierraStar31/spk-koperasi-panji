import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { urgencyOptions } from "@/src/lib/criteria";
import { AppLayout } from "@/app/components/AppLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { CurrencyInput } from "@/app/components/ui/CurrencyInput";
import { Select } from "@/app/components/ui/Select";
import { PositiveIntInput } from "@/app/components/ui/PositiveIntInput";
import { parseThousands } from "@/src/lib/format";
import { Notification } from "@/app/components/ui/Notification";
import { ConfirmForm } from "@/app/components/ConfirmForm";

export async function addApplicantAction(formData: FormData) {
  "use server";
  const nama = formData.get("nama")?.toString().trim();
  const simpanan = parseInt(parseThousands(formData.get("simpanan")?.toString()) || "0", 10);
  const pinjamanDiajukan = parseInt(parseThousands(formData.get("pinjamanDiajukan")?.toString()) || "0", 10);
  const urgensi = parseInt(formData.get("urgensi")?.toString() || "1", 10);
  const tanggungan = parseInt(formData.get("tanggungan")?.toString() || "0", 10);
  const umur = parseInt(formData.get("umur")?.toString() || "30", 10);

  if (
    !nama ||
    isNaN(simpanan) ||
    simpanan < 0 ||
    isNaN(pinjamanDiajukan) ||
    pinjamanDiajukan <= 0 ||
    pinjamanDiajukan > 3000000 ||
    isNaN(urgensi) ||
    urgensi < 1 ||
    urgensi > 3 ||
    isNaN(tanggungan) ||
    tanggungan < 0 ||
    isNaN(umur) ||
    umur <= 0
  ) {
    redirect("/applicants?error=" + encodeURIComponent("Mohon isi data dengan benar: Nama wajib, Simpanan >= 0, Pinjaman 1 - 3.000.000, Urgensi 1-3, Tanggungan >= 0, Umur > 0."));
  }

  await prisma.applicant.create({
    data: { nama, simpanan, pinjamanDiajukan, urgensi, tanggungan, umur },
  });

  redirect("/applicants");
}

export async function clearApplicantsAction() {
  "use server";
  await prisma.applicant.deleteMany({});
  redirect("/applicants");
}

export async function deleteApplicantAction(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id")?.toString() || "", 10);

  if (isNaN(id)) {
    redirect("/applicants?error=" + encodeURIComponent("ID pengaju tidak valid."));
  }

  const existing = await prisma.applicant.findUnique({ where: { id } });
  if (!existing) {
    redirect("/applicants?error=" + encodeURIComponent("Data pengaju tidak ditemukan atau sudah dihapus."));
  }

  try {
    await prisma.applicant.delete({ where: { id } });
  } catch {
    redirect("/applicants?error=" + encodeURIComponent("Data pengaju tidak ditemukan atau sudah dihapus."));
  }

  revalidatePath("/applicants");
  redirect("/applicants?success=" + encodeURIComponent("Data pengaju berhasil dihapus"));
}

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

async function ApplicantsContent({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const params = await searchParams;
  const errorMessage = params.error;
  const successMessage = params.success;

  const applicants = await prisma.applicant.findMany({ orderBy: { id: "asc" } });

  return (
    <AppLayout sessionUsername={session?.value}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1f1e1c]">Input Data Pengaju</h2>
            <p className="text-[#5e5b56] text-sm mt-1">
              Kelola data calon penerima pinjaman. Perhitungan WASPAS dijalankan terpisah di halaman Perhitungan.
            </p>
          </div>
          <Link href="/calculation">
            <Button variant="secondary" className="text-xs">
              Lanjut ke Perhitungan →
            </Button>
          </Link>
        </div>

        {errorMessage && <Notification type="error" message={errorMessage} />}
        {successMessage && <Notification type="success" message={successMessage} />}

        <Card
          title="Tambah Pengaju Baru"
          description="Lengkapi seluruh data pengaju lalu simpan."
        >
          <form action={addApplicantAction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <Input label="Nama Lengkap" name="nama" required placeholder="Contoh: Budi Santoso" />
            <CurrencyInput label="Jumlah Simpanan (Rp)" name="simpanan" required placeholder="3.500.000" />
            <CurrencyInput label="Pinjaman Diajukan (Rp)" name="pinjamanDiajukan" required placeholder="2.000.000" />
            <Select
              label="Tingkat Urgensi (1-3)"
              name="urgensi"
              required
              defaultValue=""
              placeholder="— Pilih tingkat urgensi —"
              options={urgencyOptions.map((o) => ({ value: o.value, label: `${o.value} = ${o.description}` }))}
            />
            <PositiveIntInput label="Jumlah Tanggungan" name="tanggungan" min={0} required placeholder="2" />
            <PositiveIntInput label="Umur (Tahun)" name="umur" min={17} max={80} required placeholder="40" />
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
              <Button type="submit" variant="primary">
                Simpan Pengaju
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title={`Daftar Pengaju Saat Ini (${applicants.length})`}
          action={
            applicants.length > 0 ? (
              <ConfirmForm
                action={clearApplicantsAction}
                message="Apakah Anda yakin ingin menghapus semua pengaju? Riwayat dan laporan tidak ikut terhapus."
              >
                <Button variant="danger" className="text-xs">
                  Hapus Semua Pengaju
                </Button>
              </ConfirmForm>
            ) : undefined
          }
        >
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
                    <th className="px-3.5 py-3 text-center text-xs font-semibold text-[#1f1e1c] uppercase">Aksi</th>
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
                      <td className="px-3.5 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/applicants/${app.id}/edit`}>
                            <Button variant="secondary" className="text-xs py-1 px-2.5">
                              Ubah
                            </Button>
                          </Link>
                          <ConfirmForm
                            action={deleteApplicantAction}
                            message={`Hapus pengaju ${app.nama}? Riwayat dan laporan yang sudah dibuat tidak ikut terhapus.`}
                          >
                            <input type="hidden" name="id" value={app.id} />
                            <Button type="submit" variant="danger-soft" className="text-xs py-1 px-2.5">
                              Hapus
                            </Button>
                          </ConfirmForm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

export default function ApplicantsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#1b4d3e]">Memuat...</div>}>
      <ApplicantsContent searchParams={searchParams} />
    </Suspense>
  );
}
