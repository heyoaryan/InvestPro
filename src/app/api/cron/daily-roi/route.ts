import { NextRequest, NextResponse } from "next/server";
import { runDailyRoi, processDueInstallments } from "@/lib/mlm-engine";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // CRON_SECRET must always be set in production
  if (!cronSecret) return false;

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

async function handleCron(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [roiResult, installmentResult] = await Promise.all([
    runDailyRoi(),
    processDueInstallments(),
  ]);

  return NextResponse.json({
    roi: roiResult,
    installments: installmentResult,
    timestamp: new Date().toISOString(),
  });
}

// Vercel cron jobs send GET requests
export async function GET(req: NextRequest) {
  return handleCron(req);
}

// Allow manual POST triggers (e.g. from admin tooling)
export async function POST(req: NextRequest) {
  return handleCron(req);
}
