# CLAUDE.md

@AGENTS.md

## Project

Personal English learning app — no auth, no multi-user.

**Data** (PDFs in project root → extracted to JSON, no database):

- `500 Từ phổ biến nhất trong Tiếng Anh_Mingology.pdf` — 500 common words
- `1000 từ vựng tiếng Anh theo chủ đề.pdf` — 1000 topic words
- `Sach_Tieng_Anh_Ms_Huong_Thiet_Ke.pdf` — 16 lessons by Ms. Huong

**32 sessions**: Ms. Huong 16 lessons → ½ lesson/session; 2 vocab PDFs → words split evenly.

**Scope now**: content structuring only. No flashcards, quizzes, or exercises yet.

## Commands

```bash
pnpm dev    # dev server (Turbopack)
pnpm build  # production build
pnpm start  # run production
pnpm lint   # ESLint (next lint removed in v16)
```

## Stack

Next.js 16 · React 19.2 · TypeScript 5 · Tailwind CSS v4 · pnpm · `@/*` → `./src/*`
PDF parsing: `pdfjs-dist` · Script runner: `tsx`

## Structure

```
scripts/       # PDF parse scripts — run with: pnpm tsx scripts/<name>.ts
specs/         # speckit feature specs (001-*, 002-*, ...)
src/
  app/         # routes only — no domain logic
  data/
    vocabulary/  # JSON output: 500-common-words.json, 1000-topic-words.json
  features/    # domain modules (own components/, hooks/ allowed)
  components/  # shared presentational UI only — no data fetching
  hooks/       # shared hooks
  lib/         # shared libraries / clients
  providers/   # React context providers
  utils/       # pure helpers
  types/       # shared TS types
```

**Existing types** (use, do not redefine):

- `VocabularyEntry` — `src/types/vocabulary.ts` (fields: id, frequency, word, meaning, partOfSpeech, viPartOfSpeech, phonetic, example, viExample, session)
- `TopicVocabEntry` — `src/types/topic-vocabulary.ts` (fields: id, stt, word, partOfSpeech, phonetic, meaning, category, session)

## Next.js 16 breaking changes

Read `node_modules/next/dist/docs/` before writing routing, data-fetching, or image code.

- `cookies()`, `headers()`, `params`, `searchParams` — all async, must await
- `middleware.ts` → `proxy.ts`; export `proxy`; no Edge runtime in proxy
- `next lint` removed — use `eslint` CLI directly
- Turbopack is default; `experimental.turbopack` → top-level `turbopack`
- `revalidateTag` needs 2nd `cacheLife` arg; use `updateTag` in Server Actions
- `cacheLife`/`cacheTag` stable — drop `unstable_` prefix
- PPR: `experimental.ppr` removed → `cacheComponents: true`
- Parallel routes: all slots need `default.js`
- `serverRuntimeConfig`/`publicRuntimeConfig` removed → `process.env`/`NEXT_PUBLIC_`
- Use `next/image` and `images.remotePatterns` (legacy variants deprecated)

## Design

ASCII / Terminal aesthetic — monospace only, flat, text-forward.

- **Font**: VT323 (Google Font) — loaded in `layout.tsx` via `next/font/google` with `variable: "--font-ascii"`. In `globals.css` `@theme inline`, map `--font-mono` and `--font-sans` to `var(--font-ascii)`. Set `font-family: var(--font-ascii)` on `body`. Use `font-mono` class everywhere.
- **Colors** (CSS vars in `globals.css`): dark `#111111` bg / `#FFFFFF` text; light `#FFFFFF` bg / `#111111` text; accent `#47B7F8` — exposed as `--color-accent` Tailwind token.
- **Borders**: always `border-dashed`. Never `border-solid` on UI elements.
- **UI rules** — hard constraints, no exceptions:
  - No `rounded-*` (sharp corners only)
  - No `shadow-*`
  - No `bg-gradient-*`
  - No `backdrop-blur-*`
  - No glassmorphism
- **Decorative elements**: box-drawing chars (`─ │ ┌ ┐ └ ┘ ├ ┤ ╔ ╗ ╚ ╝`), ASCII art, bracket-style buttons `[ LABEL ]`.
- Dense, information-rich layouts preferred.

## Animation

`motion` v12 only (`motion/react`). No other animation libs.

- `import { motion, AnimatePresence } from "motion/react"`
- `<motion.*>` for interactive/transitioning elements; `AnimatePresence` for enter/exit
- `layout` prop for layout animations; variants co-located with component
- **CSS transitions**: only `transition-colors` (for color/border changes) is allowed — never `transition`, `transition-all`, or other transition utilities for layout/transform/opacity.

## Tailwind v4

`globals.css`: `@import "tailwindcss"` + `@theme inline { … }`. Tokens: `--color-*`, `--font-*`.

## Speckit Workflow

After every `/speckit-*` command:

1. Create/update `STEP-SPECKIT-{feature}.md` at project root — append `## STEP {n}: /{command} {args}`
2. Update `<!-- SPECKIT START -->` block in `CLAUDE.md` to point to `specs/{feature}/plan.md`

<!-- SPECKIT START -->

For additional context about the current feature under development, read the implementation plan at:
`specs/003-home-page/plan.md`

<!-- SPECKIT END -->
