import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Upstash Redis client — serverless, edge-compatible
// Falls back gracefully when env vars are missing (dev mode)
// ---------------------------------------------------------------------------

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null; // Redis not configured — all cache ops become no-ops
  }

  redis = new Redis({ url, token });
  return redis;
}

// ---------------------------------------------------------------------------
// In-Memory Fallback Cache (Zero-config for local dev & Vercel without Upstash)
// ---------------------------------------------------------------------------
interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number | null; // null = persistent until manual invalidation
}

const memoryCache = new Map<string, MemoryCacheEntry<any>>();

// Periodic cleanup of expired entries (max every 5 minutes)
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 300000) return;
  lastCleanup = now;
  for (const [k, v] of memoryCache.entries()) {
    if (v.expiresAt && now > v.expiresAt) {
      memoryCache.delete(k);
    }
  }
}

// ---------------------------------------------------------------------------
// Cache-Aside Helpers (Redis + In-Memory Fallback)
// ---------------------------------------------------------------------------

/**
 * Get a cached value. Checks Upstash Redis if configured, otherwise checks in-memory cache.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (client) {
      const cached = await client.get<T>(key);
      if (cached !== null && cached !== undefined) return cached;
    }
  } catch (err) {
    console.warn(`[Redis] cacheGet error for key="${key}", falling back to memory:`, err);
  }

  // In-memory fallback
  cleanupExpired();
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

/**
 * Set a cached value with optional TTL (in seconds).
 * Saves to Upstash Redis if configured, and always keeps in memory.
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  try {
    const client = getRedis();
    if (client) {
      if (ttlSeconds) {
        await client.set(key, value, { ex: ttlSeconds });
      } else {
        await client.set(key, value);
      }
    }
  } catch (err) {
    console.warn(`[Redis] cacheSet error for key="${key}":`, err);
  }

  // Always keep in memory cache
  memoryCache.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

/**
 * Invalidate (delete) a cached key.
 */
export async function cacheInvalidate(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (client) {
      await client.del(key);
    }
  } catch (err) {
    console.warn(`[Redis] cacheInvalidate error for key="${key}":`, err);
  }

  memoryCache.delete(key);
}

/**
 * Invalidate all keys matching a prefix pattern.
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (client) {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await client.scan(cursor, { match: pattern, count: 100 });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          await Promise.all(keys.map((k) => client.del(k as string)));
        }
      } while (cursor !== 0);
    }
  } catch (err) {
    console.warn(`[Redis] cacheInvalidatePattern error for pattern="${pattern}":`, err);
  }

  // Clear matching keys from memory
  const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const k of memoryCache.keys()) {
    if (regexPattern.test(k)) {
      memoryCache.delete(k);
    }
  }
}

/**
 * Cache-aside wrapper: tries cache first, falls back to fetcher, then stores result.
 */
export async function cacheThrough<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss — fetch from source
  const fresh = await fetcher();

  // Store in cache (non-blocking)
  cacheSet(key, fresh, ttlSeconds).catch(() => {});

  return fresh;
}

// ---------------------------------------------------------------------------
// Cache Key Constants
// ---------------------------------------------------------------------------
export const CACHE_KEYS = {
  ADMIN_OVERVIEW: 'admin:overview',
  SERVICE_CATEGORIES: 'categories:all',
  WORKER_AVAILABILITY: (categoryId: string) => `workers:available:${categoryId}`,
  WORKER_AVAILABILITY_ALL: 'workers:available:all',
  COOPERATIVE_DATA: (societyId: string) => `coop:data:${societyId}`,
} as const;

export { getRedis };
