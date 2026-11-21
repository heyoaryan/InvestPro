"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, WITHDRAWAL_FEE_RATE } from "@/lib/utils";

export function WithdrawalForm({ walletBalance }: { walletBalance: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const num = parseFloat(amount) || 0;
  const fee = num * WITHDRAWAL_FEE_RATE;
  const net = num - fee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: num }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setSuccess("Request submitted — pending admin approval.");
    setAmount("");
    router.refresh();
  };

  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6">
      <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-5">
        Request Withdrawal
      </p>

      {success && (
        <div className="text-[13px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="text-[13px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest block mb-1.5">
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            max={walletBalance}
            step={0.01}
            required
            placeholder="0.00"
            className="w-full h-10 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <p className="text-[11px] text-neutral-600 mt-1.5">
            Available: {formatCurrency(walletBalance)}
          </p>
        </div>

        {num > 0 && (
          <div className="bg-[#1a1a1a] border border-white/[0.05] rounded-xl p-4 space-y-2 text-[13px]">
            <div className="flex justify-between text-neutral-500">
              <span>Requested</span>
              <span className="text-neutral-300">{formatCurrency(num)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Admin fee (10%)</span>
              <span className="text-rose-400">−{formatCurrency(fee)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-white/[0.05]">
              <span className="text-neutral-400">You receive</span>
              <span className="text-emerald-400">{formatCurrency(net)}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || num <= 0 || num > walletBalance}
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-xl transition-colors"
        >
          {loading ? "Submitting…" : "Request withdrawal"}
        </button>
      </form>
    </div>
  );
}
