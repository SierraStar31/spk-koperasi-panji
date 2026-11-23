import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPK Koperasi Panji Borneo Mandiri",
  description: "Sistem Pendukung Keputusan penerima pinjaman dengan metode WASPAS dan ROC",
  icons: { icon: "/logo%20koperasi.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ReactLenis root />
        {children}
      </body>
    </html>
  );
}
