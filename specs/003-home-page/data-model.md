# Phase 1 Data Model: Home Page

**Feature**: 003-home-page
**Date**: 2026-05-28

This feature has **no persisted data and no runtime data fetching**. The "data model" here describes the static content shape consumed by the three home-page sections and the navigation menu. All values are hard-coded TypeScript literals in `src/features/home/content.ts`.

## Entities

### NavLink

The shape of a single entry in the top navigation bar.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `label` | `string` | non-empty, English | Display text shown in the nav bar |
| `href`  | `string` | absolute path starting with `/` | Destination route for `next/link` |

Instances (exactly 3, ordered):

| label | href |
|---|---|
| `Lessons` | `/lessons` |
| `500 Most Common Words` | `/vocabulary/500` |
| `1000 Topic Vocabulary` | `/vocabulary/1000` |

Maps to: FR-002, FR-002a, FR-003.

---

### SectionContent

Shape consumed by the reusable `ContentSection` component (Lessons / 500 / 1000 sections only — hero uses its own dedicated component).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id`          | `string` | unique within the page; URL-safe | Stable identifier (e.g., `lessons`, `vocab-500`, `vocab-1000`) |
| `title`       | `string` | non-empty | Section heading text (rendered prominently) |
| `description` | `string` | ≤ 2 sentences, English | Short prominent body text describing the area |

Instances (exactly 3, ordered):

| id | title | description (proposed copy — author may revise) |
|---|---|---|
| `lessons` | `Lessons` | `Sixteen structured lessons from Ms. Huong's book, split into thirty-two study sessions.` |
| `vocab-500` | `500 Most Common Words` | `The 500 most frequent English words, distributed evenly across thirty-two sessions.` |
| `vocab-1000` | `1000 Topic Vocabulary` | `One thousand topic-grouped words covering everyday themes, paced across thirty-two sessions.` |

Maps to: FR-005, FR-006, FR-007, FR-012.

---

### HeroContent

Static shape consumed by the `HeroSection` component.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `eyebrow` | `string` | short prompt-like prefix | e.g., `> learn-english` (decorative shell-prompt flavor) |
| `title`   | `string` | non-empty, monospace-friendly | Main page heading |
| `tagline` | `string` | one sentence | Short positioning line under the title |

Single instance:

| field | value (proposed) |
|---|---|
| `eyebrow` | `> ~/learn-english` |
| `title` | `LEARN ENGLISH` |
| `tagline` | `A personal study console — lessons, common words, and topic vocabulary.` |

Maps to: FR-004, FR-008, FR-011.

## Relationships

- The home page composes one `HeroContent` + an ordered array of three `SectionContent`.
- The navigation menu consumes an ordered array of three `NavLink`s.
- Each `NavLink.href` corresponds 1-to-1 with a placeholder page route (`/lessons`, `/vocabulary/500`, `/vocabulary/1000`).
- No cross-references between `SectionContent` and `NavLink` are required — the page does not auto-derive nav from sections (kept explicit so order and labels can diverge if ever needed).

## Lifecycle / State

None. All content is read-only constants resolved at build time.

## Validation

Static — guaranteed by the TypeScript compiler:

- `NavLink[]` is typed as a tuple of length 3.
- All `string` fields are non-optional.
- `id` values for sections are constrained to a string literal union: `"lessons" | "vocab-500" | "vocab-1000"`.
