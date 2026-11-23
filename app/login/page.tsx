import { loginAction } from "../page";
import { Suspense } from "react";
import Image from "next/image";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Notification } from "@/app/components/ui/Notification";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

async function LoginForm({ searchParams }: PageProps) {
  const params = await searchParams;
  const errorMessage = params.error;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-[#fcfbf9]">
      {/* Panel kiri: lebarnya mengikuti rasio asli wallpaper (1200x1500 = 4:5) */}
      <div className="relative hidden lg:block lg:h-full lg:aspect-[4/5] lg:max-w-[60%] shrink-0 bg-[#091512]">
        <Image
          src="/wallpaper-koperasi.svg"
          alt="Ilustrasi Koperasi Panji Borneo Mandiri"
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </div>

      {/* Panel kanan: form login, mengisi sisa lebar */}
      <div className="flex-1 min-w-0 flex items-center justify-center px-4 py-12 lg:overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden flex items-center gap-3">
            <Image
              src="/logo%20koperasi.svg"
              alt="Logo Koperasi Panji Borneo Mandiri"
              width={48}
              height={48}
              priority
              className="w-12 h-12 rounded-md"
            />
            <div>
              <p className="text-sm font-bold text-[#1f1e1c] leading-tight">
                Koperasi Panji Borneo Mandiri
              </p>
              <p className="text-xs text-[#5e5b56]">SPK Penerima Pinjaman</p>
            </div>
          </div>

          <Card className="shadow-sm">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#1f1e1c] tracking-tight">
                Login Ketua Koperasi
              </h1>
              <p className="text-sm text-[#5e5b56] mt-1">
                Masukkan kredensial untuk mengakses sistem.
              </p>
            </div>

            {errorMessage && (
              <Notification type="error" message={errorMessage} className="mb-5" />
            )}

            <form action={loginAction} className="space-y-4">
              <Input
                label="Username"
                name="username"
                type="text"
                required
                placeholder="Masukkan username ketua"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                required
                placeholder="Masukkan password"
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full">
                  Masuk ke Sistem
                </Button>
              </div>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-[#5e5b56]">
            Sistem Pendukung Keputusan Prioritas Penerima Pinjaman
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#1b4d3e]">Memuat...</div>}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}
