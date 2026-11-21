import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function main() {
  // Clean slate
  await prisma.adminReserve.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD env variable is required to seed admin account");
  }

  const adminHash = await bcrypt.hash(adminPassword, 12);

  let code = generateReferralCode();
  while (await prisma.user.findUnique({ where: { referralCode: code } })) {
    code = generateReferralCode();
  }

  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL ?? "admin@investpro.app",
      passwordHash: adminHash,
      name: "Admin",
      referralCode: code,
      role: "ADMIN",
      walletBalance: 0,
    },
  });

  console.log("Seed completed: admin account created.");
  console.log("No mock member data seeded — production ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
