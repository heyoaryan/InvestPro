import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReferralLinkCard } from "@/components/dashboard/referral-link-card";
import { formatCurrency, formatDate, DIRECT_REFERRAL_RATE } from "@/lib/utils";
import type { SessionUser } from "@/types";

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as SessionUser;

  const [dbUser, directReferrals, directBonusTotal] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { referralCode: true },
    }),
    prisma.user.findMany({
      where: { referredById: user.id },
      include: {
        packages: {
          where: { status: { in: ["ACTIVE", "CAPPED"] } },
          orderBy: { investmentAmount: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "DIRECT_REFERRAL" },
      _sum: { amount: true },
    }),
  ]);

  const totalBonus = directBonusTotal._sum.amount ?? 0;

  return (
    <div className="space-y-6">
      <div className="pt-1">
        <h1 className="text-lg font-semibold text-white">Referrals</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          20% instant bonus on every direct referral's package
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Direct referrals", value: String(directReferrals.length), color: "text-white" },
          { label: "Total bonus earned", value: formatCurrency(totalBonus), color: "text-green-400" },
          { label: "Bonus rate", value: `${(DIRECT_REFERRAL_RATE * 100).toFixed(0)}%`, color: "text-indigo-400" },
        ].map((s) => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <ReferralLinkCard referralCode={dbUser?.referralCode ?? user.referralCode} />

      {/* Referral list */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800">
          <p className="text-sm font-medium text-white">
            Direct referrals{" "}
            <span className="text-neutral-500 font-normal">({directReferrals.length})</span>
          </p>
        </div>

        {directReferrals.length === 0 ? (
          <div className="px-5 py-10 text-sm text-neutral-600 text-center">
            No referrals yet — share your link to start earning
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {directReferrals.map((ref) => {
              const pkg = ref.packages[0];
              const bonus = pkg ? pkg.investmentAmount * DIRECT_REFERRAL_RATE : 0;
              return (
                <div key={ref.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm text-white font-medium">{ref.name}</p>
                    <p className="text-xs text-neutral-500">{ref.email}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Joined</p>
                      <p className="text-neutral-400">{formatDate(ref.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Package</p>
                      <p className="text-neutral-300">
                        {pkg ? `${pkg.tier} · ${formatCurrency(pkg.investmentAmount)}` : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Your bonus</p>
                      <p className={bonus > 0 ? "text-green-400 font-semibold" : "text-neutral-600"}>
                        {bonus > 0 ? formatCurrency(bonus) : "—"}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        pkg
                          ? "bg-green-500/10 text-green-400"
                          : "bg-neutral-700 text-neutral-500"
                      }`}
                    >
                      {pkg ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
