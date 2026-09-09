# Project Rules & Conventions

> Coding standards, architectural guidelines, and workflow rules for the **Low & Best Medicine Generics** platform. All contributors must follow these rules to maintain consistency and quality.

---

## 1. Code Organization

### File Structure
- **Components** live in `src/components/` — one component per file, named in PascalCase (e.g., `SearchScreen.tsx`).
- **Types/Interfaces** are centralized in `src/types.ts`. Do not define shared types inline within components.
- **Mock data** lives in `src/data/mockData.ts`. Keep all test/demo data in this single file.
- **Styles** use TailwindCSS utility classes inline. Global/base styles go in `src/index.css`.

### Naming Conventions
| Element           | Convention          | Example                        |
|-------------------|---------------------|--------------------------------|
| Components        | PascalCase          | `PharmaciesScreen.tsx`         |
| Interfaces/Types  | PascalCase          | `DrugProfile`, `NavTab`        |
| State variables   | camelCase           | `isVoucherOpen`, `activeDrug`  |
| Event handlers    | `handle` + Action   | `handleScanSuccess`            |
| Callback props    | `on` + Action       | `onOpenVoucher`, `onShowToast` |
| CSS tokens        | kebab-case          | `bg-surface`, `text-on-surface`|
| Files (non-component) | camelCase       | `mockData.ts`, `vite.config.ts`|

---

## 2. TypeScript Rules

- **Strict mode** is enabled. No `any` types without explicit justification.
- All data models (`DrugProfile`, `Pharmacy`, `GenericAlternative`, `TrackedRegimen`, `FillLedgerItem`) must be defined in `src/types.ts`.
- Use `interface` for object shapes and `type` for unions/aliases (e.g., `type NavTab = 'search' | 'compare' | ...`).
- Optional fields use `?` syntax — never `| undefined` in interface definitions.
- Export all shared types from `src/types.ts`.

---

## 3. Component Architecture

### Screen Components
- Each tab has a dedicated screen component: `SearchScreen`, `CompareScreen`, `PharmaciesScreen`, `SavedRxScreen`.
- Screens receive data and callbacks as props from `App.tsx` — they do not directly import mock data or manage global state.

### Modal Components
- Modals are controlled components: they accept `isOpen` and `onClose` props.
- Modal open/close state is managed centrally in `App.tsx`.
- Modals must handle their own internal state (form inputs, loading states, etc.).

### Shared Components
- `Header`, `BottomNav`, and `Toast` are persistent UI elements rendered at the `App.tsx` level.
- Toast notifications use the `showToast(message, type, icon)` pattern.

---

## 4. State Management

- **Global state** lives in `App.tsx` via `useState` hooks. No external state library (Redux, Zustand, etc.) at this time.
- **Cross-screen communication** is handled via callback props passed from `App.tsx` to screens.
- **Modal coordination** (e.g., scan → match → navigate) flows through `App.tsx` handlers.
- If state complexity grows significantly, migrate to React Context or a lightweight state manager.

---

## 5. Styling Rules

- Use **TailwindCSS v4** utility classes for all styling.
- Follow the project's design token system:
  - `bg-surface` / `bg-surface-alt` for backgrounds
  - `text-on-surface` for primary text
  - `text-secondary` for muted/secondary text
  - `selection:bg-secondary/20` for text selection highlight
- Do **not** use inline `style={{}}` attributes unless absolutely necessary for dynamic values.
- Mobile-first responsive design: base styles target mobile, use `md:` / `lg:` breakpoints for larger screens.
- Font: use the project's `font-sans` class (do not override with arbitrary font families).

---

## 6. Animation Guidelines

- Use the `motion` library for all animations (modals, transitions, micro-interactions).
- Keep animations subtle and purposeful — avoid distracting motion.
- Standard durations: `150ms` for micro-interactions, `300ms` for modals, `500ms` for page transitions.
- Always respect `prefers-reduced-motion` media query.

---

## 7. Data & API Patterns

- Currently using mock data from `src/data/mockData.ts`.
- When integrating real APIs:
  - Keep the API key (`GEMINI_API_KEY`) server-side only — never expose in client code.
  - Use the Express backend for all authenticated API calls.
  - Data fetching should use `async/await` with proper error handling and loading states.
- All prices are in USD and stored as `number` (not strings).
- Distances are stored in miles as `number` (`distanceMiles`) with a formatted `string` version (`distance`).

---

## 8. Git & Workflow

- **Branch naming**: `feature/`, `fix/`, `refactor/`, `docs/` prefixes.
- **Commit messages**: Use conventional commits — `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Do **not** commit `.env` files (only `.env.example`).
- Do **not** commit `node_modules/` or `dist/`.
- Run `npm run lint` (TypeScript check) before pushing.

---

## 9. Security & Privacy

- **No PHI (Protected Health Information)** in mock data or client-side code.
- API keys must stay server-side (Express proxy pattern).
- Camera permissions (`requestFramePermissions: ["camera"]`) are used only for barcode scanning and require user consent.
- Do not log sensitive data (API keys, user health information) to the console.

---

## 10. Performance

- Limit the toast queue to 3 items max (already enforced via `prev.slice(-2)` logic).
- Avoid unnecessary re-renders: memoize expensive computations and stabilize callback references where needed.
- Lazy-load heavy modals (`PillVisualizerModal`, `RxTransferModal`) if bundle size becomes a concern.
- Keep the main bundle under 500KB gzipped.
