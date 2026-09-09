# Project Memory

> A living document capturing the current state, key learnings, known issues, and important context for the **Low & Best Medicine Generics** platform. Update this file as the project evolves.

---

## Project Overview

| Field               | Value                                                              |
|---------------------|--------------------------------------------------------------------|
| **Name**            | Low & Best Medicine Generics                                       |
| **Description**     | Cost-aware bioequivalent medicine discovery, clinical comparison, pharmacy stock verification, and digital savings pass platform |
| **Stack**           | React 19 · Vite 6 · TypeScript · TailwindCSS v4 · Motion · Express |
| **AI Integration**  | Google Gemini via `@google/genai` (server-side)                    |
| **License**         | Apache-2.0                                                        |
| **Dev Server Port** | 3000 (Vite) / 3001 (Express API)                                  |

---

## Current State (as of 2026-09-09)

### What's Built ✅
- **Search Screen** — Drug search with AI-powered backend, profile cards, savings display, top-pharmacy preview, and quick actions.
- **Compare Screen** — Side-by-side bioequivalent generic comparison with pharmacokinetics data.
- **Pharmacies Screen** — Nearby pharmacy listing with stock status, pricing, ratings, bio-match %, and drive-thru availability.
- **Saved Rx Screen** — Tracked regimen management with refill tracking, price-drop alerts, and blockchain-style fill ledger.
- **All Modals** — Barcode Scanner, Voucher, Hold & Lock, Pill Visualizer, Rx Transfer, Location, Notifications Drawer, Savings History, Theme Studio — all with ARIA roles and focus traps.
- **Authentication** — OIDC 2.0 with PKCE, server-side session management, sign-in/sign-out UI in Header with user avatar.
- **PWA** — Service worker v2 (app-shell + stale-while-revalidate), Web App Manifest, IndexedDB offline-first cache, push notification subscription, app install prompt.
- **Offline-first data** — `src/lib/db.ts` (IndexedDB), `src/lib/offlineCache.ts` (stale-while-revalidate helpers for all data types).
- **Push Notifications** — Backend (`/api/push/*`), client hook (`usePushNotifications`), opt-in UI in NotificationsDrawer, service worker push handler.
- **Background Sync stubs** — `hold-lock-sync` and `voucher-save-sync` tags in service worker (replay logic to be implemented).
- **Accessibility** — Focus traps (`useFocusTrap`), skip link, ARIA dialogs, `aria-live` regions, semantic HTML, `prefers-color-scheme`, `prefers-reduced-motion`, `focus-visible` ring, `sr-only` utility.
- **Error Reporting** — `captureGlobalErrors()` in `main.tsx`, `reportError()` helper, `/api/errors` ingestion route, ErrorBoundary integration.
- **CI/CD** — GitHub Actions: `ci.yml` (lint → test → build → docker), `deploy.yml` (manual staging/production trigger).
- **Theme System** — 8 themes with persistent localStorage, dark/light toggle, `prefers-color-scheme` OS fallback.

### What's Pending ⏳
- [ ] Database persistence for sessions, regimens, and user preferences
- [ ] HIPAA compliance review and BAA with identity/data provider
- [ ] Web-push server dispatch (requires `web-push` npm package + VAPID keys configured)
- [ ] IndexedDB background sync queue for hold-lock requests
- [ ] Component and E2E test suite
- [ ] Accessibility audit (axe-core, screen reader, contrast ratios)
- [ ] APM integration (wire `/api/errors` to Sentry/Datadog)
- [ ] Real pricing and pharmacy-stock data provider contracts

---

## Key Technical Notes

### App Architecture
- `App.tsx` is the central orchestrator — global state lives here.
- Screens are "dumb" — they receive data and emit events via callback props.
- Navigation is state-driven via `NavTab` union type: `'search' | 'compare' | 'pharmacies' | 'saved-rx'`.

### Data Flow
```
IndexedDB (offline cache) ←→ API layer (src/api/*) → useApi hook → App.tsx (state) → Screens / Modals
                                    ↑
                           offlineCache.ts (stale-while-revalidate)
                                    ↑
                               /api/* (Express)
```

### Offline Strategy
1. First load: fetch from network, persist to IndexedDB.
2. Subsequent loads within 10 min: serve IndexedDB immediately; background-refresh if age > 5 min.
3. Network unavailable: serve IndexedDB; surface `Error` if no cache exists.

### Push Notifications
- Server: `server/routes/push.ts` manages subscriptions (in-memory; replace with DB for production).
- Client: `usePushNotifications` hook handles permission, subscribe/unsubscribe.
- Service worker: handles `push` events and displays native notifications.
- VAPID keys must be generated and set in env before this works end-to-end.

### Auth Flow
- `/api/auth/login` → OIDC provider → `/api/auth/callback` → session cookie → `/api/auth/me`.
- App.tsx calls `fetchCurrentUser()` on mount when `authStatus.configured === true`.
- Header shows user avatar/initials when signed in; sign-in button (disabled when unconfigured) otherwise.

### Error Reporting
- `captureGlobalErrors()` (called in `main.tsx`) installs `window.onerror` and `unhandledrejection` handlers.
- `reportError(error, { context, extra })` posts to `/api/errors` (fire-and-forget).
- `ErrorBoundary.componentDidCatch` calls `reportError` automatically.
- `/api/errors` logs server-side; wire to Sentry/Datadog when ready.

### CI/CD
- `ci.yml`: runs on every push/PR — type-check, tests, production build, docker build.
- `deploy.yml`: manually triggered workflow — targets staging or production environment.
- Docker push and Cloud Run deploy steps exist but are commented out pending registry config.

### Important Interfaces
- `DrugProfile` — Core drug entity with nested `alternatives` and `pharmacies`.
- `Pharmacy` — Pricing, stock, geo, bio-match %, verification timestamps.
- `GenericAlternative` — Bioequivalence data, AUC, manufacturer, savings.
- `TrackedRegimen` — User's saved prescription with refill tracking.
- `FillLedgerItem` — Immutable fill record with hash.

### Environment Variables
| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | For AI features | Gemini AI search and recommendations |
| `OPENFDA_API_KEY` | Optional | Higher openFDA rate limits |
| `OIDC_ISSUER` | For auth | OpenID Connect provider URL |
| `OIDC_CLIENT_ID` | For auth | OIDC client ID |
| `OIDC_CLIENT_SECRET` | For auth | OIDC client secret |
| `OIDC_REDIRECT_URI` | For auth | Auth callback URL |
| `VAPID_PUBLIC_KEY` | For push | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | For push | Web Push VAPID private key |
| `PHARMACY_STOCK_PROVIDER_URL` | For live stock | Partner inventory API base URL |
| `PHARMACY_STOCK_PROVIDER_KEY` | For live stock | Partner inventory API key |
| `PRICING_PROVIDER_URL` | For live prices | Partner pricing API base URL |
| `PRICING_PROVIDER_KEY` | For live prices | Partner pricing API key |
| `APP_URL` | Production | Self-referential URL |
| `PORT` | Optional | Express port (default: 3001) |

---

## Known Issues & Gotchas

1. **Toast queue slicing** — `prev.slice(-2)` limits to 3 toasts; may drop messages under rapid-fire. Consider priority queue if needed.
2. **No deep linking** — Tab navigation without React Router means no bookmarkable URLs. Acceptable for mobile-first SPA.
3. **Mock data coupling** — `pharmacies.find(p => p.name.includes(regimen.pharmacyName))` in `App.tsx` is string-fragile. Replace with ID-based lookup when DB persistence lands.
4. **In-memory subscriptions** — Push subscriptions and OIDC sessions stored in `Map`; lost on server restart. Must migrate to persistent storage before horizontal scaling.
5. **Background sync stubs** — `replayQueuedHoldLocks()` in `sw.js` is a no-op until the IndexedDB queue is implemented.
6. **VAPID keys not generated** — `VAPID_PUBLIC_KEY` defaults to empty string; push subscription will silently no-op until keys are configured.

---

## Frequently Referenced Paths

| Purpose                  | Path                                        |
|--------------------------|---------------------------------------------|
| App entry point          | `src/App.tsx`                               |
| App boot (global errors) | `src/main.tsx`                              |
| Type definitions         | `src/types.ts`                              |
| Mock data                | `src/data/mockData.ts`                      |
| IndexedDB wrapper        | `src/lib/db.ts`                             |
| Offline cache helpers    | `src/lib/offlineCache.ts`                   |
| Error reporting          | `src/lib/errorReporting.ts`                 |
| Push hook                | `src/hooks/usePushNotifications.ts`         |
| Focus trap hook          | `src/hooks/useFocusTrap.ts`                 |
| API hook                 | `src/hooks/useApi.ts`                       |
| Component directory      | `src/components/`                           |
| Install prompt           | `src/components/InstallPrompt.tsx`          |
| Global styles            | `src/index.css`                             |
| Service worker           | `public/sw.js`                              |
| Vite config              | `vite.config.ts`                            |
| Server entry             | `server.ts`                                 |
| Server config            | `server/config.ts`                          |
| Push route               | `server/routes/push.ts`                     |
| Error route              | `server/routes/errors.ts`                   |
| OIDC service             | `server/services/oidcService.ts`            |
| CI pipeline              | `.github/workflows/ci.yml`                  |
| Deploy workflow          | `.github/workflows/deploy.yml`              |
| Launch checklist         | `docs/launch-checklist.md`                  |
| Environment example      | `.env.example`                              |

---

*Last updated: 2026-09-09*
