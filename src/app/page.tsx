import Link from "next/link";
import { PACKAGE_CONFIGS } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

const packages = Object.values(PACKAGE_CONFIGS);

const tierColors: Record<string, string> = {
  STARTER: "#a3a3a3",
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#f59e0b",
  PLATINUM: "#6366f1",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="border-b border-neutral-800 px-6 py-4 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">InvestPro</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-neutral-400 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            Live platform · Payouts every 24h
          </div>
          <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
            Earn daily returns.<br />
            Grow your network.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-lg">
            Up to 2.5% daily ROI, 20% instant referral bonus, and 5-level team
            commissions that compound with your network.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="bg-white text-black px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-neutral-100 transition-colors"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="text-neutral-400 hover:text-white px-6 py-2.5 rounded-lg text-sm border border-neutral-800 hover:border-neutral-600 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-neutral-800 bg-neutral-900/40">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 divide-x divide-neutral-800">
          {[
            { label: "Direct Referral Bonus", value: "20%", sub: "Paid instantly" },
            { label: "Team Commission Levels", value: "5", sub: "Up to 8% per level" },
            { label: "Max Package Return", value: "2.5×", sub: "On all earnings combined" },
          ].map((stat) => (
            <div key={stat.label} className="px-8 first:pl-0 last:pr-0">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-neutral-300">{stat.label}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Investment packages</h2>
          <p className="text-neutral-500 text-sm">
            Choose a tier. ROI accrues daily until you hit the 2.5× cap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {packages.map((pkg) => {
            const color = tierColors[pkg.tier] ?? "#6366f1";
            return (
              <div
                key={pkg.tier}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors group"
              >
                <div
                  className="w-2 h-2 rounded-full mb-4"
                  style={{ backgroundColor: color }}
                />
                <div className="font-semibold text-white text-sm mb-0.5">{pkg.label}</div>
                <div className="text-2xl font-bold text-white mb-4">
                  {formatCurrency(pkg.investmentAmount)}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Daily ROI</span>
                    <span className="text-green-400 font-medium">{(pkg.dailyRoiRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Max return</span>
                    <span className="text-neutral-300">{formatCurrency(pkg.investmentAmount * pkg.maxMultiplier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Duration</span>
                    <span className="text-neutral-300">{pkg.durationDays}d</span>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="mt-4 block text-center text-xs font-medium py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
                >
                  Select
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commission breakdown */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-white mb-1">5-Level team commission</h3>
          <p className="text-neutral-500 text-sm mb-6">
            Paid in 3 equal installments on Day 10, 20, and 30 from each downline activation.
          </p>
          <div className="space-y-2">
            {[
              { level: "L1", share: "8%", directs: "2 directs", team: "No minimum" },
              { level: "L2", share: "5%", directs: "4 directs", team: "5 members" },
              { level: "L3", share: "3%", directs: "7 directs", team: "20 members" },
              { level: "L4", share: "2%", directs: "10 directs", team: "80 members" },
              { level: "L5", share: "2%", directs: "15 directs", team: "200 members" },
            ].map((row) => (
              <div
                key={row.level}
                className="flex items-center gap-4 py-3 border-b border-neutral-800 last:border-0 text-sm"
              >
                <span className="w-8 font-mono text-xs text-neutral-500">{row.level}</span>
                <span className="w-12 font-semibold text-indigo-400">{row.share}</span>
                <span className="text-neutral-400 flex-1">{row.directs}</span>
                <span className="text-neutral-500 text-xs">{row.team}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-neutral-600">
          <span>© {new Date().getFullYear()} InvestPro</span>
          <span>10% withdrawal fee · 2.5× earnings cap</span>
        </div>
      </footer>
    </div>
  );
}
