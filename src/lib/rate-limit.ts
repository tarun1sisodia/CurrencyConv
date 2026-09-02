import { MAX_REQUESTS_PER_MINUTE, RATE_LIMIT_WINDOW_MS } from '@/lib/constants';

interface HitState {
  count: number;
  windowStart: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const hits = new Map<string, HitState>();

/**
 * In-memory sliding-window limiter (per-instance). Suitable for a single
 * Node server; swap for Upstash Redis in multi-instance production.
 */
export function rateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);
  const current = hits.get(identifier);
  if (!current || now - current.windowStart >= RATE_LIMIT_WINDOW_MS) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    hits.set(identifier, { count: 1, windowStart: now });
    return { success: true, remaining: MAX_REQUESTS_PER_MINUTE - 1, resetAt };
  }
  if (current.count >= MAX_REQUESTS_PER_MINUTE) {
    return {
      success: false,
      remaining: 0,
      resetAt: current.windowStart + RATE_LIMIT_WINDOW_MS,
    };
  }
  current.count += 1;
  return {
    success: true,
    remaining: MAX_REQUESTS_PER_MINUTE - current.count,
    resetAt: current.windowStart + RATE_LIMIT_WINDOW_MS,
  };
}

/**
 * Reads the caller IP from standard forwarding headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    return first?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') ?? request.headers.get('cf-connecting-ip') ?? 'unknown';
}

/**
 * Drops expired windows so the map cannot grow without bound.
 */
function pruneExpired(now: number): void {
  if (hits.size < 500) {
    return;
  }
  for (const [key, state] of hits) {
    if (now - state.windowStart >= RATE_LIMIT_WINDOW_MS) {
      hits.delete(key);
    }
  }
}
