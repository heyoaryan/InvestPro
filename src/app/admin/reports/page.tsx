import { prisma } from "@/lib/db";
import { EarningsChart } from "@/components/charts/earnings-chart";
import { PlatformStatsChart } from "@/components/charts/platform-stats-chart";
import { formatCurrency } from "@/lib/utils";

function groupByDate(
  txs: Array<{ type: string; amount: number; createdAt: Date }>,
  days: number
) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const map = new Map<string, { roi: number; directBonus: number; teamCommission: number; invested: number; paidOut: number }>();

  for (const tx of txs) {
    if (tx.createdAt < cutoff) continue;
    const date = tx.createdAt.toISOString().split("T")[0];
    const s = map.get(date) ?? { roi: 0, directBonus: 0, teamCommission: 0, invested: 0, paidOut: 0 };
    if (tx.type === "ROI") s.roi += tx.amount;
    else if (tx.type === "DIRECT_REFERRAL") s.directBonus += tx.amount;
    else if (tx.type === "TEAM_COMMISSION") s.teamCommission += tx.amount;
    else if (tx.type === "DEPOSIT") s.invested += tx.amount;
    if (["ROI", "DIRECT_REFERRAL", "TEAM_COMMISSION"].includes(tx.type)) s.paidOut += tx.amount;
    map.set(date, s);
  }

  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v }));
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }> | { period?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const period = parseInt(params.period ?? "30");

  const [transactions, topEarners] = await Promise.all([
    prisma.transaction.findMany({
      select: { type: true, amount: true, createdAt: true },
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "MEMBER" },
      select: {
        id: true, name: true, email: true, walletBalance: true,
        _count: { select: { referrals: true } },
        packages: { select: { tier: true, totalEarned: true }, orderBy: { totalEarned: "desc" }, take: 1 },
      },
      orderBy: { walletBalance: "desc" },
      take: 10,
    }),
  ]);

  const data = groupByDate(transactions, period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-semibold text-white">Reports</h1>
          <p className="text-[13px] text-neutral-500 mt-0.5">Platform performance analytics</p>
        </div>
        <div className="flex gap-1.5">
          {[7, 30, 90].map((d) => (
            <a
              key={d}
              href={`?period=${d}`}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                period === d
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              {d} Days
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6">
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-5">
          Earnings Breakdown — Last {period} Days
        </p>
        <EarningsChart data={data} />
      </div>

      <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6">
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-5">
          Platform Activity
        </p>
        <PlatformStatsChart data={data} />
      </div>

      {topEarners.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-neutral-300 mb-3">Top 10 Earners</p>
          <div className="rounded-2xl bg-[#141414] border border-white/[0.07] divide-y divide-white/[0.04] overflow-hidden">
            {topEarners.map((user, idx) => {
              const pkg = user.packages[0];
              return (
                <div key={user.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-bold text-neutral-400 shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-[13px] text-white font-medium">{user.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {user._count.referrals} referrals{pkg ? ` · ${pkg.tier}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-emerald-400">{formatCurrency(user.walletBalance)}</p>
                    {pkg && <p className="text-[11px] text-neutral-500">{formatCurrency(pkg.totalEarned)} earned</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
