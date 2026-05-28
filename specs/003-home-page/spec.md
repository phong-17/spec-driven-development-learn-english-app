# Feature Specification: Home Page

**Feature Branch**: `003-home-page`

**Created**: 2026-05-28

**Status**: Implemented

**Input**: Build the application home page at `/` with ASCII/terminal aesthetic, animated navigation, animated hero section, and three content sections with interactive typewriter effects.

## Clarifications

### Session 2026-05-28

- Q: When a nav item is clicked, should it scroll to a section on the home page or navigate to a dedicated route? → A: Navigate to dedicated routes (`/lessons`, `/vocabulary/500`, `/vocabulary/1000`)
- Q: Should each content section include a call-to-action button/link to enter that study area? → A: Yes — each section has an ASCII bracket button that navigates to its route

### Session (post-implementation refinements)

- Navigation at < lg breakpoint uses a `[ ≡ MENU ]` toggle button with animated dropdown instead of inline links
- Each ContentSection shows full description text by default; hovering starts an infinite typewriter animation on the description
- Hovering a ContentSection changes its border to `green-400`
- An animated ASCII cat (`TypingCat`) appears in each section — full cat at lg+ (left column), cat head only at md (beside button)
- Hero title uses infinite typewriter loop: type character-by-character → pause 2s → delete → pause 2s → repeat
- Font: VT323 (Google Font) loaded as `--font-ascii` and mapped to `--font-mono` and `--font-sans` in Tailwind theme

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Site Entry & Navigation (Priority: P1)

A learner opens the home page and immediately sees the terminal aesthetic with animated title, can open the nav menu to reach any content area.

**Why this priority**: Core entry point — must load correctly and navigation must work.

**Independent Test**: Load `/` — background GIF tiles, hero typewriter plays, nav button toggles dropdown at md, sidebar visible at lg+. Clicking each nav item navigates to the correct route.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** viewed at any viewport, **Then** the full-page tiled `theme.gif` background is visible at ~0.19 opacity.
2. **Given** viewport < 1024px, **When** the page loads, **Then** a `[ ≡ MENU ]` button is visible in the top bar; clicking it reveals a dropdown with the three nav links.
3. **Given** viewport ≥ 1024px, **When** the page loads, **Then** a left sidebar shows app title, dashed divider, and three nav links with stagger animation.
4. **Given** any viewport, **When** a nav link is clicked, **Then** the browser navigates to the corresponding route (`/lessons`, `/vocabulary/500`, `/vocabulary/1000`).

---

### User Story 2 - Content Sections & Interaction (Priority: P2)

A learner scrolls through the three content sections and hovers to read descriptions; each section has a button to enter that study area.

**Why this priority**: Core content discovery flow.

**Independent Test**: Hover over each section — border turns green, description typewriter starts. Button click navigates to the route. Cat animation visible.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the user views any ContentSection, **Then** the full description text is visible, the border is `foreground/30` dashed, and the ASCII cat is visible (full at lg+, head-only at md).
2. **Given** a ContentSection is hovered, **When** hover starts, **Then** the border transitions to `green-400`, the description resets to empty and begins typing character-by-character with a blinking cursor.
3. **Given** a ContentSection is hovered and hover ends, **When** cursor leaves, **Then** the full description text snaps back immediately and the border returns to `foreground/30`.
4. **Given** the user clicks an ASCII bracket button `[ LABEL ]`, **Then** the button fill animates from left and the browser navigates to the section's route.

---

### User Story 3 - Responsive Layout (Priority: P3)

Layout adapts across mobile (320px), tablet (768px), and desktop (1024px+) without horizontal overflow.

**Independent Test**: Resize to 375px — hamburger menu works, no overflow. At 768px — top bar + main full width. At 1024px+ — sidebar visible.

**Acceptance Scenarios**:

1. **Given** viewport < 768px, **When** the page loads, **Then** nav is a top bar, ContentSection shows no cat.
2. **Given** viewport 768–1023px, **When** the page loads, **Then** nav is top bar with dropdown, ContentSection shows cat head beside button.
3. **Given** viewport ≥ 1024px, **When** the page loads, **Then** sidebar is visible, ContentSection shows full cat in left column.
4. **Given** any viewport ≥ 320px, **Then** no horizontal scrollbar appears.

---

### Edge Cases

- Nav dropdown closes automatically when a link is clicked.
- `theme.gif` tiled background renders correctly if the gif is animated.
- `background.gif` section shows ASCII art at fixed 400px height with `object-contain`; dark mode applies `invert` to match dark background.
- Layout does not shift when the TypingCat alternates frames (fixed-width `<pre>` and typing-dots `<span>`).
- VT323 font loads from Google Fonts; UI falls back to `ui-monospace` if unavailable.

## Requirements *(mandatory)*

### Layout & Background

- **FR-001**: Home page MUST be accessible at `/`.
- **FR-002**: A tiled `theme.gif` MUST be rendered as a `fixed` full-page background (`z-0`) using CSS `background-repeat: repeat; background-size: 250px` at approximately 0.19 opacity.
- **FR-003**: Page root MUST be `flex-col` on mobile/tablet and `flex-row` (sidebar + main) at `lg` (1024px+).

### Navigation (`NavigationMenu`)

- **FR-004**: Navigation MUST contain exactly three links: "Lessons" → `/lessons`, "500 Most Common Words" → `/vocabulary/500`, "1000 Topic Vocabulary" → `/vocabulary/1000`.
- **FR-005**: At `< lg` viewports, navigation MUST display as a top bar showing `> ~/learn-english` and a `[ ≡ MENU ]` ASCII bracket toggle button. Clicking toggles an animated dropdown list.
- **FR-006**: The dropdown MUST close when a nav link is clicked. Button label MUST change to `[ × CLOSE ]` while open.
- **FR-007**: At `lg+`, navigation MUST display as a sticky left sidebar (`w-56`, `h-screen`) with: app title block (eyebrow + "LEARN ENGLISH" heading + dashed divider) and nav items with `▸` prefix and stagger entrance animation.

### Main Content Sections (top to bottom)

- **FR-008**: A `BackgroundSection` MUST appear first in the main content area, displaying `/public/images/background.gif` at `h-[400px]`, `object-contain`, with `dark:invert` applied.
- **FR-009**: A `HeroSection` MUST follow, containing:
  - Eyebrow text `> ~/learn-english` in accent color, animated slide-in from left
  - ASCII box-drawing frame (top `┌─…─┐` and bottom `└─…─┘`) that animate with `scaleX` from left on mount
  - Title "LEARN ENGLISH" with infinite typewriter loop: each character appears at 70ms intervals → pause 2000ms at full text → delete at 70ms intervals → pause 2000ms → repeat
  - Blinking cursor `_` (accent color, `opacity: [1,1,0,0]` loop at 0.9s)
  - `TypingCat` component to the LEFT of the title text
  - Tagline paragraph fades in after 1.5s delay
- **FR-010**: Three `ContentSection` components MUST follow (`lessons`, `vocab-500`, `vocab-1000`), each containing:
  - Section label `[ section // {id} ]` in muted color
  - Title (`h2`) in accent color, uppercase, font-bold
  - Description paragraph — shows full text by default; on hover, resets and animates with same infinite typewriter as hero title, with blinking cursor; on hover-end, snaps back to full text
  - ASCII bracket button `[ LABEL ]` with dashed accent border, fill-from-left hover animation, navigates to section's route
  - `TypingCat` (full) in left column at `lg+`; cat head only (`∧_∧` + `(=^ω^=)`) beside the button at `md`; hidden at `< md`
  - Dashed border `foreground/30` at rest; transitions to `green-400` on hover (`transition-colors duration-300`)

### `TypingCat` Component

- **FR-011**: `TypingCat` MUST alternate between two ASCII art frames every 450ms simulating paw movement (left paw / right paw).
- **FR-012**: Beside the cat, a `> typing. / typing.. / typing...` label MUST cycle in sync. The label container MUST have a fixed width (`w-20`) to prevent layout shift.
- **FR-013**: The `<pre>` containing the cat art MUST have a fixed width to prevent layout shift when frame characters differ in visual width.

### Placeholder Routes

- **FR-014**: Routes `/lessons`, `/vocabulary/500`, `/vocabulary/1000` MUST exist and render a minimal ASCII-style page with an `<h1>` heading and "Coming soon." text. No 404s.

### Design System

- **FR-015**: Font MUST be VT323 (Google Font) loaded via `next/font/google` with `variable: "--font-ascii"`. `globals.css` MUST map `--font-mono` and `--font-sans` to `var(--font-ascii)`.
- **FR-016**: All borders MUST be dashed (`border-dashed`). No rounded corners, shadows, or gradients anywhere.
- **FR-017**: Color tokens: background `#111111` (dark) / `#ffffff` (light); foreground inverse; accent `#47B7F8`.
- **FR-018**: All animations MUST use `motion` v12 (`import { motion, AnimatePresence } from "motion/react"`). No CSS transitions except `transition-colors`.

### Key Entities

- **NavigationMenu**: Toggle button + animated dropdown at < lg; sticky sidebar at lg+.
- **BackgroundSection**: Displays `background.gif` at fixed height 400px.
- **HeroSection**: Infinite typewriter title, ASCII frame, TypingCat left, eyebrow, tagline.
- **ContentSection**: Hover-triggered typewriter on description, green border on hover, ASCII button, TypingCat responsive behavior.
- **TypingCat**: Two-frame ASCII cat animation with fixed-width typing indicator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The hero title typewriter completes one full cycle (type + delete) within ~5 seconds of first hover/load.
- **SC-002**: Page renders without layout breaks at 320px, 768px, 1024px, 1440px, 1920px.
- **SC-003**: All three nav links navigate to their routes without errors at all breakpoints.
- **SC-004**: Hovering a ContentSection triggers border color change within one frame (< 16ms) and typewriter starts within 70ms.
- **SC-005**: No horizontal scrollbar at any viewport ≥ 320px.
- **SC-006**: `pnpm build` completes with zero TypeScript and ESLint errors in home-page files.
- **SC-007**: TypingCat animation causes zero layout shift in surrounding content (fixed-width containers).

## Assumptions

- `theme.gif` and `background.gif` are present in `/public/images/`.
- VT323 is available via Google Fonts at build/runtime.
- The three destination routes (`/lessons`, `/vocabulary/500`, `/vocabulary/1000`) are placeholder pages for this phase; full content is out of scope.
- Dark mode is the default (`prefers-color-scheme: dark`).
- No authentication, no data fetching, no database — all content is static copy.
