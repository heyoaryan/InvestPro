import { prisma } from "./db";
import {
  PACKAGE_CONFIGS,
  LEVEL_CONFIGS,
  DIRECT_REFERRAL_RATE,
} from "./utils";
import type { Package, User } from "@prisma/client";
import type { PackageTierKey } from "@/types";

export function computeDailyRoi(pkg: Package): number {
  if (pkg.capped || pkg.status !== "ACTIVE") return 0;
  const dailyEarning = pkg.investmentAmount * pkg.dailyRoiRate;
  const remaining = pkg.maxEarnings - pkg.totalEarned;
  return Math.max(0, Math.min(dailyEarning, remaining));
}

export function isCapped(pkg: Package): boolean {
  return pkg.totalEarned >= pkg.maxEarnings;
}

async function countDirectReferrals(userId: string): Promise<number> {
  return prisma.user.count({ where: { referredById: userId } });
}

async function countTeamSize(userId: string): Promise<number> {
  let total = 0;
  const queue: string[] = [userId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const children = await prisma.user.findMany({
      where: { referredById: current },
      select: { id: true },
    });

    for (const child of children) {
      total++;
      queue.push(child.id);
    }
  }

  return total;
}

export async function checkLevelQualification(
  userId: string,
  level: number
): Promise<boolean> {
  const config = LEVEL_CONFIGS.find((l) => l.level === level);
  if (!config) return false;

  const [directs, teamSize] = await Promise.all([
    countDirectReferrals(userId),
    countTeamSize(userId),
  ]);

  return directs >= config.requiredDirects && teamSize >= config.requiredTeamSize;
}

export async function processDirectReferralBonus(
  newUserId: string,
  packageValue: number
): Promise<void> {
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { referredById: true },
  });

  if (!newUser?.referredById) return;

  const bonus = packageValue * DIRECT_REFERRAL_RATE;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: newUser.referredById },
      data: { walletBalance: { increment: bonus } },
    }),
    prisma.transaction.create({
      data: {
        userId: newUser.referredById,
        type: "DIRECT_REFERRAL",
        amount: bonus,
        status: "COMPLETED",
        description: `Direct referral bonus from new package activation`,
      },
    }),
  ]);
}

export async function scheduleTeamCommissions(
  activatedUserId: string,
  packageId: string,
  packageValue: number
): Promise<void> {
  // Build the ancestor chain first (up to 5 levels)
  const ancestors: string[] = [];
  let currentUserId = activatedUserId;

  for (let i = 0; i < LEVEL_CONFIGS.length; i++) {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { referredById: true },
    });
    if (!user?.referredById) break;
    ancestors.push(user.referredById);
    currentUserId = user.referredById;
  }

  // For every level in the plan, either pay the ancestor or flush to reserve
  for (let i = 0; i < LEVEL_CONFIGS.length; i++) {
    const levelConfig = LEVEL_CONFIGS[i];
    const levelAmount = packageValue * levelConfig.percentage;
    const installmentAmount = levelAmount / 3;

    if (i >= ancestors.length) {
      // Chain too short — no ancestor at this level, flush entire amount
      await prisma.adminReserve.create({
        data: {
          amount: levelAmount,
          reason: `Level ${levelConfig.level} flush — no ancestor at this depth`,
        },
      });
      continue;
    }

    const ancestorId = ancestors[i];
    const qualified = await checkLevelQualification(ancestorId, levelConfig.level);

    if (qualified) {
      await prisma.commission.create({
        data: {
          fromUserId: activatedUserId,
          toUserId: ancestorId,
          packageId,
          level: levelConfig.level,
          totalAmount: levelAmount,
          installment1: installmentAmount,
          installment2: installmentAmount,
          installment3: levelAmount - 2 * installmentAmount,
          activationDate: new Date(),
        },
      });
    } else {
      await prisma.adminReserve.create({
        data: {
          amount: levelAmount,
          reason: `Level ${levelConfig.level} flush — user ${ancestorId} unqualified`,
        },
      });
    }
  }
}

export async function processDueInstallments(): Promise<{ processed: number; amount: number }> {
  const now = new Date();
  let processed = 0;
  let totalAmount = 0;

  const pendingCommissions = await prisma.commission.findMany({
    where: {
      OR: [
        { inst1Paid: false },
        { inst2Paid: false },
        { inst3Paid: false },
      ],
    },
  });

  for (const commission of pendingCommissions) {
    const activationDate = new Date(commission.activationDate);
    const daysPassed = Math.floor(
      (now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const updates: Record<string, unknown> = {};
    let amountDue = 0;

    if (!commission.inst1Paid && daysPassed >= 10) {
      updates.inst1Paid = true;
      updates.inst1PaidAt = now;
      amountDue += commission.installment1;
    }

    if (!commission.inst2Paid && daysPassed >= 20) {
      updates.inst2Paid = true;
      updates.inst2PaidAt = now;
      amountDue += commission.installment2;
    }

    if (!commission.inst3Paid && daysPassed >= 30) {
      updates.inst3Paid = true;
      updates.inst3PaidAt = now;
      amountDue += commission.installment3;
    }

    if (amountDue > 0) {
      const recipient = await prisma.user.findUnique({
        where: { id: commission.toUserId },
        select: { id: true },
      });

      if (!recipient) continue;

      await prisma.$transaction([
        prisma.commission.update({
          where: { id: commission.id },
          data: updates,
        }),
        prisma.user.update({
          where: { id: commission.toUserId },
          data: { walletBalance: { increment: amountDue } },
        }),
        prisma.transaction.create({
          data: {
            userId: commission.toUserId,
            type: "TEAM_COMMISSION",
            amount: amountDue,
            status: "COMPLETED",
            description: `Team commission installment — Level ${commission.level}`,
          },
        }),
      ]);

      processed++;
      totalAmount += amountDue;
    }
  }

  return { processed, amount: totalAmount };
}

export async function runDailyRoi(): Promise<{ processed: number; totalRoi: number }> {
  const activePackages = await prisma.package.findMany({
    where: { status: "ACTIVE", capped: false },
  });

  let processed = 0;
  let totalRoi = 0;

  for (const pkg of activePackages) {
    const roi = computeDailyRoi(pkg);
    if (roi <= 0) continue;

    const newTotal = pkg.totalEarned + roi;
    const willCap = newTotal >= pkg.maxEarnings;

    await prisma.$transaction([
      prisma.package.update({
        where: { id: pkg.id },
        data: {
          totalEarned: { increment: roi },
          capped: willCap,
          status: willCap ? "CAPPED" : "ACTIVE",
        },
      }),
      prisma.user.update({
        where: { id: pkg.userId },
        data: { walletBalance: { increment: roi } },
      }),
      prisma.transaction.create({
        data: {
          userId: pkg.userId,
          type: "ROI",
          amount: roi,
          status: "COMPLETED",
          description: `Daily ROI — ${pkg.tier} package`,
        },
      }),
    ]);

    processed++;
    totalRoi += roi;
  }

  return { processed, totalRoi };
}

export async function activatePackage(
  userId: string,
  tier: PackageTierKey
): Promise<Package> {
  const config = PACKAGE_CONFIGS[tier];

  const existing = await prisma.package.findFirst({
    where: { userId, status: "ACTIVE" },
  });

  if (existing) {
    throw new Error("User already has an active package");
  }

  const pkg = await prisma.package.create({
    data: {
      userId,
      tier,
      investmentAmount: config.investmentAmount,
      dailyRoiRate: config.dailyRoiRate,
      maxEarnings: config.investmentAmount * config.maxMultiplier,
      status: "ACTIVE",
    },
  });

  await prisma.transaction.create({
    data: {
      userId,
      type: "DEPOSIT",
      amount: config.investmentAmount,
      status: "COMPLETED",
      description: `Package purchase: ${config.label}`,
    },
  });

  await Promise.all([
    processDirectReferralBonus(userId, config.investmentAmount),
    scheduleTeamCommissions(userId, pkg.id, config.investmentAmount),
  ]);

  return pkg;
}

export async function getUserEarningsBreakdown(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId, status: "COMPLETED" },
    select: { type: true, amount: true },
  });

  const totals = {
    roi: 0,
    directBonus: 0,
    teamCommission: 0,
    withdrawn: 0,
    deposited: 0,
  };

  for (const tx of transactions) {
    if (tx.type === "ROI") totals.roi += tx.amount;
    else if (tx.type === "DIRECT_REFERRAL") totals.directBonus += tx.amount;
    else if (tx.type === "TEAM_COMMISSION") totals.teamCommission += tx.amount;
    else if (tx.type === "WITHDRAWAL") totals.withdrawn += tx.amount;
    else if (tx.type === "DEPOSIT") totals.deposited += tx.amount;
  }

  return totals;
}
