# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # start dev server (Turbopack, outputs to .next/dev)
pnpm build      # production build (Turbopack by default)
pnpm start      # run production server
pnpm lint       # run ESLint directly (next lint is removed in v16)
```

## Stack

- **Next.js 16** (App Router) · **React 19.2** · **TypeScript 5** · **Tailwind CSS v4**
- Package manager: **pnpm**
- Path alias: `@/*` → `./src/*`

## Project structure

```
src/
  app/                  # Next.js routes only — no business logic here
    layout.tsx          # root layout, sets <html lang="en">
    page.tsx            # home route (/)
    globals.css         # Tailwind v4 entry (@import "tailwindcss")
  features/             # domain modules — each folder owns its own UI + logic
    vocabulary/         # e.g. word lists, flashcards
    grammar/            # e.g. grammar exercises
  components/           # shared UI components reused across features (Button, Modal…)
  hooks/                # shared custom React hooks
  utils/                # pure helper functions (const, format, route-path)
  types/                # shared TypeScript types and interfaces
```

**Rules:**
- Route files in `app/` import from `features/` or `components/`, never contain domain logic directly.
- A `features/<name>/` module may have its own sub-`components/` and `hooks/` folders for things not shared elsewhere.
- `components/` contains only presentational, reusable UI — no data fetching, no business logic.

## Next.js 16 breaking changes

**Before writing any routing, data-fetching, or image code, read `node_modules/next/dist/docs/` for the relevant feature.**

Key breaks from prior Next.js versions:

- **Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, route `params`, and page `searchParams` are **all async** and must be awaited. Synchronous access is fully removed.
- **`middleware` → `proxy`** — rename `middleware.ts` → `proxy.ts`; export `proxy` not `middleware`; `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`. Edge runtime is not supported in `proxy`.
- **`next lint` removed** — linting uses `eslint` CLI directly. `next build` no longer runs the linter.
- **Turbopack is default** for both `next dev` and `next build`. Use `--webpack` to opt out. `experimental.turbopack` is now top-level `turbopack`.
- **`revalidateTag` requires a second `cacheLife` argument** — e.g. `revalidateTag('posts', 'max')`. Use `updateTag` for read-your-writes semantics in Server Actions.
- **`cacheLife` / `cacheTag`** are stable — drop the `unstable_` prefix.
- **PPR** — `experimental.ppr` removed; use `cacheComponents: true` in `next.config`.
- **Parallel routes** — all slots require explicit `default.js`; builds fail without them.
- **`serverRuntimeConfig` / `publicRuntimeConfig` removed** — use `process.env` / `NEXT_PUBLIC_` env vars instead.
- **`next/legacy/image` deprecated** — use `next/image`.
- **`images.domains` deprecated** — use `images.remotePatterns`.
- **Local images with query strings** require `images.localPatterns.search` config.
- **`devIndicators`** options `appIsrStatus`, `buildActivity`, `buildActivityPosition` removed.

## Design style

This project follows an **ASCII / Terminal-inspired Web Design** aesthetic.

- **Typography**: monospace fonts only (`font-mono`). The root font is already set to monospace in `globals.css`.
- **Color palette**: two modes, both defined as CSS custom properties in `globals.css`:
  - **Dark mode** (default): background `#111111`, text `#FFFFFF`
  - **Light mode**: background `#FFFFFF`, text `#111111`
  - **Accent** (`#47B7F8`): used for links, highlighted/readable text, and interactive elements — apply via the `--color-accent` token in both modes.
- **UI elements**: sharp corners (no rounded corners unless intentional), thin 1px borders, box-drawing characters (`─ │ ┌ ┐ └ ┘ ├ ┤`) for dividers and frames, ASCII art for decorative elements.
- **Motion**: animations should feel like terminal output — typewriter effects, blinking cursors, scan-line reveals, character-by-character rendering. Use `motion` for these.
- **No gradients, no drop shadows, no glassmorphism** — flat and text-forward.
- **Spacing**: dense, information-rich layouts preferred over generous whitespace.

## Animation

This project uses **[Motion](https://motion.dev)** (`motion` v12) for all UI animations — do not reach for CSS transitions or other animation libraries.

- Import from `motion/react`: `import { motion, AnimatePresence } from "motion/react"`
- Wrap interactive/transitioning elements in `<motion.*>` (e.g. `<motion.div>`)
- Use `AnimatePresence` for enter/exit animations (modals, toasts, list items)
- Prefer `layout` prop for automatic layout animations instead of manually animating position/size
- Keep animation variants co-located in the same file as the component unless shared across multiple components

## Tailwind v4 notes

`globals.css` uses `@import "tailwindcss"` and `@theme inline { … }` blocks — not the v3 `@tailwind` directives. Theme tokens are CSS custom properties under `--color-*`, `--font-*`, etc.
