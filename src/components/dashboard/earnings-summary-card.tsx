import { formatCurrency } from "@/lib/utils";

interface Props {
  roiEarned: number;
  directBonus: number;
  teamCommission: number;
  walletBalance: number;
}

export function EarningsSummaryCard({ roiEarned, directBonus, teamCommission, walletBalance }: Props) {
  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6 flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-1.5">Available Balance</p>
        <p className="text-4xl font-bold text-white tracking-tight">{formatCurrency(walletBalance)}</p>
      </div>

      <div className="border-t border-white/[0.06] pt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] text-neutral-600 mb-1">Daily ROI</p>
          <p className="text-sm font-semibold text-emerald-400">{formatCurrency(roiEarned)}</p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-600 mb-1">Direct Bonus</p>
          <p className="text-sm font-semibold text-indigo-400">{formatCurrency(directBonus)}</p>
        </div>
        <div>
          <p className="text-[11px] text-neutral-600 mb-1">Team Comm.</p>
          <p className="text-sm font-semibold text-violet-400">{formatCurrency(teamCommission)}</p>
        </div>
      </div>
    </div>
  );
}
