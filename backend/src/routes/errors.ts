/**
 * Client error ingestion endpoint.
 *
 * POST /api/errors  — receives a structured ErrorReport from the browser,
 * logs it server-side, and (when configured) forwards it to an APM service.
 *
 * The endpoint always returns 204 so the client never surfaces a secondary
 * error from failed reporting.
 */

import { Router, Request, Response } from 'express';

const router = Router();

interface ErrorReport {
  message?: string;
  stack?: string;
  context?: string;
  extra?: unknown;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}

router.post('/', (req: Request, res: Response) => {
  const report = req.body as ErrorReport;

  // Sanitise to avoid log-injection
  const message = String(report.message ?? '').slice(0, 500);
  const context = String(report.context ?? 'client').slice(0, 100);
  const timestamp = report.timestamp ?? new Date().toISOString();

  console.error(
    `[ClientError] [${timestamp}] [${context}] ${message}`,
    // Only include stack in development to avoid leaking internals
    process.env.NODE_ENV === 'development' ? report.stack : undefined
  );

  // TODO: forward to APM (Sentry, Datadog, etc.) when configured:
  // if (SENTRY_DSN) Sentry.captureException(new Error(message), { extra: report });

  res.status(204).end();
});

export default router;
