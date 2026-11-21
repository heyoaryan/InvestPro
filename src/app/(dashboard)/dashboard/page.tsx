import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserEarningsBreakdown } from "@/lib/mlm-engine";
import { getTeamTree } from "@/lib/referral";
import { EarningsSummaryCard } from "@/components/dashboard/earnings-summary-card";
import { CapProgressBar } from "@/components/dashboard/cap-progress-bar";
import { ReferralLinkCard } from "@/components/dashboard/referral-link-card";
import { PendingInstallmentsTable } from "@/components/dashboard/pending-installments-table";
import { TeamTreeView } from "@/components/dashboard/team-tree-view";
import { TransactionHistoryTable } from "@/components/dashboard/transaction-history-table";
import { formatCurrency } from "@/lib/utils";
import type { SessionUser, PendingInstallment } from "@/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as SessionUser;

  const [dbUser, earnings, activePackage, commissions, transactions, teamTree] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { walletBalance: true, name: true, referralCode: true },
      }),
      getUserEarningsBreakdown(user.id),
      prisma.package.findFirst({ where: { userId: user.id, status: "ACTIVE" } }),
      prisma.commission.findMany({
        where: { toUserId: user.id },
        include: { fromUser: { select: { name: true } } },
        orderBy: { activationDate: "desc" },
        take: 20,
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      getTeamTree(user.id, 2),
    ]);

  const pendingInstallments: PendingInstallment[] = commissions.flatMap((c) => {
    const base = new Date(c.activationDate);
    return [
      { commissionId: c.id, fromUserName: c.fromUser.name, level: c.level, amount: c.installment1, installmentNumber: 1 as const, dueDate: new Date(new Date(base).setDate(base.getDate() + 10)), paid: c.inst1Paid },
      { commissionId: c.id, fromUserName: c.fromUser.name, level: c.level, amount: c.installment2, installmentNumber: 2 as const, dueDate: new Date(new Date(base).setDate(base.getDate() + 20)), paid: c.inst2Paid },
      { commissionId: c.id, fromUserName: c.fromUser.name, level: c.level, amount: c.installment3, installmentNumber: 3 as const, dueDate: new Date(new Date(base).setDate(base.getDate() + 30)), paid: c.inst3Paid },
    ];
  });

  const directCount = await prisma.user.count({ where: { referredById: user.id } });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-lg font-semibold text-white">{dbUser?.name}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {directCount} direct referral{directCount !== 1 ? "s" : ""} ·{" "}
          <span className="text-neutral-400">{formatCurrency(dbUser?.walletBalance ?? 0)} available</span>
        </p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-2 gap-4">
        <EarningsSummaryCard
          roiEarned={earnings.roi}
          directBonus={earnings.directBonus}
          teamCommission={earnings.teamCommission}
          walletBalance={dbUser?.walletBalance ?? 0}
        />
        <ReferralLinkCard referralCode={dbUser?.referralCode ?? user.referralCode} />
      </div>

      {/* Cap bar */}
      {activePackage && (
        <CapProgressBar
          totalEarned={activePackage.totalEarned}
          maxEarnings={activePackage.maxEarnings}
          investmentAmount={activePackage.investmentAmount}
          tier={activePackage.tier}
        />
      )}

      {/* Middle row */}
      <div className="grid grid-cols-2 gap-4">
        <PendingInstallmentsTable installments={pendingInstallments} />
        <TeamTreeView tree={teamTree} currentUserName={dbUser?.name ?? user.name ?? ""} />
      </div>

      {/* Transactions */}
      <TransactionHistoryTable transactions={transactions} />
    </div>
  );
}
