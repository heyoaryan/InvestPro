"use client";

import { formatCurrency } from "@/lib/utils";
import type { TeamMemberNode } from "@/types";

function NodeRow({ node, depth = 0 }: { node: TeamMemberNode; depth?: number }) {
  return (
    <div>
      <div
        className="flex items-center gap-3 py-2.5 hover:bg-white/[0.02] transition-colors rounded-lg px-2"
        style={{ paddingLeft: `${8 + depth * 20}px` }}
      >
        <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-300 shrink-0">
          {node.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-neutral-200 font-medium truncate">{node.name}</p>
          <p className="text-[11px] text-neutral-600">
            {node.packageTier
              ? `${node.packageTier} · ${formatCurrency(node.investmentAmount)}`
              : "No package"}
            {" · "}{node.directReferrals} direct{node.directReferrals !== 1 ? "s" : ""}
          </p>
        </div>
        {node.packageTier && (
          <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full shrink-0">
            {node.packageTier}
          </span>
        )}
      </div>
      {node.children?.map((child) => (
        <NodeRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function TeamTreeView({ tree, currentUserName }: { tree: TeamMemberNode[]; currentUserName: string }) {
  return (
    <div className="rounded-2xl bg-[#141414] border border-white/[0.07] overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-0.5">
          Team Structure
        </p>
        <p className="text-sm text-neutral-300">
          {tree.length > 0 ? `${tree.length} direct member${tree.length !== 1 ? "s" : ""}` : "No members yet"}
        </p>
      </div>

      <div className="p-3">
        {/* Root user */}
        <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {currentUserName[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-[13px] text-white font-semibold">{currentUserName}</p>
            <p className="text-[11px] text-neutral-600">You (Root)</p>
          </div>
        </div>

        {tree.length === 0 ? (
          <p className="text-[12px] text-neutral-600 px-2 pb-4">
            Share your referral link to grow your team.
          </p>
        ) : (
          <div className="border-l border-white/[0.05] ml-5">
            {tree.map((node) => (
              <NodeRow key={node.id} node={node} depth={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
