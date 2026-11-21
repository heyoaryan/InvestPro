import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { activatePackage } from "@/lib/mlm-engine";
import { PACKAGE_CONFIGS } from "@/lib/utils";
import type { SessionUser } from "@/types";

const purchaseSchema = z.object({
  tier: z.enum(["STARTER", "BRONZE", "SILVER", "GOLD", "PLATINUM"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  const body = await req.json();
  const parsed = purchaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const { tier } = parsed.data;

  if (!PACKAGE_CONFIGS[tier]) {
    return NextResponse.json({ error: "Unknown package tier" }, { status: 400 });
  }

  try {
    const pkg = await activatePackage(user.id, tier);
    return NextResponse.json(pkg, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to activate package";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(Object.values(PACKAGE_CONFIGS));
}
