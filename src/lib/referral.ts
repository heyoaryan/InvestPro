import { prisma } from "./db";
import type { TeamMemberNode } from "@/types";

export async function getTeamTree(
  userId: string,
  maxDepth: number = 5,
  currentDepth: number = 1
): Promise<TeamMemberNode[]> {
  const directReferrals = await prisma.user.findMany({
    where: { referredById: userId },
    include: {
      packages: {
        where: { status: { in: ["ACTIVE", "CAPPED"] } },
        orderBy: { investmentAmount: "desc" },
        take: 1,
      },
      _count: { select: { referrals: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const nodes: TeamMemberNode[] = [];

  for (const ref of directReferrals) {
    const topPackage = ref.packages[0] ?? null;
    const node: TeamMemberNode = {
      id: ref.id,
      name: ref.name,
      email: ref.email,
      level: currentDepth,
      packageTier: topPackage?.tier ?? null,
      investmentAmount: topPackage?.investmentAmount ?? 0,
      joinedAt: ref.createdAt,
      directReferrals: ref._count.referrals,
      children: currentDepth < maxDepth
        ? await getTeamTree(ref.id, maxDepth, currentDepth + 1)
        : [],
    };
    nodes.push(node);
  }

  return nodes;
}

export async function getAncestorChain(userId: string): Promise<string[]> {
  const ancestors: string[] = [];
  let currentId: string | null = userId;

  while (currentId) {
    const found: { referredById: string | null } | null =
      await prisma.user.findUnique({
        where: { id: currentId },
        select: { referredById: true },
      });
    if (!found?.referredById) break;
    ancestors.push(found.referredById);
    currentId = found.referredById;
  }

  return ancestors;
}

export async function getLevelCounts(userId: string): Promise<number[]> {
  const counts: number[] = [];
  let currentLevel = [userId];

  for (let depth = 0; depth < 5; depth++) {
    if (currentLevel.length === 0) break;

    const nextLevel = await prisma.user.findMany({
      where: { referredById: { in: currentLevel } },
      select: { id: true },
    });

    counts.push(nextLevel.length);
    currentLevel = nextLevel.map((u) => u.id);
  }

  return counts;
}
