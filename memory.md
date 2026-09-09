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
| **Dev Server Port** | 3000                                                               |

---

## Current State (as of 2026-09-08)

### What's Built ✅
- **Search Screen** — Drug search with profile cards, instant savings display, top-pharmacy preview, and quick actions (voucher, hold-lock, pill visualizer).
- **Compare Screen** — Side-by-side bioequivalent generic comparison with detailed pharmacokinetics data (AUC, bioavailability, excipients).
- **Pharmacies Screen** — Nearby pharmacy listing with stock status, pricing, ratings, bio-match percentage, and drive-thru availability.
- **Saved Rx Screen** — Tracked regimen management with refill tracking, price-drop alerts, and blockchain-style fill ledger.
- **Barcode Scanner Modal** — Camera-based drug barcode scanning with automatic profile matching.
- **Voucher Modal** — Digital savings pass generation for pharmacy checkout.
- **Hold & Lock Modal** — 4-hour price-lock reservation with PIN confirmation.
- **Pill Visualizer Modal** — Visual pill identification tool.
- **Rx Transfer Modal** — Prescription transfer workflow.
- **Location Modal** — Geolocation-based pharmacy search radius adjustment.
- **Notifications Drawer** — Price alerts, refill reminders, and stock notifications.
- **Savings History Modal** — Historical savings tracking per regimen.
- **Toast System** — Dynamic success/info/warning notifications (max 3 concurrent).

### What's Pending ⏳
- [ ] Real API integration (replacing `mockData.ts`)
- [ ] Gemini AI-powered drug search and recommendations
- [ ] Express backend server implementation
- [ ] User authentication and session management
- [ ] Real pharmacy stock verification API
- [ ] Real-time pricing data feeds
- [ ] Persistent user data (saved prescriptions, preferences)
- [ ] PWA configuration for offline-capable mobile experience
- [ ] Accessibility audit and ARIA improvements
- [ ] Unit and integration test coverage

---

## Key Technical Notes

### App Architecture
- `App.tsx` is the central orchestrator — all global state (active tab, selected drug, selected pharmacy, modal visibility) lives here.
- Screens are "dumb" — they receive data and emit events via callback props.
- Navigation is state-driven (no React Router), using `NavTab` union type: `'search' | 'compare' | 'pharmacies' | 'saved-rx'`.

### Data Flow
```
mockData.ts → App.tsx (state) → Screen Components (props) → Modal Components (props)
                  ↑                        |
                  └────── callbacks ────────┘
```

### Important Interfaces
- `DrugProfile` — Core drug entity with nested `alternatives: GenericAlternative[]` and `pharmacies: Pharmacy[]`.
- `Pharmacy` — Includes pricing, stock, geo-coordinates, bio-match %, and verification timestamps.
- `GenericAlternative` — Bioequivalence data including AUC, manufacturer, rating code, and savings calculations.
- `TrackedRegimen` — User's saved prescription with refill tracking and price alerts.
- `FillLedgerItem` — Immutable fill record with hash (blockchain-style integrity).

### Environment Variables
- `GEMINI_API_KEY` — Required for AI features, injected by AI Studio at runtime.
- `APP_URL` — Self-referential URL for callbacks and API endpoints.
- `DISABLE_HMR` — Set to `"true"` in AI Studio to prevent flickering during agent edits.

---

## Known Issues & Gotchas

1. **Toast queue slicing** — `prev.slice(-2)` in `showToast` limits to 3 toasts but may drop important messages under rapid-fire scenarios. Consider a priority queue if this becomes an issue.
2. **No deep linking** — Tab-based navigation without React Router means users can't bookmark or share specific views.
3. **Mock data coupling** — Components reference specific mock data IDs/names for pharmacy matching (e.g., `p.name.includes(regimen.pharmacyName)`). This string-matching pattern is fragile and must be replaced with proper ID-based lookups.
4. **HMR toggle** — The `DISABLE_HMR` / file-watching toggle in `vite.config.ts` is AI Studio-specific. Don't modify this without understanding the deployment context.
5. **Camera permission** — `requestFramePermissions: ["camera"]` in `metadata.json` is an AI Studio-specific declaration, not a standard web API permission request.

---

## Lessons Learned

- **TailwindCSS v4 + Vite plugin** — Zero-config setup via `@tailwindcss/vite` works seamlessly. No need for `postcss.config.js` or `tailwind.config.js`.
- **Motion library** — The successor to Framer Motion integrates well with React 19's rendering model.
- **Centralized modal state** — Works cleanly up to ~7 modals. Beyond that, consider a modal manager pattern or React Context.
- **TypeScript strict mode** — Catching type mismatches early prevented several bugs in the pharmacy/drug matching logic.

---

## Frequently Referenced Paths

| Purpose            | Path                              |
|---------------------|-----------------------------------|
| App entry point     | `src/App.tsx`                     |
| Type definitions    | `src/types.ts`                    |
| Mock data           | `src/data/mockData.ts`            |
| Component directory | `src/components/`                 |
| Global styles       | `src/index.css`                   |
| Vite config         | `vite.config.ts`                  |
| Environment example | `.env.example`                    |
| Package manifest    | `package.json`                    |

---

*Last updated: 2026-09-08*
