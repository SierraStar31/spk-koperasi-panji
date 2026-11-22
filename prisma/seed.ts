import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const username = "ketua";
  const rawPassword = process.env.KETUA_PASSWORD || "ketua123";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // Seed should be idempotent (runnable multiple times without duplicating account)
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { username },
      data: { passwordHash },
    });
    console.log("Akun Ketua sudah ada, password diperbarui.");
  } else {
    await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });
    console.log("Akun Ketua berhasil dibuat.");
  }

  // Tabel Applicant harus kosong saat sistem pertama kali dijalankan (tidak ada data pengaju di seed).
  const applicantCount = await prisma.applicant.count();
  console.log(`Jumlah pengaju di database saat ini: ${applicantCount} (kosong sesuai ketentuan).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
