## STEP 1: /speckit-specify Hãy base vào trang home để tạo một màn hình các session của data/500-common-words.json...

- Branch: `004-vocab-500-sessions`
- Spec: `specs/004-vocab-500-sessions/spec.md`
- Checklist: `specs/004-vocab-500-sessions/checklists/requirements.md`
- All checklist items: PASS — ready for `/speckit-plan`

## STEP 2: /speckit-clarify

- 3 clarifications resolved:
  - Q1 mobile layout → card on mobile, table on desktop (≥ lg)
  - Q2 dropdown style → custom ASCII `[ Day N ▾ ]` via `motion/react`
  - Q3 row expand trigger → dedicated `[ + ]` / `[ - ]` button
- Checklist still 16/16 passing

## STEP 3: /speckit-plan

- Plan: `specs/004-vocab-500-sessions/plan.md`
- Research: `specs/004-vocab-500-sessions/research.md`
- Data model: `specs/004-vocab-500-sessions/data-model.md`
- Component contracts: `specs/004-vocab-500-sessions/contracts/components.md`
- Quickstart: `specs/004-vocab-500-sessions/quickstart.md`
- Constitution: vacuously PASS (template placeholders only)
- Ready for `/speckit-tasks`

## STEP 4: /speckit-tasks

- Tasks: `specs/004-vocab-500-sessions/tasks.md`
- 18 tasks across 6 phases (Setup, Foundational, US1, US2, US3, Polish)
- 8 tasks parallelizable
- Ready for `/speckit-implement`

## STEP 5: /speckit-implement

- All 18 tasks completed and marked `[X]`
- `pnpm lint`: clean for feature 004 code (1 pre-existing error in `scripts/parse-1000-topic-words.ts:209` — outside scope)
- `pnpm build`: SUCCESS — `/vocabulary/500` pre-rendered as static
- `tsc --noEmit`: clean
- Files created:
  - `src/app/vocabulary/500/page.tsx` (replaced placeholder)
  - `src/features/vocabulary-500/lib/group-by-session.ts`
  - `src/features/vocabulary-500/hooks/useExpandedRows.ts`
  - `src/features/vocabulary-500/components/{SessionDropdown,WordRow,WordTable,WordCard,WordCardList,VocabularySessionBrowser}.tsx`
- Notable fixes during implementation:
  - Migrated `useExpandedRows` reset from `useEffect` to the "store previous prop" pattern (React's recommended way to adjust state on prop change, avoids `react-hooks/set-state-in-effect`)
  - Refactored `SessionDropdown` open flow to set focus index in event handlers instead of inside `useEffect`
