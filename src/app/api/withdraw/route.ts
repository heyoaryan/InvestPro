import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WITHDRAWAL_FEE_RATE } from "@/lib/utils";
import type { SessionUser } from "@/types";

const withdrawSchema = z.object({
  amount: z.number().positive().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  const body = await req.json();
  const parsed = withdrawSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const { amount } = parsed.data;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { walletBalance: true },
  });

  if (!dbUser || dbUser.walletBalance < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const fee = amount * WITHDRAWAL_FEE_RATE;
  const netAmount = amount - fee;

  const [withdrawal] = await prisma.$transaction([
    prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        fee,
        netAmount,
        status: "PENDING",
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { walletBalance: { decrement: amount } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "WITHDRAWAL",
        amount,
        status: "PENDING",
        description: `Withdrawal request — net ${netAmount.toFixed(2)} after fee`,
      },
    }),
  ]);

  return NextResponse.json(withdrawal, { status: 201 });
}
