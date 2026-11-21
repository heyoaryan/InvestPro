"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminWithdrawalActions({ withdrawalId }: { withdrawalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const act = async (action: "APPROVED" | "REJECTED") => {
    setLoading(action === "APPROVED" ? "approve" : "reject");
    const res = await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId, action }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => act("APPROVED")}
        disabled={!!loading}
        className="h-7 px-3 rounded-lg text-[12px] font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-40 transition-colors"
      >
        {loading === "approve" ? "…" : "Approve"}
      </button>
      <button
        onClick={() => act("REJECTED")}
        disabled={!!loading}
        className="h-7 px-3 rounded-lg text-[12px] font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-40 transition-colors"
      >
        {loading === "reject" ? "…" : "Reject"}
      </button>
    </div>
  );
}
