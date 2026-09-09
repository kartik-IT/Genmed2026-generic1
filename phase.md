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

**Status:** ✅ Complete — All screens, modals, and UI components are functional with mock data.

---

## Phase 2: Backend & API Layer 🔧 *In Progress*

**Goal:** Stand up the Express backend, integrate real data sources, and replace mock data with live API calls.

**Deliverables:**
- [x] Express server setup with environment-based configuration
- [x] API route architecture (`/api/drugs`, `/api/pharmacies`, `/api/pricing`, etc.)
- [x] Gemini AI integration via `@google/genai` SDK (server-side proxy)
  - [x] Natural-language drug search
  - [x] Intelligent generic alternative ranking
  - [x] Personalized savings recommendations
- [ ] Drug database API integration (NDC lookup, bioequivalence data) — live NDC lookup is available via openFDA; an authoritative bioequivalence source still needs to be selected.
- [ ] Pharmacy stock verification API
- [ ] Real-time pricing data feed integration
- [x] Replace `mockData.ts` imports with `fetch`/API calls in all screens
- [x] Loading states, error boundaries, and retry logic for all API calls
- [x] API response caching strategy (stale-while-revalidate)
- [x] Rate limiting and request throttling

**Implementation note (2026-09-09):** The API contracts, cache, rate limiter, and
server-side AI proxy are complete. The NDC endpoint reads the public openFDA
Directory. Stock and pricing have configurable, server-side partner adapters with
response validation and source/freshness metadata; without configured provider URLs
and credentials, they deliberately return a clearly labeled seeded fallback. Live
sources cannot be represented as verified until contracts, licensing, and freshness
requirements are agreed.

**Key Decisions Needed:**
- Drug pricing data provider selection
- Pharmacy stock API vendor
- Caching layer (in-memory vs. Redis)

---

## Phase 3: Authentication & User Data 🔒 *Planned*

**Goal:** Add user accounts, persistent preferences, and personalized experiences.

**Deliverables:**
- [ ] Authentication system (OAuth 2.0 / OpenID Connect) — secure generic OIDC flow and session endpoints are implemented; provider configuration and production session storage are required before enabling it.
- [ ] User profile management
- [ ] Persistent saved prescriptions (Saved Rx backed by database)
- [ ] User preferences (default location, preferred pharmacies, notification settings)
- [ ] Prescription history and fill records (replace in-memory ledger)
- [ ] Secure session management with token refresh
- [ ] HIPAA-compliant data handling for health-related information
- [ ] Privacy controls and data export/deletion (GDPR/CCPA)

**Key Decisions Needed:**
- Auth provider (Firebase Auth, Auth0, custom)
- Database selection (PostgreSQL, Firestore, etc.)
- HIPAA compliance scope and audit requirements

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

## Phase 5: PWA & Mobile Experience 📱 *Planned*

**Goal:** Transform the web app into a fully installable, offline-capable Progressive Web App.

**Deliverables:**
- [x] Service worker for offline caching (custom app-shell strategy; Workbox not required)
- [x] Web App Manifest (`manifest.json`) with install icon
- [ ] Offline-first data strategy (IndexedDB for cached drug/pharmacy data)
- [ ] Push notifications for price alerts and refill reminders
- [ ] App install prompt (Add to Home Screen)
- [ ] Background sync for queued actions (hold-lock reservations, voucher saves)
- [ ] Responsive optimizations for tablet breakpoints
- [ ] Touch gesture support (swipe between tabs, pull-to-refresh)
- [ ] Camera API optimization for barcode scanning on mobile

---

## Phase 6: Accessibility & Compliance ♿ *Planned*

**Goal:** Achieve WCAG 2.1 AA compliance and ensure the platform is usable by everyone.

**Deliverables:**
- [ ] Semantic HTML audit across all components
- [ ] ARIA labels and roles for all interactive elements
- [ ] Keyboard navigation support (focus traps in modals, tab ordering)
- [ ] Screen reader testing and optimization
- [ ] Color contrast verification (4.5:1 minimum ratio)
- [x] `prefers-reduced-motion` support for all animations
- [ ] `prefers-color-scheme` support (light/dark mode toggle)
- [x] Font scaling support (browser zoom is enabled; viewport no longer disables it)
- [ ] Alternative text for all images and icons
- [ ] Form validation with accessible error messaging

---

## Phase 7: Production Launch 🚀 *Planned*

**Goal:** Deploy the platform to production with monitoring, security hardening, and operational readiness.

**Deliverables:**
- [x] Production build optimization (Vite tree-shaking and asset compression)
- [ ] CDN configuration for static assets
- [x] Container build definition (Cloud Run-ready Dockerfile)
- [ ] CI/CD pipeline (build → lint → test → deploy)
- [ ] Error monitoring and alerting (Sentry or equivalent)
- [ ] Application performance monitoring (APM)
- [x] Health check endpoints
- [x] Security hardening (CSP headers, CORS configuration, request size/input limits)
- [ ] SSL/TLS configuration
- [ ] Logging and audit trail setup
- [ ] Disaster recovery and backup strategy
- [ ] Launch checklist and go/no-go review

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
Phase 2 ████████░░░░░░░░░░░░░░░░░ 🔧 In Progress
Phase 3 ░░░░░░░░░░░░░░░░░░░░░░░░░ 🔒 Planned
Phase 4 ░░░░░░░░░░░░░░░░░░░░░░░░░ 🧪 Planned
Phase 5 ░░░░░░░░░░░░░░░░░░░░░░░░░ 📱 Planned
Phase 6 ░░░░░░░░░░░░░░░░░░░░░░░░░ ♿ Planned
Phase 7 ░░░░░░░░░░░░░░░░░░░░░░░░░ 🚀 Planned
Phase 8 ░░░░░░░░░░░░░░░░░░░░░░░░░ 🌟 Future
```

---

*Last updated: 2026-09-09*
