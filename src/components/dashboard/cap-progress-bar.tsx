import { formatCurrency } from "@/lib/utils";

interface Props {
  totalEarned: number;
  maxEarnings: number;
  investmentAmount: number;
  tier: string;
}

export function CapProgressBar({ totalEarned, maxEarnings, investmentAmount, tier }: Props) {
  const pct = Math.min((totalEarned / maxEarnings) * 100, 100);
  const remaining = Math.max(maxEarnings - totalEarned, 0);
  const color = pct >= 90 ? "bg-rose-500" : pct >= 65 ? "bg-amber-500" : "bg-indigo-500";

  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-0.5">
            2.5× Cap · {tier}
          </p>
          <p className="text-sm text-neutral-300">
            {formatCurrency(totalEarned)}{" "}
            <span className="text-neutral-600">earned of {formatCurrency(maxEarnings)}</span>
          </p>
        </div>
        <span className={`text-2xl font-bold ${pct >= 90 ? "text-rose-400" : "text-neutral-400"}`}>
          {pct.toFixed(1)}%
        </span>
      </div>

      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-neutral-600 mt-2">
        <span>{formatCurrency(investmentAmount)} invested</span>
        <span>{formatCurrency(remaining)} remaining</span>
      </div>
    </div>
  );
}
