import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Transaction } from "@/types";

const typeLabel: Record<string, string> = {
  ROI: "Daily ROI",
  DIRECT_REFERRAL: "Direct Bonus",
  TEAM_COMMISSION: "Team Commission",
  WITHDRAWAL: "Withdrawal",
  DEPOSIT: "Deposit",
  ADMIN_ADJUSTMENT: "Adjustment",
};

const typeStyle: Record<string, string> = {
  ROI: "text-emerald-400 bg-emerald-500/10",
  DIRECT_REFERRAL: "text-indigo-400 bg-indigo-500/10",
  TEAM_COMMISSION: "text-violet-400 bg-violet-500/10",
  WITHDRAWAL: "text-rose-400 bg-rose-500/10",
  DEPOSIT: "text-sky-400 bg-sky-500/10",
  ADMIN_ADJUSTMENT: "text-amber-400 bg-amber-500/10",
};

export function TransactionHistoryTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
          Transaction History
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-neutral-600">No transactions yet</div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-3">
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  typeStyle[tx.type] ?? "text-neutral-400 bg-neutral-700"
                }`}
              >
                {typeLabel[tx.type] ?? tx.type}
              </span>
              <span className="flex-1 text-[13px] text-neutral-500 truncate">{tx.description}</span>
              <span
                className={`text-[13px] font-semibold shrink-0 ${
                  tx.type === "WITHDRAWAL" ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {tx.type === "WITHDRAWAL" ? "−" : "+"}
                {formatCurrency(tx.amount)}
              </span>
              <span className="text-[11px] text-neutral-600 w-32 text-right shrink-0">
                {formatDateTime(tx.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
