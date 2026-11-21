/**
 * Database-backed rate limiter — works across all Vercel serverless instances.
 * Falls back to allowing the request if the DB call fails, so a DB outage
 * does not lock users out of login.
 */
import { prisma } from "./db";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;   // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000;  // 15-minute lockout after MAX_ATTEMPTS failures

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const now = new Date();

  try {
    const record = await prisma.loginAttempt.findUnique({ where: { key } });

    if (!record) {
      await prisma.loginAttempt.create({
        data: { key, count: 1, firstAttemptAt: now },
      });
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
    }

    // Still locked out
    if (record.lockedUntil && now < record.lockedUntil) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil.getTime() - now.getTime()) / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    // Window expired — reset
    if (now.getTime() - record.firstAttemptAt.getTime() > WINDOW_MS) {
      await prisma.loginAttempt.update({
        where: { key },
        data: { count: 1, firstAttemptAt: now, lockedUntil: null },
      });
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
    }

    const newCount = record.count + 1;

    if (newCount > MAX_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
      await prisma.loginAttempt.update({
        where: { key },
        data: { count: newCount, lockedUntil },
      });
      const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    await prisma.loginAttempt.update({
      where: { key },
      data: { count: newCount },
    });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - newCount, retryAfterSeconds: 0 };
  } catch {
    // DB failure — fail open so users are not locked out
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.loginAttempt.deleteMany({ where: { key } });
  } catch {
    // ignore — not critical on successful login
  }
}
