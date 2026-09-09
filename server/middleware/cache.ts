import { Request, Response, NextFunction } from 'express';

// ── In-memory response cache middleware ─────────────────────────────
// LRU-style cache for GET responses. Replace with Redis when scaling.

interface CacheEntry {
  body: unknown;
  statusCode: number;
  headers: Record<string, string>;
  timestamp: number;
}

interface CacheOptions {
  /** Time-to-live in milliseconds. Default: 300_000 (5 minutes) */
  ttlMs?: number;
  /** Maximum number of cached entries. Default: 200 */
  maxEntries?: number;
  /** Custom key generator. Defaults to req.originalUrl */
  keyGenerator?: (req: Request) => string;
}

const cacheStore = new Map<string, CacheEntry>();

function evictOldest(): void {
  if (cacheStore.size === 0) return;
  const firstKey = cacheStore.keys().next().value;
  if (firstKey) cacheStore.delete(firstKey);
}

/**
 * Creates a caching middleware for GET requests.
 *
 * Caches successful JSON responses (2xx) and serves them for subsequent
 * identical requests until the TTL expires.
 * Sets Cache-Control and X-Cache headers on responses.
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttlMs = 5 * 60 * 1000,
    maxEntries = 200,
    keyGenerator = (req: Request) => req.originalUrl,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = keyGenerator(req);
    const cached = cacheStore.get(cacheKey);

    // Serve from cache if valid
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', String(Math.floor((Date.now() - cached.timestamp) / 1000)));
      res.setHeader('Cache-Control', `public, max-age=${Math.ceil(ttlMs / 1000)}, stale-while-revalidate=${Math.ceil(ttlMs / 2000)}`);

      // Restore original headers
      for (const [key, value] of Object.entries(cached.headers)) {
        res.setHeader(key, value);
      }

      res.status(cached.statusCode).json(cached.body);
      return;
    }

    // Intercept the response to cache it
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Evict if at capacity
        while (cacheStore.size >= maxEntries) {
          evictOldest();
        }

        cacheStore.set(cacheKey, {
          body,
          statusCode: res.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
          timestamp: Date.now(),
        });
      }

      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `public, max-age=${Math.ceil(ttlMs / 1000)}, stale-while-revalidate=${Math.ceil(ttlMs / 2000)}`);

      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate all cached entries (useful after data mutations).
 */
export function clearCache(): void {
  cacheStore.clear();
}

/**
 * Invalidate cached entries matching a URL prefix.
 */
export function invalidateCache(prefix: string): void {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}
