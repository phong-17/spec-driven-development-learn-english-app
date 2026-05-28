# Phase 0 Research: Home Page

**Feature**: 003-home-page
**Date**: 2026-05-28

The spec contains no `NEEDS CLARIFICATION` markers after the `/speckit-clarify` pass. This research file consolidates technology choices and confirms how the new home page integrates with the existing Next.js 16 / Tailwind v4 / Motion v12 stack.

## R-001: Next.js 16 routing model for the home page

- **Decision**: Implement `/` as a Server Component in `src/app/page.tsx`, replacing the default starter content. Use `next/link` for navigation links to `/lessons`, `/vocabulary/500`, `/vocabulary/1000`.
- **Rationale**: All section copy is static — no client-side interactivity is required, so a Server Component yields the smallest bundle and fastest first paint. `next/link` provides client-side soft navigation when the target route exists.
- **Alternatives considered**:
  - Client Component (`"use client"`): rejected — no state, hooks, or event handlers are needed.
  - Plain `<a>` tags: rejected — loses Next.js prefetch / soft-nav benefits.

## R-002: Placeholder destination pages

- **Decision**: Create three minimal Server Component placeholder pages: `app/lessons/page.tsx`, `app/vocabulary/500/page.tsx`, `app/vocabulary/1000/page.tsx`. Each renders a single ASCII-style heading and a one-line "Coming soon" message.
- **Rationale**: The spec assumes nav links resolve. Without target routes, `next/link` would 404. Minimal placeholders keep the navigation contract satisfied and unblock acceptance test SC-004.
- **Alternatives considered**:
  - Omit placeholders (404 on click): rejected — fails FR-002a and SC-004.
  - Single placeholder route reused via search params: rejected — adds runtime branching for zero gain.

## R-003: Responsive layout strategy

- **Decision**: Use Tailwind v4 utility classes with mobile-first breakpoints: base styles for `≥ 320px`, `sm:` (640) and `md:` (768) for nav and section width adjustments. Navigation: vertical stack on mobile, horizontal row from `md:` up. All section content uses `max-w-screen-md` plus `px-4 md:px-8` for safe padding.
- **Rationale**: Tailwind's mobile-first model directly maps to SC-005 (no horizontal scroll at ≥ 320px) and the spec's three viewport buckets. No custom media queries needed.
- **Alternatives considered**:
  - Container queries (`@container`): rejected — adds complexity with no benefit for this simple stacked layout.
  - Manual CSS media queries: rejected — inconsistent with the rest of the project.

## R-004: ASCII / terminal aesthetic implementation

- **Decision**: 
  - Use existing `--font-mono` (already set as `--font-sans` too in `globals.css`) — no font import needed.
  - Section dividers use Unicode box-drawing characters (`─ │ ┌ ┐ └ ┘`) rendered as text, not CSS borders, for the hero/banner only.
  - Use `border` (1px solid) with `border-foreground/20` for section frames.
  - Accent color via `text-accent` / `border-accent` (token already mapped to `#47B7F8`).
  - Sharp corners (Tailwind default `rounded-none`).
  - No `shadow-*`, no `bg-gradient-*`, no `backdrop-blur-*`.
- **Rationale**: Matches the reference theme image (terminal dashboard) and the project's documented design system. All tokens already exist in `globals.css` — no theme changes required.
- **Alternatives considered**:
  - Add ANSI-color CSS variables: deferred — current accent + foreground/background is sufficient for this page.
  - Render `follow-theme.jpeg` as a background image: rejected — spec explicitly says the image is a design guide, not a rendered asset.

## R-005: Motion / animation scope

- **Decision**: Defer animation to a follow-up task. The page ships static for this feature; if needed later, add a typewriter effect to the hero heading via `motion/react`.
- **Rationale**: The spec lists no acceptance criteria that require animation. Adding it now risks scope creep and the hero already conveys the terminal aesthetic via typography and box-drawing characters.
- **Alternatives considered**:
  - Blinking cursor on hero: lightweight and on-brand — kept as optional polish, not in this scope.

## R-006: Route constants

- **Decision**: Add three constants to `src/utils/route-path.ts`: `ROUTE_LESSONS = "/lessons"`, `ROUTE_VOCAB_500 = "/vocabulary/500"`, `ROUTE_VOCAB_1000 = "/vocabulary/1000"`.
- **Rationale**: The existing `utils/route-path.ts` is the project's centralized location for routes (confirmed in `CLAUDE.md` structure). Centralizing avoids string literals scattered across components.
- **Alternatives considered**:
  - Inline string literals in `NavigationMenu.tsx`: rejected — already a project convention to use `route-path.ts`.

## R-007: Reference image handling

- **Decision**: Do not render `/public/images/follow-theme.jpeg` in the page output. Document its role as a design reference only in the component file header comment.
- **Rationale**: The spec assumption is explicit: "used as a design guide for visual tone; it is not necessarily rendered as a full-page background." Edge case in spec covers the case where the image fails to load — easiest path to honor that is to not depend on it.
- **Alternatives considered**:
  - Render as decorative background with `opacity-10`: rejected — adds a network request and conflicts with the flat / text-forward design rule.

## Open questions

None. All decisions are concrete; implementation can proceed to Phase 1.
