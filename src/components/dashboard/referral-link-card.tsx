"use client";

import { useState } from "react";

export function ReferralLinkCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://investpro.app";
  const url = `${origin}/register?ref=${referralCode}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6 flex flex-col justify-between gap-5">
      <div>
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-1.5">Referral Link</p>
        <p className="text-sm text-neutral-300">Share this link to earn 20% instantly on every referral's package.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/[0.06] rounded-xl px-3 py-2.5">
          <span className="flex-1 text-xs font-mono text-neutral-400 truncate">
            /register?ref=<span className="text-indigo-400">{referralCode}</span>
          </span>
        </div>
        <button
          onClick={copy}
          className={`w-full h-9 rounded-xl text-[13px] font-medium transition-all ${
            copied
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-indigo-600 hover:bg-indigo-500 text-white"
          }`}
        >
          {copied ? "✓ Copied to clipboard" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
