import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config';
import { rateLimiter } from './middleware/rateLimiter';
import { cacheMiddleware } from './middleware/cache';
import { marketProviderStatus } from './services/marketDataService';

// Route imports
import drugsRouter from './routes/drugs';
import pharmaciesRouter from './routes/pharmacies';
import regimensRouter from './routes/regimens';
import pricingRouter from './routes/pricing';
import aiRouter from './routes/ai';
import authRouter from './routes/auth';
import pushRouter from './routes/push';
import errorsRouter from './routes/errors';

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

// ── Middleware ───────────────────────────────────────────────────────

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

// Baseline browser hardening. A deployment-specific CSP may add permitted
// analytics and monitoring origins through the reverse proxy.
app.use((_req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');
  next();
});

// CORS for development (Vite runs on port 3000, Express on 3001)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && config.corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Request ID for traceability
app.use((req, _res, next) => {
  (req as any).requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  next();
});

// Request logging in development
if (config.isDev) {
  app.use((req, _res, next) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Rate Limiting ───────────────────────────────────────────────────

// General rate limit: 100 requests per minute
const generalLimiter = rateLimiter({
  name: 'general',
  maxRequests: 100,
  windowMs: 60_000,
});

// Stricter limit for AI endpoints: 20 requests per minute
const aiLimiter = rateLimiter({
  name: 'ai',
  maxRequests: 20,
  windowMs: 60_000,
});

// ── Response Caching ────────────────────────────────────────────────

// Cache drug/pharmacy data for 5 minutes
const dataCache = cacheMiddleware({ ttlMs: 5 * 60 * 1000 });

// Cache pricing data for 2 minutes (more volatile)
const pricingCache = cacheMiddleware({ ttlMs: 2 * 60 * 1000 });

// ── API Routes ──────────────────────────────────────────────────────

app.use('/api/drugs', generalLimiter, dataCache, drugsRouter);
app.use('/api/pharmacies', generalLimiter, dataCache, pharmaciesRouter);
app.use('/api/regimens', generalLimiter, dataCache, regimensRouter);
app.use('/api/pricing', generalLimiter, pricingCache, pricingRouter);
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/auth', generalLimiter, authRouter);
app.use('/api/push', generalLimiter, pushRouter);
app.use('/api/errors', generalLimiter, errorsRouter);

// Health check (no rate limit or cache)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    providers: marketProviderStatus(),
  });
});

// Avoid exposing implementation details to clients while retaining a request ID
// that can be correlated with server-side logs.
app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[${(req as express.Request & { requestId?: string }).requestId || 'unknown'}] Unhandled API error`, error);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

// ── Static file serving (production) ────────────────────────────────

if (!config.isDev) {
  const distPath = path.resolve(currentDirectory, 'dist');
  app.use(express.static(distPath));

  // SPA fallback — serve index.html for non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Start server ────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`\n🚀 GenMed API Server running on http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Gemini AI:   ${config.geminiApiKey ? '✅ Configured' : '⚠️  Not configured (fallback mode)'}`);
  console.log(`   Rate Limit:  100 req/min (general), 20 req/min (AI)`);
  console.log(`   Caching:     5 min (data), 2 min (pricing)`);
  console.log(`\n   Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/drugs`);
  console.log(`   GET  /api/drugs/search?q=`);
  console.log(`   GET  /api/drugs/:id`);
  console.log(`   GET  /api/pharmacies`);
  console.log(`   GET  /api/pharmacies/:id`);
  console.log(`   GET  /api/pharmacies/:id/stock?drugId=`);
  console.log(`   GET  /api/pricing?drugId=`);
  console.log(`   GET  /api/pricing/compare?drugIds=`);
  console.log(`   GET  /api/regimens`);
  console.log(`   GET  /api/regimens/:id`);
  console.log(`   GET  /api/regimens/ledger/all`);
  console.log(`   POST /api/ai/search`);
  console.log(`   POST /api/ai/recommend`);
  console.log(`   POST /api/ai/compare`);
  console.log(`   GET  /api/ai/status\n`);
  console.log(`   GET  /api/auth/status`);
  console.log(`   GET  /api/auth/me`);
});
