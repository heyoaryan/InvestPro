import { formatCurrency } from "@/lib/utils";
import type { AdminOverviewStats } from "@/types";

function Stat({ label, value, color, note }: { label: string; value: string; color: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-5">
      <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-3">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {note && <p className="text-[11px] text-neutral-600 mt-1">{note}</p>}
    </div>
  );
}

export function StatsOverviewCard({ stats }: { stats: AdminOverviewStats }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat label="Total Users" value={String(stats.totalUsers)} color="text-white" />
      <Stat label="Total Invested" value={formatCurrency(stats.totalInvested)} color="text-indigo-400" />
      <Stat label="Total Paid Out" value={formatCurrency(stats.totalPaidOut)} color="text-emerald-400" />
      <Stat
        label="Platform Balance"
        value={formatCurrency(stats.platformBalance)}
        color="text-amber-400"
        note="Invested minus paid out"
      />
      <Stat
        label="Pending Withdrawals"
        value={String(stats.pendingWithdrawals)}
        color={stats.pendingWithdrawals > 0 ? "text-rose-400" : "text-white"}
        note="Awaiting approval"
      />
      <Stat label="Active Packages" value={String(stats.activePackages)} color="text-violet-400" />
    </div>
  );
}
