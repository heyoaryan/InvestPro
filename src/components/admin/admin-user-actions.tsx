"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminUserActions({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const num = parseFloat(amount);
    if (isNaN(num) || !reason.trim()) {
      setError("Fill in both fields");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: num, reason }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setAmount("");
      setReason("");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error || "Failed");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-7 px-3 rounded-lg text-[12px] font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-white/[0.06] transition-colors"
      >
        Adjust
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-1">Adjust Wallet</h3>
            <p className="text-[13px] text-neutral-500 mb-5">{userName}</p>

            {error && (
              <p className="text-[13px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest block mb-1.5">
                  Amount (negative to deduct)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 100 or -50"
                  className="w-full h-10 rounded-xl bg-[#1a1a1a] border border-white/[0.08] px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest block mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Manual bonus, correction…"
                  className="w-full h-10 rounded-xl bg-[#1a1a1a] border border-white/[0.08] px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 h-10 rounded-xl text-[13px] font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 h-10 rounded-xl text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Applying…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
