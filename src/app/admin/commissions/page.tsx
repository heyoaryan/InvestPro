import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

function InstCell({ amount, paid, paidAt }: { amount: number; paid: boolean; paidAt: Date | null }) {
  return (
    <div>
      <p className={`text-[13px] font-medium ${paid ? "text-green-400" : "text-neutral-300"}`}>
        {formatCurrency(amount)}
      </p>
      <p className="text-[11px] text-neutral-600 mt-0.5">
        {paid ? (paidAt ? formatDate(paidAt) : "Paid") : "Pending"}
      </p>
    </div>
  );
}

export default async function AdminCommissionsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page ?? "1");
  const perPage = 25;

  const [commissions, total, reserve] = await Promise.all([
    prisma.commission.findMany({
      include: {
        fromUser: { select: { name: true } },
        toUser: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.commission.count(),
    prisma.adminReserve.aggregate({ _sum: { amount: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-lg font-semibold text-white">Commissions</h1>
          <p className="text-[13px] text-neutral-500 mt-0.5">{total} events</p>
        </div>
        <div className="rounded-xl bg-[#141414] border border-white/[0.07] px-5 py-3 text-right">
          <p className="text-[11px] text-neutral-500 uppercase tracking-widest mb-0.5">Admin Reserve</p>
          <p className="text-xl font-bold text-amber-400">
            {formatCurrency(reserve._sum.amount ?? 0)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-white/[0.07] overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.5fr_0.5fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.06]">
          {["From","To","L","Total","Day 10","Day 20","Day 30","Date"].map((h) => (
            <p key={h} className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {commissions.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-neutral-600">No commissions yet</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {commissions.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1.5fr_1.5fr_0.5fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors"
              >
                <p className="text-[13px] text-neutral-400 truncate">{c.fromUser.name}</p>
                <p className="text-[13px] text-white font-medium truncate">{c.toUser.name}</p>
                <span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full w-fit">
                  L{c.level}
                </span>
                <p className="text-[13px] text-white font-semibold">{formatCurrency(c.totalAmount)}</p>
                <InstCell amount={c.installment1} paid={c.inst1Paid} paidAt={c.inst1PaidAt} />
                <InstCell amount={c.installment2} paid={c.inst2Paid} paidAt={c.inst2PaidAt} />
                <InstCell amount={c.installment3} paid={c.inst3Paid} paidAt={c.inst3PaidAt} />
                <p className="text-[11px] text-neutral-500">{formatDate(c.activationDate)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > perPage && (
        <div className="flex gap-2 justify-end">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[13px] transition-colors">
              Previous
            </a>
          )}
          {page * perPage < total && (
            <a href={`?page=${page + 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[13px] transition-colors">
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
