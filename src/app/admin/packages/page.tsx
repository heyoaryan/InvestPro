import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-400",
  CAPPED: "bg-amber-500/10 text-amber-400",
  PENDING: "bg-neutral-700 text-neutral-400",
  REJECTED: "bg-red-500/10 text-red-400",
};

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }> | { status?: string; page?: string };
}) {
  const params = await Promise.resolve(searchParams);
  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1");
  const perPage = 25;

  const where = status ? { status: status as "ACTIVE" | "CAPPED" | "PENDING" | "REJECTED" } : {};

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.package.count({ where }),
  ]);

  const filters = [
    { value: "", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "CAPPED", label: "Capped" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-semibold text-white">Packages</h1>
          <p className="text-[13px] text-neutral-500 mt-0.5">{total} total</p>
        </div>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <a
              key={f.value}
              href={f.value ? `?status=${f.value}` : "?"}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                status === f.value
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-white/[0.07] overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.06]">
          {["User", "Tier", "Invested", "Earned", "Cap", "Progress", "Status", "Started"].map((h) => (
            <p key={h} className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {packages.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-neutral-600">No packages found</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {packages.map((pkg) => {
              const pct = Math.min((pkg.totalEarned / pkg.maxEarnings) * 100, 100);
              return (
                <div
                  key={pkg.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_1fr_1fr] gap-3 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <p className="text-[13px] text-white font-medium">{pkg.user.name}</p>
                    <p className="text-[11px] text-neutral-500">{pkg.user.email}</p>
                  </div>
                  <p className="text-[13px] text-neutral-300 font-medium">{pkg.tier}</p>
                  <p className="text-[13px] text-white">{formatCurrency(pkg.investmentAmount)}</p>
                  <p className="text-[13px] text-green-400 font-medium">{formatCurrency(pkg.totalEarned)}</p>
                  <p className="text-[13px] text-neutral-400">{formatCurrency(pkg.maxEarnings)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 w-8 shrink-0">{pct.toFixed(0)}%</span>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full w-fit ${statusStyle[pkg.status] ?? "bg-neutral-700 text-neutral-400"}`}>
                    {pkg.status}
                  </span>
                  <p className="text-[11px] text-neutral-500">{formatDate(pkg.startDate)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {total > perPage && (
        <div className="flex gap-2 justify-end">
          {page > 1 && (
            <a href={`?${status ? `status=${status}&` : ""}page=${page - 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[13px] transition-colors">
              Previous
            </a>
          )}
          {page * perPage < total && (
            <a href={`?${status ? `status=${status}&` : ""}page=${page + 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-[13px] transition-colors">
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
