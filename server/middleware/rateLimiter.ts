import { Request, Response, NextFunction } from 'express';

// ── Sliding-window rate limiter ─────────────────────────────────────
// In-memory implementation. Replace with Redis-backed limiter in prod
// if running multiple server instances behind a load balancer.

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimiterOptions {
  /** Max requests allowed within the window. Default: 100 */
  maxRequests?: number;
  /** Window size in milliseconds. Default: 60_000 (1 minute) */
  windowMs?: number;
  /** Identifier for logging. Default: 'general' */
  name?: string;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

/**
 * Creates a rate-limiting middleware using a sliding-window counter.
 *
 * Tracks requests per client IP. When the limit is exceeded,
 * responds with 429 and a Retry-After header.
 */
export function rateLimiter(options: RateLimiterOptions = {}) {
  const {
    maxRequests = 100,
    windowMs = 60_000,
    name = 'general',
  } = options;

  const store = getStore(name);

  // Periodic cleanup to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, windowMs * 2);

  // Don't block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = store.get(clientKey);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(clientKey, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(now + retryAfterMs).toISOString());

      res.status(429).json({
        error: 'Too many requests',
        retryAfterSeconds: retryAfterSec,
        limit: maxRequests,
        windowSeconds: Math.ceil(windowMs / 1000),
      });
      return;
    }

    // Record this request
    entry.timestamps.push(now);

    // Set rate-limit headers on all responses
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(maxRequests - entry.timestamps.length));

    next();
  };
}
