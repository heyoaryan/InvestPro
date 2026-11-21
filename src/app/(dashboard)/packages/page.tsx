import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PACKAGE_CONFIGS, formatCurrency, formatDate } from "@/lib/utils";
import { PackagePurchaseButton } from "@/components/dashboard/package-purchase-button";
import type { SessionUser } from "@/types";

const tierDot: Record<string, string> = {
  STARTER: "bg-neutral-400",
  BRONZE: "bg-amber-600",
  SILVER: "bg-neutral-300",
  GOLD: "bg-amber-400",
  PLATINUM: "bg-indigo-400",
};

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-400",
  CAPPED: "bg-amber-500/10 text-amber-400",
  PENDING: "bg-neutral-700 text-neutral-400",
  REJECTED: "bg-red-500/10 text-red-400",
};

export default async function PackagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as SessionUser;

  const [activePackage, allPackages] = await Promise.all([
    prisma.package.findFirst({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.package.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const packages = Object.values(PACKAGE_CONFIGS);

  return (
    <div className="space-y-8">
      <div className="pt-1">
        <h1 className="text-lg font-semibold text-white">Packages</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {activePackage
            ? `Active: ${activePackage.tier} · ROI runs until 2.5× cap`
            : "Pick a tier to start earning daily ROI"}
        </p>
      </div>

      {/* Package grid */}
      <div className="grid grid-cols-5 gap-3">
        {packages.map((pkg) => {
          const isActive = activePackage?.tier === pkg.tier;
          return (
            <div
              key={pkg.tier}
              className={`bg-neutral-900 rounded-xl p-4 border transition-colors ${
                isActive ? "border-indigo-500/50" : "border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-2 h-2 rounded-full ${tierDot[pkg.tier]}`} />
                {isActive && (
                  <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-0.5">{pkg.label}</p>
              <p className="text-xl font-bold text-white mb-3">
                {formatCurrency(pkg.investmentAmount)}
              </p>
              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Daily</span>
                  <span className="text-green-400 font-medium">
                    {(pkg.dailyRoiRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cap</span>
                  <span className="text-neutral-300">
                    {formatCurrency(pkg.investmentAmount * pkg.maxMultiplier)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Days</span>
                  <span className="text-neutral-300">{pkg.durationDays}</span>
                </div>
              </div>
              <PackagePurchaseButton
                tier={pkg.tier}
                hasActivePackage={!!activePackage}
                isCurrentTier={isActive}
              />
            </div>
          );
        })}
      </div>

      {/* History */}
      {allPackages.length > 0 && (
        <div>
          <p className="text-sm font-medium text-white mb-3">Package history</p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800 overflow-hidden">
            {allPackages.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm text-white font-medium">{pkg.tier}</p>
                  <p className="text-xs text-neutral-500">Started {formatDate(pkg.startDate)}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Invested</p>
                    <p className="text-neutral-300 font-medium">{formatCurrency(pkg.investmentAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Earned</p>
                    <p className="text-green-400 font-medium">{formatCurrency(pkg.totalEarned)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Cap</p>
                    <p className="text-neutral-300 font-medium">{formatCurrency(pkg.maxEarnings)}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      statusStyle[pkg.status] ?? "bg-neutral-700 text-neutral-400"
                    }`}
                  >
                    {pkg.status}
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
