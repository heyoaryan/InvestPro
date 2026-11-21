interface Attempt {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

// In-memory store — resets on server restart.
// For multi-instance production, replace with Redis.
const store = new Map<string, Attempt>();

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 15 * 60 * 1000;   // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000;  // 15 minute lockout after 3 failures

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, firstAttemptAt: now, lockedUntil: null });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  // Still locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Window expired — reset
  if (now - record.firstAttemptAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAttemptAt: now, lockedUntil: null });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  const newCount = record.count + 1;

  if (newCount > MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_MS;
    store.set(key, { ...record, count: newCount, lockedUntil });
    const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  store.set(key, { ...record, count: newCount });
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - newCount, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

// Prune stale entries every 30 minutes to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(store.keys());
  for (const key of keys) {
    const record = store.get(key);
    if (!record) continue;
    const expired = record.lockedUntil
      ? now > record.lockedUntil
      : now - record.firstAttemptAt > WINDOW_MS;
    if (expired) store.delete(key);
  }
}, 30 * 60 * 1000);
