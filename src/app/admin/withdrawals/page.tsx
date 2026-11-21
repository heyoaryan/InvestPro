import { prisma } from "@/lib/db";
import { AdminWithdrawalActions } from "@/components/admin/admin-withdrawal-actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400",
  APPROVED: "bg-green-500/10 text-green-400",
  REJECTED: "bg-red-500/10 text-red-400",
};

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? "PENDING";
  const where = status === "ALL" ? {} : { status: status as "PENDING" | "APPROVED" | "REJECTED" };

  const [withdrawals, pendingCount] = await Promise.all([
    prisma.withdrawal.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { requestedAt: "desc" },
      take: 50,
    }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
  ]);

  const filters = [
    { value: "PENDING", label: `Pending (${pendingCount})` },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "ALL", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div className="pt-1">
        <h1 className="text-lg font-semibold text-white">Withdrawals</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{pendingCount} pending approval</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <a
            key={f.value}
            href={`?status=${f.value}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === f.value
                ? "bg-neutral-700 text-white"
                : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-neutral-800">
          {["User", "Amount", "Fee", "Net", "Status", "Requested", ""].map((h) => (
            <p key={h} className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {withdrawals.length === 0 ? (
          <div className="px-5 py-10 text-sm text-neutral-600 text-center">No withdrawals found</div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-neutral-800/40 transition-colors"
              >
                <div>
                  <p className="text-sm text-white font-medium">{w.user.name}</p>
                  <p className="text-xs text-neutral-500">{w.user.email}</p>
                </div>
                <p className="text-sm font-semibold text-white">{formatCurrency(w.amount)}</p>
                <p className="text-sm text-red-400">−{formatCurrency(w.fee)}</p>
                <p className="text-sm font-semibold text-green-400">{formatCurrency(w.netAmount)}</p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                    statusStyle[w.status] ?? "bg-neutral-700 text-neutral-400"
                  }`}
                >
                  {w.status}
                </span>
                <p className="text-xs text-neutral-500">{formatDateTime(w.requestedAt)}</p>
                <div>
                  {w.status === "PENDING" && <AdminWithdrawalActions withdrawalId={w.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
