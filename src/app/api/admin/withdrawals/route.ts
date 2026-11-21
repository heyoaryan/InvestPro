import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { SessionUser } from "@/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as SessionUser;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;

  const where = status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {};

  const [withdrawals, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { requestedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.withdrawal.count({ where }),
  ]);

  return NextResponse.json({ withdrawals, total, page, perPage });
}

const actionSchema = z.object({
  withdrawalId: z.string(),
  action: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as SessionUser;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { withdrawalId, action } = parsed.data;

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
  }

  if (withdrawal.status !== "PENDING") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }

  if (action === "REJECTED") {
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "REJECTED", processedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: withdrawal.userId },
        data: { walletBalance: { increment: withdrawal.amount } },
      }),
      prisma.transaction.updateMany({
        where: {
          userId: withdrawal.userId,
          type: "WITHDRAWAL",
          status: "PENDING",
          amount: withdrawal.amount,
        },
        data: { status: "FAILED" },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "APPROVED", processedAt: new Date() },
      }),
      prisma.transaction.updateMany({
        where: {
          userId: withdrawal.userId,
          type: "WITHDRAWAL",
          status: "PENDING",
          amount: withdrawal.amount,
        },
        data: { status: "COMPLETED" },
      }),
    ]);
  }

  return NextResponse.json({ success: true });
}
