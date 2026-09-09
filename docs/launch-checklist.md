# Production Launch Checklist

## Infrastructure & Environment
- [ ] Set `NODE_ENV=production`, `APP_URL`, and permitted CORS origin values in deployment environment.
- [ ] Configure `GEMINI_API_KEY` via secrets manager; optionally configure `OPENFDA_API_KEY`.
- [ ] Generate VAPID key pair (`npx web-push generate-vapid-keys`) and set `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` in environment.
- [ ] Configure OIDC provider (`OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_REDIRECT_URI`) in a HIPAA-capable identity platform.
- [ ] Replace in-memory session/subscription store with persistent storage (PostgreSQL, Redis) before horizontal scaling.
- [ ] Replace in-memory rate limiter and cache with Redis before multiple API replicas.
- [ ] Confirm TLS termination, CSP, CORS, and secret rotation in the deployment environment.

## Data Providers
- [ ] Select, contract with, and validate real-time pricing data provider; configure `PRICING_PROVIDER_URL` and key.
- [ ] Select, contract with, and validate pharmacy stock inventory provider; configure `PHARMACY_STOCK_PROVIDER_URL` and key.
- [ ] Confirm data freshness SLAs meet clinical safety requirements before removing seeded fallback labels.

## CI/CD & Deployment ✅
- [x] GitHub Actions CI pipeline (lint → test → build → docker) — `.github/workflows/ci.yml`
- [x] Manual deploy workflow with staging/production environments — `.github/workflows/deploy.yml`
- [ ] Uncomment registry push and Cloud Run deploy steps in `deploy.yml` once registry is configured.
- [ ] Add deployment environment protection rules in GitHub repository settings.
- [ ] Configure branch protection on `main` requiring CI to pass before merge.

## Monitoring & Observability ✅
- [x] Client-side error reporting to `/api/errors` — `src/lib/errorReporting.ts`
- [x] Global `window.onerror` and `unhandledrejection` capture via `captureGlobalErrors()` in `main.tsx`
- [x] ErrorBoundary reports to `/api/errors` on React render failures
- [x] Server-side health check endpoint `/api/health`
- [ ] Wire `/api/errors` into an APM service (Sentry, Datadog, etc.) in `server/routes/errors.ts`.
- [ ] Set up alerting rules for error rate spikes and latency outliers.
- [ ] Configure log aggregation (Cloud Logging, Datadog Logs, etc.).
- [ ] Add structured request/response logging in production (request ID, latency, status).

## PWA & Offline ✅
- [x] Service worker v2 with app-shell cache, stale-while-revalidate for assets, network-first for API — `public/sw.js`
- [x] Web App Manifest with install icon — `public/manifest.webmanifest`
- [x] IndexedDB offline-first data caching for drugs/pharmacies/regimens/ledger — `src/lib/db.ts`, `src/lib/offlineCache.ts`
- [x] Push notification subscription management (backend + client hook) — `server/routes/push.ts`, `src/hooks/usePushNotifications.ts`
- [x] Push notification opt-in UI in NotificationsDrawer
- [x] Background sync stubs for hold-lock and voucher queues in service worker
- [x] App install prompt component — `src/components/InstallPrompt.tsx`
- [ ] Implement actual background sync queue using IndexedDB to replay hold-lock requests.
- [ ] Implement web-push dispatch in `server/routes/push.ts` using the `web-push` npm package.

## Authentication & User Data ✅
- [x] OIDC 2.0 server flow with PKCE — `server/services/oidcService.ts`
- [x] Session cookie management — `server/routes/auth.ts`
- [x] Auth status and sign-in/sign-out UI in Header — `src/components/Header.tsx`
- [x] Graceful signed-out state in App — `src/App.tsx`
- [ ] Obtain HIPAA Business Associate Agreement (BAA) before storing user health or prescription data.
- [ ] Implement database-backed session storage replacing in-memory `Map`.
- [ ] Add token refresh flow for long-lived sessions.

## Accessibility ✅
- [x] Focus traps in all modals (VoucherModal, HoldLockModal, BarcodeScannerModal, LocationModal, NotificationsDrawer)
- [x] Escape key closes all modals
- [x] ARIA roles, labels, and `aria-modal="true"` on all dialogs
- [x] `aria-live` regions for dynamic content (hold-lock success state)
- [x] `aria-describedby`/`aria-invalid` on form inputs with accessible error messages
- [x] `aria-hidden="true"` on all decorative icons
- [x] `<time>` elements for notification timestamps
- [x] `<dl>` / `<dt>` / `<dd>` for definition/key-value data
- [x] Skip-to-main-content link — `index.html`
- [x] `prefers-color-scheme` dark mode fallback — `src/index.css`
- [x] `prefers-reduced-motion` suppresses all animations — `src/index.css`
- [x] `focus-visible` ring across all themes — `src/index.css`
- [x] `id="main-content"` landmark on `<main>` in App.tsx
- [ ] Run axe-core or Lighthouse accessibility audit to surface any remaining violations.
- [ ] Manual screen-reader testing (VoiceOver on iOS/macOS, TalkBack on Android).
- [ ] Verify colour contrast ratios ≥ 4.5:1 for all text/background combinations across all 8 themes.

## Security
- [ ] Run `npm audit` and resolve all high/critical vulnerabilities.
- [ ] Enable `Content-Security-Policy` reporting URI for CSP violation monitoring.
- [ ] Review and tighten `Permissions-Policy` header for production.
- [ ] Obtain legal/privacy review for consumer health data, price claims, and user consent.
- [ ] Add CSRF protection for state-mutating endpoints (POST logout, POST subscribe).

## Testing
- [ ] Component tests for all screens and modals (React Testing Library).
- [ ] Integration tests for API routes.
- [ ] E2E tests for critical journeys: Search → Compare → Hold Lock; Barcode Scan → Voucher; Saved Rx → Refill Reserve.
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge.
- [ ] Mobile device: iOS Safari, Android Chrome.
- [ ] Load testing with realistic concurrency before launch.

## Go / No-Go Review
- [ ] All launch-blocking checklist items above resolved.
- [ ] Legal/compliance sign-off obtained.
- [ ] Disaster recovery and backup strategy documented and tested.
- [ ] On-call runbook written and shared with operations team.
