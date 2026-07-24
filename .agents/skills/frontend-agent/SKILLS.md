---
name: frontend-agent
description: Generate or modify frontend code for the Distributed URL Shortener client (apps/client). INVOKE IMMEDIATELY when the user mentions UI, components, pages, frontend, client, dashboard, forms, charts, styling, or anything under apps/client. ALWAYS use this BEFORE writing any React/TSX/Tailwind code for this project — it defines the feature-first structure and the mandatory 90s retro design system this app follows.
---

# Frontend Agent — Distributed URL Shortener Client

This agent generates and modifies code inside `apps/client` of the Distributed URL Shortener NX monorepo. It exists to keep the frontend architecturally consistent with `apps/server` (same project goals: correctness, maintainability, scalability, clean architecture) and visually consistent with the project's fixed **90s retro** design language.

## Goals (aligned with backend-agent)

- Same distributed-systems-aware mindset as the backend: the client is a thin, stateless consumer of the server's REST API — no business logic duplicated client-side.
- Every API call assumes the server's standard response envelope:
  ```json
  { "success": true, "message": "...", "data": {} }
  { "success": false, "message": "...", "errors": [] }
  ```
  Always branch on `success`, never assume `data` exists on failure.
- Production-ready code only. No tutorial-style placeholders unless explicitly requested.
- Every non-trivial block of code must be clearly commented — same rule as the backend.
- Never restructure the monorepo or `apps/client`'s top-level layout as a side effect of a task. Only touch what's necessary.

## Key Principles

1. **Feature-first placement** — new UI/logic goes inside `src/features/<feature>/`, never dumped into shared `components/`.
2. **Design system is not optional** — every visual surface follows the 90s retro theme defined below. Do not introduce modern flat/soft-UI patterns (gradients, blurred shadows, rounded pill buttons, soft pastels) even if they'd normally be "best practice."
3. **Tailwind CSS only** — no inline styles, no CSS-in-JS, no new styling library. Retro effects (borders, shadows, scanlines) are implemented with Tailwind utilities and a small set of shared tokens/components, not one-off inline styles.
4. **Match existing repo patterns** — before creating a new component, check `src/components/ui/` and the relevant `src/features/<feature>/components/` for an existing pattern to extend before inventing a new one.
5. **Promote only on reuse** — a component/hook/type stays inside its feature folder until a second feature genuinely needs it; only then does it move to a shared root folder.

---

## Design System — 90s Retro Theme

The entire client uses a consistent **black background with yellow, white, and blue** retro-web aesthetic — think early Windows 95 chrome, old GeoCities/terminal energy, but cleaned up enough to still be usable as a real product.

### Color Palette

Define these as Tailwind theme tokens (in `tailwind.config`) rather than hardcoding hex values in components.

| Token              | Hex       | Usage                                                                   |
| ------------------ | --------- | ----------------------------------------------------------------------- |
| `retro-bg`         | `#000000` | Page/app background. Always the base layer.                             |
| `retro-bg-alt`     | `#0A0A0A` | Secondary panels/cards, subtly lifted off pure black.                   |
| `retro-yellow`     | `#FFE600` | Primary accent — headings, primary buttons, active states, focus rings. |
| `retro-yellow-dim` | `#B8A600` | Yellow at rest/disabled/secondary emphasis.                             |
| `retro-blue`       | `#00CFFF` | Secondary accent — links, borders, info states, chart lines.            |
| `retro-blue-deep`  | `#0047AB` | Darker blue for pressed/active borders and shadow offsets.              |
| `retro-white`      | `#FFFFFF` | Primary body text, high-emphasis content.                               |
| `retro-white-dim`  | `#C9C9C9` | Secondary/muted text on black.                                          |
| `retro-error`      | `#FF4D4D` | Errors only — used sparingly, still reads as "retro warning red."       |
| `retro-success`    | `#39FF14` | Success states only (retro terminal green), used sparingly.             |

Rules:

- Background is always black or near-black (`retro-bg` / `retro-bg-alt`). Never introduce a light/white page background.
- Yellow is the dominant accent (primary actions, emphasis, headings). Blue is secondary (links, info, chart accents, structural borders). White is body text. Don't let blue and yellow fight for the same role on one screen — yellow = "primary," blue = "secondary/structural."
- No gradients. Flat color fills only.

### Typography

- Use a monospace or pixel-style font stack for headings and UI chrome (e.g. `"VT323", "Press Start 2P", ui-monospace, monospace` — pick one pixel/mono display font and one readable monospace body font, wire both into Tailwind's `fontFamily`).
- Body copy can use a plain monospace font for readability at small sizes; save the chunkier pixel display font for headings, nav, buttons, and short labels.
- Uppercase tracking-wide text for nav items, button labels, and section headers is encouraged (classic retro-web convention).

### Shapes, Borders & Shadows

- **No rounded corners.** `rounded-none` everywhere — retro UI is hard-edged.
- Borders are thick (2–4px), high contrast, and usually yellow or blue against the black background.
- Use **hard, offset drop shadows** instead of blurred ones to fake a beveled/3D retro button look, e.g. a solid yellow or blue box-shadow offset by a few pixels with zero blur radius — not `shadow-lg`/`shadow-xl` soft shadows.
- Buttons should look "pressable": rest state has an offset hard shadow; on `:active`/pressed state, remove the offset (shadow collapses to 0) so it visually depresses.

### Interaction & Motion

- Hover states invert colors where sensible (e.g. yellow-bordered button becomes filled yellow with black text on hover) rather than fading opacity.
- Focus states get a visible blue or yellow outline (`ring`), never a subtle browser default — retro UIs are loud about what's focused.
- Motion should be minimal and snappy (instant or very short transitions), not slow modern easing curves. A blinking cursor or subtle scanline overlay on key surfaces (e.g. the dashboard/analytics screens) is in theme if used sparingly — don't apply it to every element.

### Charts (Recharts)

- Chart lines/bars use the palette above: yellow and blue as the two primary series colors, white for axis labels/gridlines at low opacity, black chart background.
- No default Recharts pastel palette — always override series colors to match the theme.

### Where this lives in code

- Central design tokens (colors, font families, shadow utilities) belong in `tailwind.config` and, if needed, a small shared file under `src/styles/` — not redefined per component.
- Reusable themed primitives (Button, Card/Panel, Input, Badge) belong in `src/components/ui/` and should be the only place raw retro Tailwind utility combinations are assembled. Feature components consume these primitives instead of re-implementing the look.

---

## Steps

### 1. Identify the feature

Determine which `src/features/<feature>/` folder the request belongs to (`auth`, `url`, `analytics`, `dashboard`, or a new feature). If it's a new feature, scaffold the standard shape: `components/`, `hooks/`, `pages/`, `api.ts`, `types.ts`, `validation.ts`.

### 2. Check for existing shared primitives first

Before building new UI, look in `src/components/ui/`, `layout/`, `common/`, and `charts/` for an existing themed primitive (Button, Card, Input, ChartWrapper, etc.) to reuse. Only add a new shared primitive if the visual pattern is genuinely reused across features.

### 3. Wire the API layer

Feature API calls go in that feature's `api.ts`, using the shared Axios instance from `src/services/axios.ts`. Always type the response against the shared success/failure envelope and the feature's `types.ts`.

### 4. Build the UI following the design system

Apply the color tokens, hard-edged borders, offset shadows, and typography rules above. No ad hoc colors outside the defined palette; no rounded corners; no soft blurred shadows.

### 5. Comment non-trivial logic

Any non-obvious state management, data transformation, or retro-effect implementation (e.g. the offset-shadow "pressed button" technique) gets a short comment explaining why, not just what.

### 6. Verify

Run the workspace's lint/typecheck/test/build targets for the client project before considering the task done:

```bash
npx nx lint client
npx nx run client:typecheck
npx nx test client
npx nx build client
```

(These target names are illustrative — confirm the actual configured targets in `apps/client/project.json` / `package.json` before running, since target names can be customized per workspace.)

If verification fails with small, obvious issues, fix them. If it fails broadly, stop and report what was generated, what failed, and what's already been tried, rather than guessing further.
