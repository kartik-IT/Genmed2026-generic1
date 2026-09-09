# Changelog

All notable changes to the **Low & Best Medicine Generics** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- Express API server with environment configuration, health endpoint, CORS controls, request limits, and cached API responses.
- Typed API client with timeout, retry, error-boundary, and stale-while-revalidate support.
- Server-side Gemini proxy for natural-language drug matching, generic comparison summaries, and savings recommendations, with safe local fallbacks.
- Live FDA NDC Directory lookup endpoint with source metadata and non-clinical-use disclaimer.
- Installable PWA manifest, offline app-shell service worker, and reduced-motion/focus-visible accessibility defaults.
- Container build definition and production launch checklist.
- Server-side adapter contracts for pharmacy-stock and pricing providers, including source and freshness metadata plus labeled development fallbacks.
- Generic OIDC authentication foundation with PKCE, state/nonce checks, ID-token signature validation, and httpOnly server sessions.

### Fixed
- Corrected server data-module resolution, Gemini SDK response handling, the regimen ledger route order, and pharmacy model contract mismatches.

### Planned
- Real pharmacy pricing API integration
- Gemini AI-powered intelligent drug search and recommendations
- Express backend server for secure API proxying
- User authentication and persistent sessions
- PWA offline support
- Accessibility (a11y) audit and WCAG 2.1 compliance
- Unit and integration test suite

---

## [0.1.0] — 2026-09-08

### Added

#### Core Application
- **React 19 + Vite 6 + TypeScript** project scaffolding with TailwindCSS v4
- Central `App.tsx` orchestrator with tab-based navigation and modal management
- Shared type definitions in `src/types.ts` for all data models
- Design token system (`bg-surface`, `text-on-surface`, `text-secondary`, etc.)

#### Screens
- **Search Screen** — Drug search with profile overview, instant net savings, top pharmacy preview, barcode scanner integration, and quick-action buttons
- **Compare Screen** — Bioequivalent generic alternatives comparison with detailed pharmacokinetics (AUC, bioavailability), pricing breakdowns, and manufacturer data
- **Pharmacies Screen** — Nearby pharmacy listing with real-time stock status, cash pricing, bio-match percentage, ratings, drive-thru availability, and distance sorting
- **Saved Rx Screen** — Tracked regimen dashboard with refill countdown, price-drop alerts, immutable fill ledger, and savings history

#### Modals & Overlays
- **Barcode Scanner Modal** — Camera-based drug barcode scanning with automatic profile matching and tab navigation
- **Voucher Modal** — Digital savings pass generation with pharmacy name, locked rate, and drug info
- **Hold & Lock Modal** — 4-hour price-lock reservation system with PIN-based confirmation
- **Pill Visualizer Modal** — Visual pill identification for drug verification
- **Rx Transfer Modal** — Prescription transfer workflow between pharmacies
- **Location Modal** — Geolocation-based pharmacy radius adjustment
- **Notifications Drawer** — Price alert, refill reminder, and stock notification center with action-based navigation
- **Savings History Modal** — Per-regimen historical savings tracking

#### UI Components
- **Header** — Persistent top bar with location display and notification access
- **Bottom Navigation** — 4-tab navigation (Search, Compare, Pharmacies, Saved Rx) with active state and badge count
- **Toast System** — Dynamic success/info/warning notifications with auto-dismiss and max-3 queue management

#### Data Layer
- Comprehensive mock data (`mockData.ts`) covering drugs, pharmacies, regimens, and fill ledger entries
- TypeScript interfaces: `DrugProfile`, `Pharmacy`, `GenericAlternative`, `TrackedRegimen`, `FillLedgerItem`

#### Configuration
- Vite config with TailwindCSS plugin, path aliasing, and HMR toggle for AI Studio
- Environment variable setup (`.env.example`) for `GEMINI_API_KEY` and `APP_URL`
- `metadata.json` with camera permission declaration and Gemini API capability flag

#### Dependencies
- `@google/genai` ^2.4.0 — Gemini AI SDK
- `motion` ^12.23.24 — Animation library (Framer Motion successor)
- `lucide-react` ^0.546.0 — Icon set
- `express` ^4.21.2 — Backend server (planned)
- `dotenv` ^17.2.3 — Environment variable loading

---

## Template for New Entries

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in future versions

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security-related changes
```
