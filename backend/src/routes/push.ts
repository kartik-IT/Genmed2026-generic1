/**
 * Push notification subscription management.
 *
 * POST /api/push/subscribe   – store a browser PushSubscription
 * DELETE /api/push/subscribe – remove a subscription
 * POST /api/push/test        – send a test notification (dev only)
 *
 * In production the stored subscriptions would live in a database and
 * notifications would be sent via the Web Push Protocol using the VAPID
 * key pair in environment variables. This implementation provides the
 * correct REST contract and in-memory storage so the client-side service
 * worker integration works end-to-end in development.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';

const router = Router();

// ── In-memory subscription store (replace with DB in production) ────
interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userId?: string;
  createdAt: string;
}

const subscriptions = new Map<string, StoredSubscription>();

// ── VAPID public key ────────────────────────────────────────────────
// Generate with: npx web-push generate-vapid-keys
// Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';

router.get('/vapid-public-key', (_req: Request, res: Response) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(503).json({ error: 'Push notifications are not configured' });
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe
router.post('/subscribe', (req: Request, res: Response) => {
  const { endpoint, keys, userId } = req.body as Partial<StoredSubscription>;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription payload' });
  }

  // Deduplicate by endpoint
  subscriptions.set(endpoint, {
    endpoint,
    keys,
    userId,
    createdAt: new Date().toISOString(),
  });

  console.log(`[Push] Subscription registered (total: ${subscriptions.size})`);
  res.status(201).json({ subscribed: true, total: subscriptions.size });
});

// DELETE /api/push/subscribe
router.delete('/subscribe', (req: Request, res: Response) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  subscriptions.delete(endpoint);
  res.json({ unsubscribed: true });
});

// POST /api/push/test – developer test only
router.post('/test', (req: Request, res: Response) => {
  if (!config.isDev) return res.status(403).json({ error: 'Forbidden in production' });

  const count = subscriptions.size;
  console.log(`[Push] Test notification would be sent to ${count} subscriber(s)`);
  res.json({ sent: count, message: 'Test notification queued (no-op in dev without web-push library)' });
});

// GET /api/push/status
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    configured: Boolean(VAPID_PUBLIC_KEY),
    subscriptions: subscriptions.size,
  });
});

export default router;
