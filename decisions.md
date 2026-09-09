# Architectural Decisions

> This document records the key architectural and design decisions made for the **Low & Best Medicine Generics** platform. Each entry captures context, rationale, and consequences so future contributors understand *why* the codebase is shaped the way it is.

---

## ADR-001: React + Vite + TypeScript as the Core Stack

**Date:** 2026-09-08  
**Status:** Accepted

### Context
We needed a performant, developer-friendly frontend stack capable of handling a data-rich medical comparison interface with multiple interactive modals, real-time filtering, and animation.

### Decision
- **React 19** for component-based UI architecture.
- **Vite 6** for fast HMR and optimized builds.
- **TypeScript** for type safety across drug profiles, pharmacy data, and regimen models.

### Consequences
- Strong type safety across all data interfaces (`DrugProfile`, `Pharmacy`, `GenericAlternative`, etc.).
- Fast iteration cycles with Vite's HMR (with toggle support via `DISABLE_HMR` for AI Studio).
- Team must maintain type definitions in `src/types.ts` as data models evolve.

---

## ADR-002: TailwindCSS v4 for Styling

**Date:** 2026-09-08  
**Status:** Accepted

### Context
The application requires a consistent, responsive design system with rapid prototyping capabilities for a mobile-first medical UI.

### Decision
Use TailwindCSS v4 with the `@tailwindcss/vite` plugin for zero-config integration.

### Consequences
- Utility-first approach enables rapid UI iteration.
- Custom design tokens (e.g., `bg-surface`, `text-on-surface`, `text-secondary`) establish a cohesive color palette.
- Minimal custom CSS required — most styling lives inline within components.

---

## ADR-003: Client-Side Tab Navigation (No Router)

**Date:** 2026-09-08  
**Status:** Accepted

### Context
The app has four primary views: Search, Compare, Pharmacies, and Saved Rx. We considered React Router vs. a simple state-driven tab system.

### Decision
Use a `useState<NavTab>` in `App.tsx` to drive screen visibility via conditional rendering, rather than introducing a routing library.

### Consequences
- Simpler mental model; no URL-based routing to manage.
- Cross-screen navigation (e.g., notification → tab switch) is handled via callback props.
- Trade-off: no deep-linking or browser back-button support. Acceptable for a mobile-first SPA with bottom-tab UX.

---

## ADR-004: Modal-Centric Interaction Pattern

**Date:** 2026-09-08  
**Status:** Accepted

### Context
Key workflows — barcode scanning, voucher generation, price-lock holds, pill visualization, savings history — are secondary actions that shouldn't displace the user's current screen context.

### Decision
Implement these as overlay modals (`BarcodeScannerModal`, `VoucherModal`, `HoldLockModal`, `PillVisualizerModal`, `SavingsHistoryModal`, `LocationModal`, `NotificationsDrawer`) managed by boolean state flags in `App.tsx`.

### Consequences
- Users stay on their current tab while performing auxiliary actions.
- All modal open/close state is centralized in `App.tsx`, making it easy to coordinate (e.g., scan → match → navigate to Compare).
- As the number of modals grows, consider extracting a modal manager or context provider.

---

## ADR-005: Mock Data Layer for Development

**Date:** 2026-09-08  
**Status:** Accepted (Temporary)

### Context
Real pharmacy pricing APIs, stock verification endpoints, and drug databases are not yet integrated.

### Decision
Use a centralized mock data file (`src/data/mockData.ts`) exporting `MOCK_DRUGS`, `MOCK_PHARMACIES`, `MOCK_REGIMENS`, and `MOCK_LEDGER` to power all screens.

### Consequences
- Enables full UI development and demo without backend dependencies.
- Data contracts are well-defined via TypeScript interfaces, easing future API integration.
- Must be replaced with real API calls before production launch.

---

## ADR-006: Gemini AI Integration via Server-Side API

**Date:** 2026-09-08  
**Status:** Planned

### Context
The platform's `metadata.json` declares `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, indicating intent to use Google Gemini AI for intelligent drug discovery, natural-language search, or recommendation features.

### Decision
Use the `@google/genai` SDK with a server-side proxy (Express) to keep the `GEMINI_API_KEY` secure. The API key is injected at runtime via environment variables.

### Consequences
- AI features will run through a backend Express server, not directly from the browser.
- Requires `GEMINI_API_KEY` configuration via `.env` or AI Studio secrets panel.
- Enables future capabilities like conversational drug lookup, smart alternative ranking, and personalized savings suggestions.

---

## ADR-007: Motion Library for Animations

**Date:** 2026-09-08  
**Status:** Accepted

### Context
The UI requires smooth transitions for modals, toasts, screen switches, and interactive elements to deliver a premium mobile-app feel.

### Decision
Use the `motion` library (Framer Motion successor) for declarative animations.

### Consequences
- Consistent animation patterns across all modals and UI transitions.
- Adds ~30KB to the bundle (acceptable for the UX improvement).
- Animation logic is co-located with component markup, keeping it maintainable.

---

## Template for New Decisions

```markdown
## ADR-XXX: [Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded

### Context
[What is the issue or requirement?]

### Decision
[What was decided and why?]

### Consequences
[What are the trade-offs, risks, and follow-up actions?]
```
