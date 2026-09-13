import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './redis';

// ---------------------------------------------------------------------------
// Rate Limiter — Redis-backed sliding window
// Falls back to permissive behavior when Redis is unavailable
// ---------------------------------------------------------------------------

let chatLimiter: Ratelimit | null = null;
let bookingLimiter: Ratelimit | null = null;

/**
 * Rate limiter for the /api/chat endpoint.
 * Allows 15 requests per 60-second sliding window per identifier.
 */
export function getChatRateLimiter(): Ratelimit | null {
  if (chatLimiter) return chatLimiter;

  const redis = getRedis();
  if (!redis) return null;

  chatLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, '60 s'),
    prefix: 'ratelimit:chat',
    analytics: true,
  });

  return chatLimiter;
}

/**
 * Rate limiter for booking creation.
 * Allows 5 bookings per 60-second window per customer.
 */
export function getBookingRateLimiter(): Ratelimit | null {
  if (bookingLimiter) return bookingLimiter;

  const redis = getRedis();
  if (!redis) return null;

  bookingLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'ratelimit:booking',
    analytics: true,
  });

  return bookingLimiter;
}

// In-memory sliding window fallback
const memoryWindows = new Map<string, number[]>();

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  options: { maxRequests?: number; windowMs?: number } = { maxRequests: 15, windowMs: 60000 }
): Promise<{ success: boolean; remaining: number; resetMs: number }> {
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        resetMs: result.reset,
      };
    } catch (err) {
      console.warn('[RateLimit] Redis error, using in-memory limiter fallback:', err);
    }
  }

  // In-memory sliding window algorithm
  const now = Date.now();
  const windowMs = options.windowMs || 60000;
  const max = options.maxRequests || 15;

  const timestamps = memoryWindows.get(identifier) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= max) {
    const oldest = validTimestamps[0];
    const resetMs = oldest + windowMs - now;
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  validTimestamps.push(now);
  memoryWindows.set(identifier, validTimestamps);

  return {
    success: true,
    remaining: max - validTimestamps.length,
    resetMs: windowMs,
  };
}
