import type { PackageConfig, LevelConfig, PackageTierKey } from "@/types";

export const PACKAGE_CONFIGS: Record<PackageTierKey, PackageConfig> = {
  STARTER: {
    tier: "STARTER",
    investmentAmount: 100,
    dailyRoiRate: 0.005,
    durationDays: 500,
    maxMultiplier: 2.5,
    label: "Starter",
    color: "#6B7280",
  },
  BRONZE: {
    tier: "BRONZE",
    investmentAmount: 500,
    dailyRoiRate: 0.01,
    durationDays: 250,
    maxMultiplier: 2.5,
    label: "Bronze",
    color: "#CD7F32",
  },
  SILVER: {
    tier: "SILVER",
    investmentAmount: 1000,
    dailyRoiRate: 0.015,
    durationDays: 167,
    maxMultiplier: 2.5,
    label: "Silver",
    color: "#9CA3AF",
  },
  GOLD: {
    tier: "GOLD",
    investmentAmount: 5000,
    dailyRoiRate: 0.02,
    durationDays: 125,
    maxMultiplier: 2.5,
    label: "Gold",
    color: "#F59E0B",
  },
  PLATINUM: {
    tier: "PLATINUM",
    investmentAmount: 10000,
    dailyRoiRate: 0.025,
    durationDays: 100,
    maxMultiplier: 2.5,
    label: "Platinum",
    color: "#8B5CF6",
  },
};

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, percentage: 0.08, requiredDirects: 2, requiredTeamSize: 0, label: "Level 1" },
  { level: 2, percentage: 0.05, requiredDirects: 4, requiredTeamSize: 5, label: "Level 2" },
  { level: 3, percentage: 0.03, requiredDirects: 7, requiredTeamSize: 20, label: "Level 3" },
  { level: 4, percentage: 0.02, requiredDirects: 10, requiredTeamSize: 80, label: "Level 4" },
  { level: 5, percentage: 0.02, requiredDirects: 15, requiredTeamSize: 200, label: "Level 5" },
];

export const WITHDRAWAL_FEE_RATE = 0.1;
export const DIRECT_REFERRAL_RATE = 0.2;
export const COMMISSION_POOL_RATE = 0.2;
export const CAP_MULTIPLIER = 2.5;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function daysFromNow(daysAhead: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
