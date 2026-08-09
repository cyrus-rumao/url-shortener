---
applyTo: "frontend/**/*.{ts,tsx}"
---

# Frontend Instructions

## Frontend Stack

The frontend is a React + TypeScript + Vite application using:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- React Compiler
- Zustand (global/shared state stores)
- Sonner (toast notifications)
- Lucide React (icons)
- Recharts (analytics charts)

Use the existing stack before introducing additional dependencies. Do not introduce a new UI/styling/state library without a clear reason, and never install a frontend dependency anywhere other than `frontend/package.json`.

## Folder Structure — Feature-First

```text
frontend/
  src/
    app/
      App.tsx
      main.tsx
      providers.tsx
      router.tsx
    assets/
      images/
      icons/
      fonts/
    components/
      ui/          -> generic, design-system-level primitives (Button, Input, Card, Badge, Modal)
      layout/       -> structural chrome (Header, Footer, Sidebar, PageContainer)
      common/       -> small reusable pieces used across features (EmptyState, LoadingSpinner, ErrorMessage)
      charts/        -> reusable Recharts wrapper components
    features/
      auth/
        components/
        hooks/
        pages/
        api.ts
        types.ts
        validation.ts
      url/
        components/
        hooks/
        pages/
        api.ts
        types.ts
        validation.ts
      analytics/
      dashboard/
    hooks/           -> cross-feature custom hooks
    services/
      axios.ts        -> shared Axios instance
      auth.service.ts
      storage.service.ts
    stores/            -> Zustand stores (authStore.ts, uiStore.ts, etc.)
    lib/
    utils/
    constants/
    styles/
    types/
    vite-env.d.ts
```

Rules:

- Every feature (`auth`, `url`, `analytics`, `dashboard`, or a new one) is self-contained under `src/features/<feature>/`, owning its own components, hooks, pages, API calls, types, and validation.
- `components/` at the root holds only generic, feature-agnostic UI — never anything tied to one specific feature's business logic.
- A component used by only one feature lives inside that feature's own `components/` folder. It is only promoted to a shared `components/` folder once a second feature genuinely needs it.
- `services/` holds cross-cutting client infrastructure (Axios instance, auth service, storage service) — feature-specific API calls belong in each feature's own `api.ts`, not here.
- `hooks/`, `lib/`, `utils/`, `constants/`, `types/`, `stores/` at the root are for genuinely cross-feature concerns only. A store used by only one feature lives inside that feature's own folder (e.g. `features/url/store.ts`) until a second feature needs it.
- `app/` owns bootstrapping only — app composition, providers, and routing — not business logic.

## Ask Before Creating Files or Folders

Before creating any new file or folder under `frontend/`, briefly state what you intend to create and why, and wait for confirmation.

- Example: "This needs a new component — `ShortenForm.tsx` under `features/url/components/` — since it's specific to the URL-shortening feature. Should I create it?"
- Batch multiple new files into a single question when a task needs several at once.
- Editing an existing file never requires asking first.
- Do not scaffold folders speculatively — only what the current task needs.

## Component Principles

Every screen is built by composing components — never one large file mixing markup, logic, and styling for an entire page.

Ask: **"If I needed to change or replace this piece of UI independently, is it its own component?"** If yes, extract it.

- Buttons, inputs, cards, badges, modals, and any other recurring UI pattern are components in `components/ui/`, never repeated inline.
- Anything rendered as a list gets its own item component.
- Loading, empty, and error states are their own components (`LoadingSpinner`, `EmptyState`, `ErrorMessage`), reused everywhere that state can occur.
- Page components (`features/<feature>/pages/*.tsx`) are mostly composition + data wiring — they call hooks/services and arrange components, not contain large blocks of raw JSX or business logic.
- Keep components small and single-purpose; split when a file grows large or handles unrelated concerns.
- Every component has an explicit `Props` interface. Avoid `any`.

## API Layer

Feature API calls live in that feature's `api.ts`, using the shared Axios instance from `services/axios.ts`.

Every response follows the backend's standard envelope — always branch on `success` before trusting `data`:

```ts
interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiFailure {
  success: false;
  message: string;
  errors: string[];
}
```

Authentication tokens are handled entirely via HTTP-only cookies set by the backend. Never store tokens in `localStorage`, `sessionStorage`, or React state.

## State Management — Zustand

Zustand is the standard for shared/global client state (e.g. current auth/user state, UI state like a sidebar open/closed flag). It replaces React Context for this purpose — do not introduce a new Context provider for state that a Zustand store already covers.

- A store shared across features lives in `src/stores/` (e.g. `authStore.ts`).
- A store used by only one feature lives inside that feature's folder (e.g. `features/url/store.ts`) until a second feature needs it — same promotion rule as components/hooks.
- Keep stores focused: one store per concern (`authStore`, not one giant `appStore` holding unrelated state).
- Local, component-only UI state (an open dropdown, a form's draft value) still uses `useState` — reach for Zustand only when the state needs to be read or updated from more than one place in the tree.
- Type each store's state and actions explicitly; avoid `any` in store definitions.
- Still use React Context only for things that are genuinely about the render tree (e.g. a theme or i18n provider), not as a substitute for a Zustand store.

## Notifications — Sonner

Sonner is the standard for all toast/notification UI (success confirmations, error messages, background-action feedback).

- Mount a single `<Toaster />` once, in `app/App.tsx` (or the root layout) — never render a second `Toaster` inside a feature or page.
- Trigger toasts from the call site of the action (e.g. inside a feature's `api.ts` error handler, or the hook/handler that calls it) — not by threading notification state through props.
- Use Sonner's semantic variants (`toast.success`, `toast.error`, `toast.loading` / promise-based toasts) rather than one generic `toast()` call for everything, so success/error styling stays consistent with the design tokens above.
- Don't build a custom toast/snackbar component — Sonner is the single notification mechanism for the app.

## Design System — Current Theme: Modern White & Blue

The client uses a clean, modern **white background with blue as the primary accent** — light, high-contrast, and minimal. Define these as Tailwind theme tokens rather than hardcoding hex values in components.

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#FFFFFF` | Page/app background |
| `surface-alt` | `#F5F7FA` | Secondary panels/cards, subtle section separation |
| `border-subtle` | `#E2E8F0` | Card borders, dividers |
| `primary` | `#2563EB` | Primary accent — buttons, active nav links, focus states |
| `primary-hover` | `#1D4ED8` | Hover/pressed state for primary accent |
| `primary-soft` | `#EFF6FF` | Light blue backgrounds (badges, selected states, hover fills) |
| `text-primary` | `#0F172A` | Primary body text |
| `text-secondary` | `#64748B` | Secondary/muted text |
| `error` | `#DC2626` | Errors only |
| `success` | `#16A34A` | Success states only |

Guidelines:

- Background is white/near-white; blue is the single accent color used consistently for primary actions, links, active states, and focus rings. Don't introduce extra colors for one-off elements.
- Use a standard, readable sans-serif font (e.g. Inter/system-ui) — no pixel/mono display fonts.
- Rounded corners (`rounded-md`/`rounded-lg`) and soft shadows (`shadow-sm`/`shadow-md`) are appropriate here — this is a clean modern style, not a decorative one.
- Hover/active states use `primary-hover` or `primary-soft` fills rather than color inversion.
- Focus states get a visible blue ring (`ring-primary`).
- Recharts series use `primary` as the main series color, with `text-secondary` for axis labels/gridlines — no default pastel palette.
- Reusable themed primitives (Button, Card, Input, Badge) live in `components/ui/` — this is the only place raw utility combinations for these tokens should be assembled. Feature components consume these primitives.

> This theme is expected to evolve. Keep all color/shadow/typography decisions centralized in `tailwind.config` and `components/ui/` so a future re-theme only requires updating shared tokens and primitives, not every page.

## Navbar

The navbar is a persistent layout component (`components/layout/Navbar.tsx`) rendered from `app/App.tsx` or the root layout, present on every page.

Structure:

- **Left:** logo/product name, linking to the home/dashboard route.
- **Center or left-adjacent:** primary navigation links to all important sections (e.g. Dashboard, My Links, Analytics) — only include links to routes that actually exist; don't stub out placeholder nav items.
- **Right:** authentication area (see below).

Authentication-aware right side:

- **Logged out:** show `Login` and `Sign Up` links/buttons.
- **Logged in:** replace `Login`/`Sign Up` with the current user's username (and optionally an avatar), typically opening a dropdown with actions like `Profile`, `Logout`. Never show `Login`/`Sign Up` and the username at the same time.

Implementation notes:

- Auth state (current user, logged-in/out) comes from a shared hook (e.g. `useAuth()` in `features/auth/hooks/`), not re-derived locally in the navbar — the navbar consumes it, it doesn't own it.
- Since tokens live in HTTP-only cookies (see API Layer), the client determines logged-in state via a `/me`-style endpoint whose result is loaded into the shared auth store (`stores/authStore.ts` or `features/auth`) on app load — never by reading a cookie directly in JS.
- While auth state is resolving on initial load, the navbar should show a neutral/loading state rather than flashing `Login`/`Sign Up` and then swapping to the username.
- The username display and its dropdown are themed with the primary/surface tokens above like any other UI element — no special-casing.

## Naming

- Components: `PascalCase` — `Button.tsx`, `ShortenForm.tsx`
- Hooks: `camelCase`, prefixed with `use` — `useAuth.ts`, `useShortenUrl.ts`
- Variables & functions: `camelCase`
- Types & interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Folders: `lowercase`

## TypeScript

- Use strict typing. Never use `any` — prefer `unknown` or a proper interface.
- Prefer `interface` for component props and API contracts.
- Avoid type assertions (`as`) unless there is no reasonable alternative.
- Avoid implicit `any`.

## Styling

- Tailwind CSS utility classes only. No inline `style` props, no CSS-in-JS, no ad hoc raw CSS beyond the global stylesheet.
- If a utility combination repeats across components, extract it into a shared `components/ui/` primitive instead of duplicating it.

## Code Quality

- Functions and components should do one thing; split when they grow large.
- Avoid deeply nested logic — prefer early returns and guard clauses.
- Extract shared logic into `hooks/`, `lib/`, or `utils/` rather than duplicating it.
- Comment only where intent isn't obvious from the code — a non-trivial calculation, workaround, or business rule.

## Do Not

- Store JWTs or session tokens in `localStorage`, `sessionStorage`, or React state.
- Put feature-specific components, hooks, or API calls in shared root folders before they're reused by a second feature.
- Write large inline JSX blocks instead of composing components.
- Introduce a new dependency without a clear reason.
- Hardcode colors outside the defined design tokens.
- Restructure the folder layout or rewrite unrelated frontend code.
- Create a new file or folder without asking first.
- Use React Context as a substitute for a Zustand store.
- Build a custom toast/notification component instead of using Sonner.