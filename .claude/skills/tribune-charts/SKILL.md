---
name: tribune-charts
description: Operating manual for the @jp/tribune chart suite (line/bar/donut/radar/radial-bar/sankey/chart-brush/chart-shell) — file anatomy, API symmetry laws, motion doctrine, verification loop, and a catalog of known pitfalls with fixes. Use when adding, modifying, reviewing, or debugging any tribune chart component, chart CSS/tokens, chart interaction/motion, or chart stories.
---

# Tribune charts

Hardened 2026-07-07 (5-dimension audit + 4 fix batches). `packages/tribune/CLAUDE.md`
"Chart suite" section is LAW; this skill is the working manual. When they conflict,
CLAUDE.md wins. Deep detail: [REFERENCE.md](REFERENCE.md).

## Non-negotiable laws

1. **Shared vocab first.** Data helpers = `chart-shell/series.ts`; interaction hooks =
   `chart-shell/interaction.ts` (`useKeySelection`/`useEntered`/`activateKeyDown`/
   `resolveDimmed`). NEVER re-implement these per chart. New shared behavior → extract
   there, adopt everywhere.
2. **API symmetry.** Same concept = same prop name/shape on every root: `data`,
   `series`, `keyFormat`, `valueFormat`, `hidden`, `dimmedKey`,
   `selectedKey`/`onSelectedKeyChange`, `onDatumSelect`, `onCursorChange(key)`,
   `ariaLabel`, `animate`, `glowing`, `className`. Sizing: extend `SquareChartProps`
   (`size`) or `RectChartProps` (`height`). Never invent a new name for an existing
   concept — check the prop table in REFERENCE.md first.
3. **frame.ts is pure.** Layout math only — no React, no DOM. >4 args = options
   object. Build lookup `Map`s inside `buildFrame`; never `data.find` in render loops.
   `buildFrame` call is ALWAYS wrapped in `useMemo`.
4. **Motion doctrine.** motion-lib springs, never hand-rolled rAF. Data-truth morphs =
   critically damped (no overshoot); overshoot only on entrances. Per-frame pixel state
   (cursor/drag/tooltip/morph) = motion values writing SVG attrs imperatively — never
   React state per frame. Every JS motion gates on `useReducedMotion()`. Value morphs
   animate `transform`, never x/y/width/height.
5. **Tokens.** No raw color/duration in rules; alias in the component `@layer base`
   block; unconfirmed values get `/* @extrapolated(x): reason, pending HITL */`.
   Series colors via `colorVar()` are the one blessed raw exception.
6. **Data robustness.** Aggregate duplicate `dimensionKey` rows (sum). Handle: empty
   data, single datum, all-zero, negative, missing `periodBucket` (`""` bucket —
   compare `=== undefined`, never truthiness), cycles (sankey `breakCycles`).
7. **A11y.** Axis charts (bar/line) = focusable svg `role="group"` + arrow-scrub +
   sr-only polite live region (keyboard-only). Shape charts = per-element
   `role="button"` + `activateKeyDown`. Keep sr-only table; `SrTable` uses the chart's
   `valueFormat`.

## Workflow for any chart change

1. Read the target chart dir fully + `chart-shell/series.ts` + `interaction.ts`.
2. Make the change following the laws; check REFERENCE.md pitfalls for the area
   you're touching (CSS/tokens, motion, interaction, frame math each have known traps).
3. Verify — ALL must pass:
   ```
   pnpm -F @jp/tribune typecheck
   pnpm -F @jp/tribune check:tokens        # only pre-existing chip.css violation allowed
   pnpm -F @jp/storybook exec vitest run <chart-name>
   ```
   "Vite reloaded a test" on first run = re-run once, not a failure.
   After any `ultracite fix` on CSS: `grep @extrapolated` the file, restore eaten
   comments.
4. **Feel gate:** any perceptible motion/visual change → STOP and ask the human to
   check the story in Storybook before proceeding. Never batch multiple feel changes.
   If unsure whether a paint effect actually renders, verify empirically (see
   REFERENCE.md "Empirical browser verification") — DOM-present ≠ painted.
5. New behavior → one play-test story asserting it (keyboard-driven interactions;
   real clicks OK on svg but fall back to keyboard if flaky).

## New chart component

Use the `tribune-component` skill's two gates (API proposal, token map) — but Gate 1
must show the prop surface aligned to law #2, and the skeleton shape must be added to
`chart-shell/skeleton.tsx` + `SkeletonShape`. Wire `package.json` exports (no barrel).
Adopting a reference chart (evilcharts etc.) → `adopt-chart-component` skill, then
this skill's laws for the build.
