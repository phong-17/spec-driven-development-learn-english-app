# Phase 1 Component Contracts: Home Page

**Feature**: 003-home-page
**Date**: 2026-05-28

The home page is a UI feature with no external API. The contracts here describe the **props interfaces** of the new React components — these are the boundaries other code (or tests) interacts with. All components are presentational; none perform data fetching or hold state.

## C-001: `NavigationMenu`

**Path**: `src/features/home/components/NavigationMenu.tsx`

**Type**: Server Component (no client-side interactivity beyond `next/link`).

**Props**:

```ts
type NavigationMenuProps = {
  links: ReadonlyArray<{ label: string; href: string }>;
};
```

**Contract**:

- Renders a `<nav>` element containing one `<Link>` (from `next/link`) per `links[i]`.
- Order of rendered items MUST match `links[]` order.
- On viewports `< md` (768 px), links stack vertically; on `≥ md`, links render in a single horizontal row separated by a `│` box-drawing character or equivalent 1px divider.
- Accessibility: the `<nav>` has `aria-label="Primary"`. Each link is a focusable element.

**Maps to**: FR-002, FR-002a, FR-003, FR-010.

---

## C-002: `HeroSection`

**Path**: `src/features/home/components/HeroSection.tsx`

**Type**: Server Component.

**Props**:

```ts
type HeroSectionProps = {
  eyebrow: string;
  title: string;
  tagline: string;
};
```

**Contract**:

- Renders the first visible block beneath the navigation bar.
- Composition: `eyebrow` rendered in accent color above `title`; `title` rendered in the largest type scale used on the page; `tagline` rendered below `title` in body type.
- A decorative box-drawing frame (or banner) surrounds the title — implemented as inline characters, not CSS borders.
- No images are rendered.

**Maps to**: FR-004, FR-008, FR-011.

---

## C-003: `ContentSection`

**Path**: `src/features/home/components/ContentSection.tsx`

**Type**: Server Component.

**Props**:

```ts
type ContentSectionProps = {
  id: string;
  title: string;
  description: string;
};
```

**Contract**:

- Renders a `<section id={id}>` with a heading (`<h2>` containing `title`) and a paragraph (`<p>` containing `description`).
- Section is wrapped in a 1px solid border (via `border border-foreground/20`) with sharp corners and monospace inner padding.
- Renders NO buttons, NO links, NO images, NO icons — the section is purely informational per the clarified scope (FR-005/006/007).
- `id` is used as the DOM id (not a navigation anchor target in this feature, but reserved for future deep-linking).

**Maps to**: FR-005, FR-006, FR-007, FR-008, FR-012.

---

## C-004: `app/page.tsx` (Home route)

**Path**: `src/app/page.tsx`

**Type**: Server Component, default export.

**Behavior contract**:

- Imports `HOME_NAV_LINKS`, `HOME_HERO`, `HOME_SECTIONS` from `src/features/home/content.ts`.
- Renders, in order:
  1. `<NavigationMenu links={HOME_NAV_LINKS} />`
  2. `<HeroSection {...HOME_HERO} />`
  3. `<ContentSection {...HOME_SECTIONS[0]} />` — Lessons
  4. `<ContentSection {...HOME_SECTIONS[1]} />` — 500 words
  5. `<ContentSection {...HOME_SECTIONS[2]} />` — 1000 words
- Top-level wrapper uses `flex flex-col` with mobile-first responsive padding; no horizontal overflow at any viewport ≥ 320 px.

**Maps to**: FR-001, FR-009, all section FRs by composition.

---

## C-005: Placeholder route pages

**Paths**:
- `src/app/lessons/page.tsx`
- `src/app/vocabulary/500/page.tsx`
- `src/app/vocabulary/1000/page.tsx`

**Type**: Server Components, default exports.

**Contract**:

- Each renders a single section with the same ASCII/terminal styling rules.
- Each displays the matching nav label as an `<h1>` and a single line of body text (e.g., `Coming soon.`).
- No props; no state; no data fetching.

**Maps to**: FR-002a (navigation targets resolve without 404), SC-004.

---

## Module exports (`src/features/home/content.ts`)

```ts
export const HOME_NAV_LINKS: ReadonlyArray<{ label: string; href: string }>;
export const HOME_HERO: { eyebrow: string; title: string; tagline: string };
export const HOME_SECTIONS: ReadonlyArray<{ id: string; title: string; description: string }>;
```

Length / order guarantees match the tables in `data-model.md`.

---

## Route-path constants (`src/utils/route-path.ts`)

Add three named string constants:

```ts
export const ROUTE_LESSONS = "/lessons" as const;
export const ROUTE_VOCAB_500 = "/vocabulary/500" as const;
export const ROUTE_VOCAB_1000 = "/vocabulary/1000" as const;
```

These are imported by `content.ts` to populate `HOME_NAV_LINKS[i].href`. No literal route strings appear in components.
