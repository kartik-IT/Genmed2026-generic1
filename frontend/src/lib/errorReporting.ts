/**
 * Client-side error reporting.
 *
 * Posts structured error events to /api/errors so they are logged on the
 * server and can be forwarded to an APM service (Sentry, Datadog, etc.)
 * once one is configured.
 *
 * The API endpoint is intentionally fire-and-forget: a reporting failure
 * must never surface to the user.
 *
 * Usage:
 *   reportError(error, { context: 'SearchScreen', extra: { query } });
 *   captureGlobalErrors();   // call once at app boot
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  context?: string;
  extra?: Record<string, unknown>;
  userAgent: string;
  url: string;
  timestamp: string;
}

const ENDPOINT = '/api/errors';

export function reportError(
  error: unknown,
  meta: { context?: string; extra?: Record<string, unknown> } = {}
): void {
  const err = error instanceof Error ? error : new Error(String(error));

  const report: ErrorReport = {
    message: err.message,
    stack: err.stack,
    context: meta.context,
    extra: meta.extra,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget — never await this
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(report),
    keepalive: true, // survives page unload
  }).catch(() => { /* silently discard reporting failures */ });

  // Always log locally in development
  if (import.meta.env.DEV) {
    console.error('[ErrorReport]', report.context ?? 'unknown', err);
  }
}

/**
 * Installs window.onerror and unhandledrejection handlers.
 * Call once from src/main.tsx before rendering the React tree.
 */
export function captureGlobalErrors(): void {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? new Error(event.message), {
      context: 'window.onerror',
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason ?? new Error('Unhandled promise rejection'), {
      context: 'unhandledrejection',
    });
  });
}
