import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateReferralCode } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
  adminCode: z.string().optional(),
});

// GET — check if any user exists yet (used by register page to show admin prompt)
export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ hasUsers: count > 0 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password, referralCode, adminCode } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  // Determine role
  const totalUsers = await prisma.user.count();
  let role: "MEMBER" | "ADMIN" = "MEMBER";

  if (totalUsers === 0 && adminCode) {
    const secret = process.env.ADMIN_SETUP_CODE;
    if (!secret) {
      return NextResponse.json({ error: "Admin setup not configured on server" }, { status: 500 });
    }
    if (adminCode !== secret) {
      return NextResponse.json({ error: "Invalid admin code" }, { status: 403 });
    }
    role = "ADMIN";
  }

  let referredById: string | undefined;
  if (referralCode && role === "MEMBER") {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (referrer) {
      referredById = referrer.id;
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let code = generateReferralCode();

  while (await prisma.user.findUnique({ where: { referralCode: code } })) {
    code = generateReferralCode();
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      referralCode: code,
      referredById,
      role,
    },
  });

  return NextResponse.json({ id: user.id, role: user.role }, { status: 201 });
}
