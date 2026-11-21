"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { SessionUser } from "@/types";

const nav = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: "/packages",
    label: "Packages",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1.5L13.5 4.5V10.5L7.5 13.5L1.5 10.5V4.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M1.5 4.5L7.5 7.5M7.5 7.5L13.5 4.5M7.5 7.5V13.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: "/referrals",
    label: "Referrals",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M9.5 3H12.5V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5 3L7.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M6.5 4H3C2.17 4 1.5 4.67 1.5 5.5V12C1.5 12.83 2.17 13.5 3 13.5H9.5C10.33 13.5 11 12.83 11 12V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/team",
    label: "My Team",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="10.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1 13C1 10.5 2.8 8.5 5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M10.5 8.5C12.7 8.5 14.5 10.5 14.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M5 8.5H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/earnings",
    label: "Earnings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 10.5L5.5 7L8 9.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.5 4H13V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/withdraw",
    label: "Withdraw",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="4.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1 7.5H14" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M4.5 1.5H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="fixed left-0 top-0 h-full w-[200px] flex flex-col bg-[#111111] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-white/[0.06] shrink-0">
        <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L11 3.5V8.5L6 11L1 8.5V3.5L6 1Z" fill="white"/>
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-white tracking-tight">InvestPro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
              }`}
            >
              <span className={`shrink-0 ${active ? "text-white" : "text-neutral-600"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 py-3 border-t border-white/[0.06] space-y-0.5 shrink-0">
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04] transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 text-neutral-600">
              <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="7.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4.5 11.5C4.5 9.84 5.84 8.5 7.5 8.5C9.16 8.5 10.5 9.84 10.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Admin panel
          </Link>
        )}
        {/* User */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-neutral-300 truncate">{user?.name ?? "—"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-neutral-600 hover:text-neutral-300 transition-colors shrink-0"
            title="Sign out"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 2H3C2.17 2 1.5 2.67 1.5 3.5V10.5C1.5 11.33 2.17 12 3 12H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M9.5 10L12.5 7L9.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.5 7H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
