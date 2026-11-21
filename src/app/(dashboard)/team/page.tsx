import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTeamTree, getLevelCounts } from "@/lib/referral";
import { LEVEL_CONFIGS } from "@/lib/utils";
import { TeamTreeView } from "@/components/dashboard/team-tree-view";
import type { SessionUser } from "@/types";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as SessionUser;

  const [dbUser, teamTree, levelCounts, directCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true } }),
    getTeamTree(user.id, 5),
    getLevelCounts(user.id),
    prisma.user.count({ where: { referredById: user.id } }),
  ]);

  const totalTeamSize = levelCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="pt-1">
        <h1 className="text-lg font-semibold text-white">My Team</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {totalTeamSize} member{totalTeamSize !== 1 ? "s" : ""} across{" "}
          {levelCounts.filter((c) => c > 0).length} level{levelCounts.filter((c) => c > 0).length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Level cards */}
      <div className="grid grid-cols-5 gap-3">
        {LEVEL_CONFIGS.map((config, idx) => {
          const count = levelCounts[idx] ?? 0;
          const qualified =
            directCount >= config.requiredDirects &&
            totalTeamSize >= config.requiredTeamSize;

          return (
            <div
              key={config.level}
              className={`bg-neutral-900 border rounded-xl p-4 text-center transition-colors ${
                qualified ? "border-green-500/30" : "border-neutral-800"
              }`}
            >
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Level {config.level}</p>
              <p className="text-sm font-semibold text-indigo-400 mt-1">
                {(config.percentage * 100).toFixed(0)}%
              </p>
              <span
                className={`inline-block mt-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  qualified
                    ? "bg-green-500/10 text-green-400"
                    : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {qualified ? "Qualified" : "Locked"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Requirements + stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <p className="text-sm font-medium text-white">Level requirements</p>
          </div>
          <div className="divide-y divide-neutral-800">
            {LEVEL_CONFIGS.map((config) => {
              const qualified =
                directCount >= config.requiredDirects &&
                totalTeamSize >= config.requiredTeamSize;
              return (
                <div key={config.level} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-neutral-300">
                      L{config.level} · {(config.percentage * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-neutral-600">
                      {config.requiredDirects} directs
                      {config.requiredTeamSize > 0 && ` + ${config.requiredTeamSize} team`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      qualified
                        ? "bg-green-500/10 text-green-400"
                        : "bg-neutral-800 text-neutral-500"
                    }`}
                  >
                    {qualified ? "Met" : `${directCount}/${config.requiredDirects}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <p className="text-sm font-medium text-white">Team stats</p>
          </div>
          <div className="divide-y divide-neutral-800">
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-neutral-500">Direct referrals</span>
              <span className="text-sm font-semibold text-white">{directCount}</span>
            </div>
            <div className="flex justify-between px-5 py-3">
              <span className="text-sm text-neutral-500">Total team size</span>
              <span className="text-sm font-semibold text-white">{totalTeamSize}</span>
            </div>
            {levelCounts.map((count, idx) => (
              <div key={idx} className="flex justify-between px-5 py-3">
                <span className="text-sm text-neutral-500">Level {idx + 1}</span>
                <span className="text-sm text-neutral-400">{count} members</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TeamTreeView tree={teamTree} currentUserName={dbUser?.name ?? user.name ?? ""} />
    </div>
  );
}
