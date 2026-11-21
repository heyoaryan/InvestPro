import { prisma } from "@/lib/db";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { formatCurrency, formatDate } from "@/lib/utils";

const roleBadge: Record<string, string> = {
  ADMIN: "bg-rose-500/10 text-rose-400",
  MEMBER: "bg-neutral-700 text-neutral-400",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const search = searchParams.search ?? "";
  const page = parseInt(searchParams.page ?? "1");
  const perPage = 20;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        role: true,
        walletBalance: true,
        createdAt: true,
        _count: { select: { referrals: true } },
        packages: {
          where: { status: "ACTIVE" },
          select: { tier: true, totalEarned: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-semibold text-white">Users</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total} total members</p>
        </div>
        <form method="GET" className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search name or email…"
            className="h-9 rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors w-56"
          />
          <button
            type="submit"
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-neutral-800">
          {["User", "Code", "Package", "Directs", "Wallet", "Joined", ""].map((h) => (
            <p key={h} className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-800">
          {users.map((user) => {
            const pkg = user.packages[0];
            return (
              <div
                key={user.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-neutral-800/40 transition-colors"
              >
                <div>
                  <p className="text-sm text-white font-medium">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
                <p className="text-xs font-mono text-neutral-400">{user.referralCode}</p>
                <div>
                  {pkg ? (
                    <>
                      <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                        {pkg.tier}
                      </span>
                      <p className="text-xs text-neutral-500 mt-0.5">{formatCurrency(pkg.totalEarned)}</p>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-600">None</span>
                  )}
                </div>
                <p className="text-sm text-neutral-400">{user._count.referrals}</p>
                <p className="text-sm font-semibold text-green-400">{formatCurrency(user.walletBalance)}</p>
                <p className="text-xs text-neutral-500">{formatDate(user.createdAt)}</p>
                <AdminUserActions userId={user.id} userName={user.name} />
              </div>
            );
          })}
        </div>
      </div>

      {total > perPage && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`?search=${search}&page=${page - 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm transition-colors">
                Previous
              </a>
            )}
            {page * perPage < total && (
              <a href={`?search=${search}&page=${page + 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm transition-colors">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
