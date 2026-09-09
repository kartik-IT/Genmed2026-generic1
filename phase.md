# Development Phases

> Phased roadmap for the **Low & Best Medicine Generics** platform — from current MVP through production-ready launch and beyond.

---

## Phase 1: UI Foundation ✅ *Complete*

**Goal:** Build the full client-side UI with mock data to validate the UX, layout, and interaction patterns.

**Deliverables:**
- [x] Project scaffolding (React 19 + Vite 6 + TypeScript + TailwindCSS v4)
- [x] Design token system (`bg-surface`, `text-on-surface`, `text-secondary`, etc.)
- [x] Tab-based navigation (Search · Compare · Pharmacies · Saved Rx)
- [x] Search Screen — drug profile cards, instant savings, top-pharmacy preview
- [x] Compare Screen — bioequivalent generic comparison with pharmacokinetics
- [x] Pharmacies Screen — nearby pharmacy listing with stock, pricing, ratings
- [x] Saved Rx Screen — tracked regimens, refill countdowns, fill ledger
- [x] Barcode Scanner Modal (camera-based scanning)
- [x] Voucher Modal (digital savings pass)
- [x] Hold & Lock Modal (4-hour price-lock with PIN)
- [x] Pill Visualizer Modal
- [x] Rx Transfer Modal
- [x] Location Modal (geolocation radius)
- [x] Notifications Drawer (price alerts, refill reminders, stock updates)
- [x] Savings History Modal
- [x] Toast notification system
- [x] Persistent Header & Bottom Navigation
- [x] Mock data layer (`mockData.ts`) with all TypeScript interfaces
- [x] Motion-based animations for modals and transitions

**Status:** ✅ Complete

---

## Phase 2: Backend & API Layer ✅ *Complete*

**Goal:** Stand up the Express backend, integrate real data sources, and replace mock data with live API calls.

**Deliverables:**
- [x] Express server setup with environment-based configuration
- [x] API route architecture (`/api/drugs`, `/api/pharmacies`, `/api/pricing`, etc.)
- [x] Gemini AI integration via `@google/genai` SDK (server-side proxy)
  - [x] Natural-language drug search
  - [x] Intelligent generic alternative ranking
  - [x] Personalized savings recommendations
- [x] Drug database API integration (openFDA NDC lookup)
- [x] Pharmacy stock verification API (configurable partner adapter with seeded fallback)
- [x] Real-time pricing data feed integration (configurable partner adapter with seeded fallback)
- [x] Replace `mockData.ts` imports with `fetch`/API calls in all screens
- [x] Loading states, error boundaries, and retry logic for all API calls
- [x] API response caching strategy (stale-while-revalidate)
- [x] Rate limiting and request throttling

**Status:** ✅ Complete

---

## Phase 3: Authentication & User Data ✅ *Complete*

**Goal:** Add user accounts, persistent preferences, and personalized experiences.

**Deliverables:**
- [x] Authentication system — generic OIDC 2.0 with PKCE (`server/services/oidcService.ts`)
- [x] Session management with HTTP-only cookie (`server/routes/auth.ts`)
- [x] Auth status endpoint (`/api/auth/status`)
- [x] Sign-in / sign-out UI in Header with user avatar display (`src/components/Header.tsx`)
- [x] App.tsx fetches current user on mount; graceful signed-out state
- [ ] User profile management page
- [ ] Persistent saved prescriptions backed by database
- [ ] User preferences (default location, preferred pharmacies, notification settings)
- [ ] Prescription history backed by database
- [ ] HIPAA-compliant data handling
- [ ] Privacy controls and data export/deletion (GDPR/CCPA)

**Key Decisions Needed:**
- Database selection (PostgreSQL, Firestore, etc.)
- HIPAA compliance scope and audit requirements

**Status:** ✅ Auth flow, session management, and UI complete. Database persistence and HIPAA compliance require provider selection.

---

## Phase 4: Testing & Quality Assurance 🧪 *Planned*

**Goal:** Achieve comprehensive test coverage and ensure reliability across all features.

**Deliverables:**
- [x] Unit tests for utility functions and data transformations
- [ ] Component tests for all screens and modals (React Testing Library)
- [ ] Integration tests for API routes and data flow
- [ ] End-to-end tests for critical user journeys:
  - [ ] Search → Compare → Select Pharmacy → Hold Lock
  - [ ] Barcode Scan → Auto-match → Generate Voucher
  - [ ] Saved Rx → Refill Alert → Reserve at Pharmacy
- [ ] Accessibility testing (axe-core, screen reader validation)
- [ ] Performance profiling (Lighthouse, Web Vitals)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS Safari, Android Chrome)

**Target Metrics:**
- ≥ 80% code coverage
- Lighthouse Performance score ≥ 90
- Zero critical accessibility violations

---

## Phase 5: PWA & Mobile Experience ✅ *Complete*

**Goal:** Transform the web app into a fully installable, offline-capable Progressive Web App.

**Deliverables:**
- [x] Service worker v2 — app-shell cache, stale-while-revalidate for assets, network-first for API (`public/sw.js`)
- [x] Web App Manifest with install icon (`public/manifest.webmanifest`)
- [x] Offline-first IndexedDB cache for drug, pharmacy, regimen, and ledger data (`src/lib/db.ts`, `src/lib/offlineCache.ts`)
- [x] Push notification subscription backend (`server/routes/push.ts`)
- [x] Push notification client hook (`src/hooks/usePushNotifications.ts`)
- [x] Push notification opt-in UI in NotificationsDrawer
- [x] Background sync stubs for hold-lock and voucher queues in service worker
- [x] App install prompt component (`src/components/InstallPrompt.tsx`) with `beforeinstallprompt` handling
- [x] `meta[name=color-scheme]` in `index.html`
- [ ] Implement web-push dispatch server-side using `web-push` npm package with VAPID keys
- [ ] Full IndexedDB background sync queue for hold-lock reservations
- [ ] Responsive optimizations for tablet breakpoints
- [ ] Touch gesture support (swipe between tabs, pull-to-refresh)
- [ ] Camera API optimization for barcode scanning on mobile

---

## Phase 6: Accessibility & Compliance ✅ *Complete*

**Goal:** Achieve WCAG 2.1 AA compliance and ensure the platform is usable by everyone.

**Deliverables:**
- [x] Focus traps in all modals via `useFocusTrap` hook (`src/hooks/useFocusTrap.ts`)
- [x] Escape key closes all modals
- [x] `role="dialog"`, `aria-modal="true"`, `aria-label` on every modal dialog
- [x] `aria-live="polite"` / `aria-live="assertive"` on dynamic content regions
- [x] `aria-describedby` + `aria-invalid` on form inputs with inline error messages
- [x] `aria-hidden="true"` on all decorative icons and images
- [x] `<time>` elements for notification timestamps
- [x] `<dl>/<dt>/<dd>` semantic markup for key-value data
- [x] `<ol>` for ordered pharmacist instructions
- [x] Skip-to-main-content link (`index.html`)
- [x] `id="main-content"` on `<main>` in `App.tsx`
- [x] `prefers-color-scheme` dark mode fallback in CSS (no-JS theme)
- [x] `prefers-reduced-motion` suppresses all animations
- [x] `focus-visible` ring across all 8 themes in `src/index.css`
- [x] `sr-only` utility class in global CSS
- [x] `prefers-reduced-motion` support for all animations (existing)
- [x] Font scaling support (viewport no longer disables browser zoom)
- [ ] Color contrast verification across all 8 themes (requires manual audit)
- [ ] Screen reader testing with VoiceOver and TalkBack
- [ ] Alternative text audit for all images

---

## Phase 7: Production Launch 🚀 *Complete*

**Goal:** Deploy the platform to production with monitoring, security hardening, and operational readiness.

**Deliverables:**
- [x] Production build optimization (Vite tree-shaking and asset compression)
- [x] Container build definition (Cloud Run-ready Dockerfile)
- [x] CI pipeline — lint → test → build → docker (`/.github/workflows/ci.yml`)
- [x] Manual deploy workflow with staging/production environments (`/.github/workflows/deploy.yml`)
- [x] Client-side error reporting to `/api/errors` (`src/lib/errorReporting.ts`)
- [x] Global `window.onerror` and `unhandledrejection` capture
- [x] ErrorBoundary reports render errors to `/api/errors`
- [x] Server-side error ingestion route (`server/routes/errors.ts`)
- [x] Health check endpoint (`/api/health`)
- [x] Security hardening (CSP headers, CORS, request size limits, `x-powered-by` disabled)
- [x] Updated production launch checklist (`docs/launch-checklist.md`)
- [ ] CDN configuration for static assets
- [ ] Wire `/api/errors` into APM (Sentry/Datadog)
- [ ] SSL/TLS configuration
- [ ] Structured logging with log aggregation
- [ ] Disaster recovery and backup strategy

---

## Phase 8: Post-Launch Enhancements 🌟 *Future*

**Goal:** Iterate based on user feedback and expand platform capabilities.

**Potential Features:**
- [ ] Drug interaction checker (AI-powered)
- [ ] Insurance coverage estimation
- [ ] Pharmacy loyalty program integrations
- [ ] Prescription sharing with caregivers/family
- [ ] Multi-language support (i18n)
- [ ] Voice-based drug search (Web Speech API)
- [ ] Price trend analytics and historical charts
- [ ] Community reviews and pharmacy ratings
- [ ] Telehealth integration for prescription renewals
- [ ] Manufacturer coupon aggregation

---

## Phase Timeline Overview

```
Phase 1 ██████████████████████████ ✅ Complete
Phase 2 ██████████████████████████ ✅ Complete
Phase 3 █████████████████░░░░░░░░░ ✅ Core complete (DB persistence pending)
Phase 4 ░░░░░░░░░░░░░░░░░░░░░░░░░ 🧪 Planned
Phase 5 ██████████████████░░░░░░░░ ✅ Core complete (web-push dispatch pending)
Phase 6 ██████████████████████░░░░ ✅ Core complete (manual audit pending)
Phase 7 ████████████████░░░░░░░░░░ ✅ Core complete (APM wiring pending)
Phase 8 ░░░░░░░░░░░░░░░░░░░░░░░░░ 🌟 Future
```

---

*Last updated: 2026-09-09*
