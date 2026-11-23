import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

async function EditApplicantContent({ params, searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  const search = await searchParams;
  const errorMessage = search.error;

  if (isNaN(id)) {
    redirect("/applicants?error=" + encodeURIComponent("ID pengaju tidak valid."));
  }

  const applicant = await prisma.applicant.findUnique({
    where: { id },
  });

  if (!applicant) {
    redirect("/applicants?error=" + encodeURIComponent("Data pengaju tidak ditemukan."));
  }

  async function updateApplicantAction(formData: FormData) {
    "use server";
    const nama = formData.get("nama")?.toString().trim();
    const simpanan = parseInt(parseThousands(formData.get("simpanan")?.toString()) || "", 10);
    const pinjamanDiajukan = parseInt(parseThousands(formData.get("pinjamanDiajukan")?.toString()) || "", 10);
    const urgensi = parseInt(formData.get("urgensi")?.toString() || "", 10);
    const tanggungan = parseInt(formData.get("tanggungan")?.toString() || "", 10);
    const umur = parseInt(formData.get("umur")?.toString() || "", 10);

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
      redirect(
        `/applicants/${id}/edit?error=` +
          encodeURIComponent(
            "Mohon isi data dengan benar: Nama wajib, Simpanan >= 0, Pinjaman 1 - 3.000.000, Urgensi 1-3, Tanggungan >= 0, Umur > 0."
          )
      );
    }

    const existing = await prisma.applicant.findUnique({ where: { id } });
    if (!existing) {
      redirect("/applicants?error=" + encodeURIComponent("Data pengaju tidak ditemukan di database."));
    }

    await prisma.applicant.update({
      where: { id },
      data: {
        nama,
        simpanan,
        pinjamanDiajukan,
        urgensi,
        tanggungan,
        umur,
      },
    });

    redirect("/applicants?success=" + encodeURIComponent("Data pengaju berhasil diperbarui"));
  }

  return (
    <AppLayout sessionUsername={session?.value}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1f1e1c]">Ubah Data Pengaju</h2>
            <p className="text-sm text-[#5e5b56] mt-1">Perbarui informasi pengaju pinjaman koperasi.</p>
          </div>
          <Link href="/applicants">
            <Button variant="secondary" className="text-xs">
              ← Kembali
            </Button>
          </Link>
        </div>

        {errorMessage && <Notification type="error" message={errorMessage} />}

        <Card title={`Edit Pengaju: ${applicant.nama}`}>
          <form action={updateApplicantAction} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                name="nama"
                required
                defaultValue={applicant.nama}
                placeholder="Contoh: Budi Santoso"
              />
              <CurrencyInput
                label="Jumlah Simpanan (Rp) [C1]"
                name="simpanan"
                required
                defaultValue={applicant.simpanan}
                placeholder="3.500.000"
              />
              <CurrencyInput
                label="Pinjaman Diajukan (Rp) [C2] (Max 3.000.000)"
                name="pinjamanDiajukan"
                required
                defaultValue={applicant.pinjamanDiajukan}
                placeholder="2.000.000"
              />
              <Select
                label="Tingkat Urgensi (1-3) [C3]"
                name="urgensi"
                required
                defaultValue={applicant.urgensi}
                options={urgencyOptions.map((o) => ({ value: o.value, label: `${o.value} = ${o.description}` }))}
              />
              <PositiveIntInput
                label="Jumlah Tanggungan [C4]"
                name="tanggungan"
                min={0}
                required
                defaultValue={applicant.tanggungan}
                placeholder="2"
              />
              <PositiveIntInput
                label="Umur (Tahun) [C5]"
                name="umur"
                min={1}
                required
                defaultValue={applicant.umur}
                placeholder="40"
              />
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
              <strong>Catatan:</strong> Perubahan tidak mengubah laporan yang sudah dibuat. Jalankan perhitungan lagi untuk mendapatkan peringkat baru.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6e2dc]">
              <Link href="/applicants">
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </Link>
              <Button type="submit" variant="primary">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function EditApplicantPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#1b4d3e]">Memuat...</div>}>
      <EditApplicantContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
