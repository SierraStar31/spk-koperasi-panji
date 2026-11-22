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
    <div className="flex min-h-screen items-center justify-center bg-[#fcfbf9] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <Image
            src="/logo%20koperasi.svg"
            alt="Logo Koperasi Panji Borneo Mandiri"
            width={80}
            height={80}
            priority
            className="w-20 h-20 mx-auto rounded-2xl shadow-md"
          />
          <h1 className="text-2xl font-bold text-[#1f1e1c] tracking-tight">Koperasi Panji Borneo Mandiri</h1>
          <p className="text-sm text-[#5e5b56]">Login Khusus Ketua Koperasi</p>
        </div>

        <Card className="shadow-md">
          {errorMessage && <Notification type="error" message={errorMessage} className="mb-6" />}

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
