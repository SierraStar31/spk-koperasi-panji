import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import Link from "next/link";
import { AppLayout } from "./components/AppLayout";
import { Card, Button } from "./components/UI";

export async function loginAction(formData: FormData) {
  "use server";
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    redirect("/login?error=" + encodeURIComponent("Username dan password tidak boleh kosong."));
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Username atau password salah."));
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    redirect("/login?error=" + encodeURIComponent("Username atau password salah."));
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: "session",
    value: user.username,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  });

  redirect("/");
}

async function HomeContent() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const applicantCount = await prisma.applicant.count();
  const calculationCount = await prisma.calculation.count();

  return (
    <AppLayout sessionUsername={session.value}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 rounded-2xl text-white p-8 shadow-sm">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold tracking-wide uppercase border border-teal-700">
              Dashboard Ketua Koperasi
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Sistem Pendukung Keputusan Pinjaman
            </h1>
            <p className="text-teal-100 text-sm leading-relaxed">
              Mengevaluasi dan menentukan kelayakan calon penerima pinjaman secara transparan, objektif, dan adil menggunakan metode WASPAS dan pembobotan ROC.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card title="Total Data Pengaju" subtitle="Alternatif aktif saat ini" className="flex flex-col justify-between">
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-stone-900">{applicantCount}</span>
              <span className="text-sm text-stone-500">Orang pengaju</span>
            </div>
            <Link href="/calculation">
              <Button variant="secondary" className="w-full">Kelola Pengaju</Button>
            </Link>
          </Card>

          <Card title="Riwayat Perhitungan" subtitle="Laporan dan arsip rekomendasi" className="flex flex-col justify-between">
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-stone-900">{calculationCount}</span>
              <span className="text-sm text-stone-500">Arsip perhitungan</span>
            </div>
            <Link href="/calculation/history">
              <Button variant="secondary" className="w-full">Lihat Riwayat & Laporan</Button>
            </Link>
          </Card>
        </div>

        {/* Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Manajemen Kriteria & Bobot" subtitle="Konfigurasi C1 s.d. C5 dan bobot ROC otomatis">
            <p className="text-stone-600 text-sm mb-6">
              Periksa daftar kriteria, atribut benefit/cost, tingkat prioritas, dan bobot Rank Order Centroid (ROC) yang digunakan dalam perhitungan sistem.
            </p>
            <Link href="/criteria">
              <Button variant="primary">Kelola Kriteria</Button>
            </Link>
          </Card>

          <Card title="Perhitungan & Rekomendasi" subtitle="Jalankan WASPAS & perankingan alternatif">
            <p className="text-stone-600 text-sm mb-6">
              Masukkan data pengaju, jalankan perhitungan matriks normalisasi, utilitas WSM & WPM, serta dapatkan 3 besar peringkat rekomendasi untuk Ketua Koperasi.
            </p>
            <Link href="/calculation">
              <Button variant="primary">Mulai Perhitungan</Button>
            </Link>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-stone-500">Memuat sistem...</div>}>
      <HomeContent />
    </Suspense>
  );
}
