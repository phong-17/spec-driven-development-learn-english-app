# Quickstart: Home Page

**Feature**: 003-home-page

Quick guide for developing and verifying the home page locally.

## 1. Run the dev server

```bash
pnpm dev
```

Open <http://localhost:3000>. You should see the new home page (not the Next.js starter).

## 2. Manual verification — viewports

Open DevTools → device toolbar and check each of these widths. Every check below maps to a Success Criterion in `spec.md`.

| Viewport (px) | What to check | Maps to |
|---|---|---|
| 320 | No horizontal scrollbar; nav stacks vertically; all text legible | SC-002, SC-005 |
| 375 | Same as 320; this is the spec's primary mobile target | SC-002 |
| 768 | Nav switches to horizontal row; sections still stack vertically | SC-002 |
| 1024 | Tablet/desktop layout; comfortable line lengths | SC-002 |
| 1440 | Desktop layout; content centered with safe max-width | SC-002 |
| 1920 | No layout break at large widths | SC-002 |

## 3. Manual verification — content order

Scroll from the top and confirm the on-page order is exactly:

1. Navigation bar (Lessons | 500 Most Common Words | 1000 Topic Vocabulary)
2. Hero section
3. Lessons section
4. 500 Most Common Words section
5. 1000 Topic Vocabulary section

Maps to: User Story 1 acceptance scenarios; SC-003.

## 4. Manual verification — navigation links

Click each nav link in turn and confirm:

- `Lessons` → URL becomes `/lessons`, placeholder page renders, no console errors.
- `500 Most Common Words` → URL becomes `/vocabulary/500`, placeholder page renders.
- `1000 Topic Vocabulary` → URL becomes `/vocabulary/1000`, placeholder page renders.
- Browser back returns you to `/` without re-fetch flicker (soft navigation).

Maps to: FR-002a, SC-004.

## 5. Manual verification — design tokens

- Open the page in a browser with `prefers-color-scheme: dark` (default macOS / Windows dark mode) → background should be `#111111`, text `#FFFFFF`.
- Switch system to light mode → background `#FFFFFF`, text `#111111`.
- Inspect any nav link or accent text → computed `color` is `#47B7F8`.
- Confirm all text uses a monospace font (no fallback to system sans-serif).
- Confirm there are no `box-shadow`, `linear-gradient`, or `backdrop-filter` rules on any home-page element.

Maps to: FR-008, FR-011.

## 6. Lint and build

```bash
pnpm lint
pnpm build
```

Both must complete without errors. (The build also catches TypeScript issues.)

## 7. Done criteria

- [ ] All 6 viewport widths pass section-3 visual check.
- [ ] All 3 nav links resolve to their dedicated placeholder routes.
- [ ] Dark and light modes both render correctly.
- [ ] `pnpm lint` clean.
- [ ] `pnpm build` clean.
