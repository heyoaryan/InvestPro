import { NextRequest, NextResponse } from "next/server";
import { runDailyRoi, processDueInstallments } from "@/lib/mlm-engine";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

export async function GET(req: NextRequest) {
  return POST(req);
}
