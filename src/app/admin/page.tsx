import { prisma } from "@/lib/db";
import { StatsOverviewCard } from "@/components/admin/stats-overview-card";
import { PlatformStatsChart } from "@/components/charts/platform-stats-chart";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { AdminOverviewStats } from "@/types";

async function getStats(): Promise<AdminOverviewStats> {
  const [totalUsers, invested, paidOut, pendingWithdrawals, activePackages] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.package.aggregate({ _sum: { investmentAmount: true } }),
    prisma.transaction.aggregate({
      where: { type: { in: ["ROI", "DIRECT_REFERRAL", "TEAM_COMMISSION"] }, status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
    prisma.package.count({ where: { status: "ACTIVE" } }),
  ]);

  const totalInvested = invested._sum.investmentAmount ?? 0;
  const totalPaidOut = paidOut._sum.amount ?? 0;
  return { totalUsers, totalInvested, totalPaidOut, platformBalance: totalInvested - totalPaidOut, pendingWithdrawals, activePackages };
}

function buildChart(txs: Array<{ type: string; amount: number; createdAt: Date }>) {
  const map = new Map<string, { invested: number; paidOut: number }>();
  for (const tx of txs) {
    const d = tx.createdAt.toISOString().split("T")[0];
    const s = map.get(d) ?? { invested: 0, paidOut: 0 };
    if (tx.type === "DEPOSIT") s.invested += tx.amount;
    else if (["ROI", "DIRECT_REFERRAL", "TEAM_COMMISSION"].includes(tx.type)) s.paidOut += tx.amount;
    map.set(d, s);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([date, v]) => ({ date, ...v }));
}

export default async function AdminDashboardPage() {
  const [stats, allTx, pending] = await Promise.all([
    getStats(),
    prisma.transaction.findMany({ orderBy: { createdAt: "asc" }, select: { type: true, amount: true, createdAt: true } }),
    prisma.withdrawal.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { requestedAt: "desc" },
      take: 5,
    }),
  ]);

  const chart = buildChart(allTx);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-semibold text-white">Overview</h1>
          <p className="text-[13px] text-neutral-500 mt-0.5">{formatDateTime(new Date())}</p>
        </div>
      </div>

      <StatsOverviewCard stats={stats} />

      {chart.length > 0 && (
        <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6">
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-5">
            Platform Activity — Last 30 Days
          </p>
          <PlatformStatsChart data={chart} />
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-medium text-neutral-300">Pending withdrawals</p>
            <a href="/admin/withdrawals" className="text-[12px] text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="rounded-2xl bg-[#141414] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden">
            {pending.map((w) => (
              <div key={w.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] text-white font-medium">{w.user.name}</p>
                  <p className="text-[11px] text-neutral-500">{w.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-white">{formatCurrency(w.amount)}</p>
                  <p className="text-[11px] text-emerald-400">Net {formatCurrency(w.netAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
