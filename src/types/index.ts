import type { User, Package, Transaction, Commission, Withdrawal, AdminReserve } from "@prisma/client";

export type { User, Package, Transaction, Commission, Withdrawal, AdminReserve };

export type PackageTierKey = "STARTER" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface PackageConfig {
  tier: PackageTierKey;
  investmentAmount: number;
  dailyRoiRate: number;
  durationDays: number;
  maxMultiplier: number;
  label: string;
  color: string;
}

export interface LevelConfig {
  level: number;
  percentage: number;
  requiredDirects: number;
  requiredTeamSize: number;
  label: string;
}

export interface CommissionSchedule {
  commissionId: string;
  toUserId: string;
  amount: number;
  installmentNumber: 1 | 2 | 3;
  dueDate: Date;
}

export interface DashboardStats {
  walletBalance: number;
  totalRoiEarned: number;
  totalDirectBonus: number;
  totalTeamCommission: number;
  totalWithdrawn: number;
  capUsedPercent: number;
  activePackage: Package | null;
  pendingInstallments: PendingInstallment[];
}

export interface PendingInstallment {
  commissionId: string;
  fromUserName: string;
  level: number;
  amount: number;
  installmentNumber: number;
  dueDate: Date;
  paid: boolean;
}

export interface TeamMemberNode {
  id: string;
  name: string;
  email: string;
  level: number;
  packageTier: string | null;
  investmentAmount: number;
  joinedAt: Date;
  directReferrals: number;
  children?: TeamMemberNode[];
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalInvested: number;
  totalPaidOut: number;
  platformBalance: number;
  pendingWithdrawals: number;
  activePackages: number;
}

export interface WithdrawalRequest {
  amount: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "MEMBER" | "ADMIN";
  referralCode: string;
}
