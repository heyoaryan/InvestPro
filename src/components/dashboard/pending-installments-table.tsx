import { formatCurrency, formatDate } from "@/lib/utils";
import type { PendingInstallment } from "@/types";

const dayMap: Record<number, number> = { 1: 10, 2: 20, 3: 30 };

export function PendingInstallmentsTable({ installments }: { installments: PendingInstallment[] }) {
  const pending = installments.filter((i) => !i.paid);

  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-0.5">
          Pending Installments
        </p>
        <p className="text-sm text-neutral-300">
          {pending.length > 0 ? `${pending.length} upcoming` : "All cleared"}
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-[13px] text-neutral-600">No pending installments</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {pending.slice(0, 6).map((inst) => (
            <div
              key={`${inst.commissionId}-${inst.installmentNumber}`}
              className="flex items-center justify-between px-5 py-3"
            >
              <div>
                <p className="text-[13px] text-neutral-200 font-medium">{inst.fromUserName}</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  L{inst.level} · Day {dayMap[inst.installmentNumber]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-white">{formatCurrency(inst.amount)}</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">{formatDate(inst.dueDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
