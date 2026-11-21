"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PackageTierKey } from "@/types";

export function PackagePurchaseButton({
  tier,
  hasActivePackage,
  isCurrentTier,
}: {
  tier: PackageTierKey;
  hasActivePackage: boolean;
  isCurrentTier: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const purchase = async () => {
    setError("");
    setLoading(true);
    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    router.refresh();
  };

  if (isCurrentTier) {
    return (
      <button disabled className="w-full h-8 rounded-lg text-[12px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 cursor-default">
        Active
      </button>
    );
  }

  if (hasActivePackage) {
    return (
      <button disabled className="w-full h-8 rounded-lg text-[12px] font-medium bg-neutral-800 text-neutral-600 cursor-not-allowed">
        Deactivate first
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={purchase}
        disabled={loading}
        className="w-full h-8 rounded-lg text-[12px] font-medium bg-white/[0.07] text-neutral-200 hover:bg-white/[0.12] border border-white/[0.08] disabled:opacity-50 transition-colors"
      >
        {loading ? "Activating…" : "Activate"}
      </button>
      {error && <p className="text-[11px] text-rose-400 mt-1 text-center">{error}</p>}
    </div>
  );
}
