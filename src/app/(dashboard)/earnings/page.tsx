import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserEarningsBreakdown } from "@/lib/mlm-engine";
import { EarningsChart } from "@/components/charts/earnings-chart";
import { TransactionHistoryTable } from "@/components/dashboard/transaction-history-table";
import { formatCurrency } from "@/lib/utils";
import type { SessionUser } from "@/types";

function buildChartData(txs: Array<{ type: string; amount: number; createdAt: Date }>) {
  const byDate = new Map<string, { roi: number; directBonus: number; teamCommission: number }>();

  for (const tx of txs) {
    const date = tx.createdAt.toISOString().split("T")[0];
    const slot = byDate.get(date) ?? { roi: 0, directBonus: 0, teamCommission: 0 };
    if (tx.type === "ROI") slot.roi += tx.amount;
    else if (tx.type === "DIRECT_REFERRAL") slot.directBonus += tx.amount;
    else if (tx.type === "TEAM_COMMISSION") slot.teamCommission += tx.amount;
    byDate.set(date, slot);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, v]) => ({ date, ...v }));
}

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as SessionUser;

  const [earnings, transactions] = await Promise.all([
    getUserEarningsBreakdown(user.id),
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);

  const chartData = buildChartData(transactions);
  const recent = [...transactions].reverse().slice(0, 50);
  const total = earnings.roi + earnings.directBonus + earnings.teamCommission;

  return (
    <div className="space-y-6">
      <div className="pt-1">
        <h1 className="text-lg font-semibold text-white">Earnings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">All-time income breakdown</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total earned", value: formatCurrency(total), color: "text-white" },
          { label: "Daily ROI", value: formatCurrency(earnings.roi), color: "text-green-400" },
          { label: "Direct bonus", value: formatCurrency(earnings.directBonus), color: "text-indigo-400" },
          { label: "Team commission", value: formatCurrency(earnings.teamCommission), color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-4">Last 30 days</p>
          <EarningsChart data={chartData} />
        </div>
      )}

      <TransactionHistoryTable transactions={recent} />
    </div>
  );
}
