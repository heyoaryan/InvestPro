import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WithdrawalForm } from "@/components/dashboard/withdrawal-form";
import { formatCurrency, formatDateTime, WITHDRAWAL_FEE_RATE } from "@/lib/utils";
import type { SessionUser } from "@/types";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400",
  APPROVED: "bg-green-500/10 text-green-400",
  REJECTED: "bg-red-500/10 text-red-400",
};

export default async function WithdrawPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as SessionUser;

  const [dbUser, withdrawals] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } }),
    prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { requestedAt: "desc" },
      take: 20,
    }),
  ]);

  const walletBalance = dbUser?.walletBalance ?? 0;

  return (
    <div className="space-y-6">
      <div className="pt-1">
        <h1 className="text-lg font-semibold text-white">Withdraw</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {(WITHDRAWAL_FEE_RATE * 100).toFixed(0)}% admin fee is deducted — you receive 90% net
        </p>
      </div>

      {/* Balance strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Available balance</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(walletBalance)}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Admin fee</p>
          <p className="text-2xl font-bold text-neutral-400">
            {(WITHDRAWAL_FEE_RATE * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      <WithdrawalForm walletBalance={walletBalance} />

      {/* History */}
      {withdrawals.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <p className="text-sm font-medium text-white">Withdrawal history</p>
          </div>
          <div className="divide-y divide-neutral-800">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm text-white font-semibold">{formatCurrency(w.amount)}</p>
                  <p className="text-xs text-neutral-500">{formatDateTime(w.requestedAt)}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Fee</p>
                    <p className="text-red-400">−{formatCurrency(w.fee)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Net</p>
                    <p className="text-green-400 font-semibold">{formatCurrency(w.netAmount)}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      statusStyle[w.status] ?? "bg-neutral-700 text-neutral-400"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
