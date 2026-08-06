# Tribune charts — reference

## Anatomy

Each chart dir under `packages/tribune/src/components/`:

| File | Role |
|---|---|
| `<name>.tsx` | root component ("shell") — props, wiring, a11y, svg |
| `<name>.css` | rules; `@layer base` token block; imported by the .tsx (un-imported CSS = silently dead) |
| `frame.ts` | PURE layout math (`buildFrame` + helpers); Maps for lookups; no React |
| `<name>.stories.tsx` | the ONLY tests (Storybook play fns) |
| extras | `line-chart/`: `line-layers.tsx`, `use-line-cursor.ts`, `use-morphed-path.ts` · `bar-chart/`: `anchor.ts`, `bar-defs.tsx`, `variants/{bars,grid,isometric,monospace,trace}.tsx` · `chart-brush/`: `mini-chart.tsx`, `use-brush-drag.ts` · shape charts: `<name>-defs.tsx` (glow filter) |

Shared home `chart-shell/`: `chart-shell.tsx` (compound Root/Header/Title/Body/
Legend/Source/Stats), `skeleton.tsx` (6 shimmer skeletons), `chart-tooltip.tsx`,
`cursor-sync.tsx` (cross-chart scrub context), `series.ts`, `interaction.ts`.

## Shared modules — use, don't re-implement

`series.ts`: `SeriesDatum` `{dimensionKey, periodBucket?, value, compareValue?}`
(bucketed rows are valid input to EVERY chart), `VizColor`, `colorVar`, `seriesKeys`,
`bucketOrder`, `windowByBuckets`, `legendItems`, `seriesColor`, `seriesLabel`,
`formatValue` (en-IN, compact ≥1L), `computeMaxWithHeadroom`, `SquareChartProps`,
`RectChartProps`, `BrushRange`.

`interaction.ts`: `useKeySelection` (controlled/uncontrolled — the guard is
`selectedKey === undefined`, NEVER `?? null`, controlled-null must work),
`useEntered(animate)` (rAF-gated mount flag), `activateKeyDown` (Enter/Space select +
Escape blur), `resolveDimmed(active, selected, dimmedKey)`.

## Prop contract (the 8 roots)

All roots: `data`, `series?`, `className?`, `ariaLabel?` (defaults to per-chart
string). Axis charts (bar/line): `height?`, `onCursorChange?(key: string|null)`,
scrub keyboard model. Shape charts (donut/radar/radial/sankey): `size?` (sankey:
`height`), per-element buttons. All data charts: `hidden?`, `dimmedKey?`,
`selectedKey?`+`onSelectedKeyChange?`, `onDatumSelect?`, `keyFormat?`, `valueFormat?`,
`animate?`, `glowing?` (bar: trace variant only). `variant` axes: bar
`bars|monospace|trace|grid|isometric`, donut `donut|pie`, sankey `blend|source|target`
(NOT "gradient" — collides with the `gradients` prop concept on line/donut/radial).
Frame types are prefixed: `BarFrame`/`LineFrame`/`BrushFrame`/`RadarFrame`/
`RadialFrame`/`SankeyFrame`.

## Motion constants (decided, don't drift)

| Concept | Value |
|---|---|
| Follow spring (tooltip/trace/brush) | `{stiffness:300, damping:35, mass:0.8}` (ζ≈1.13, overdamped — no overshoot) |
| Line morph spring | `{stiffness:380, damping:40, mass:1}` critically damped, ~300ms |
| Line cursor spring | `{stiffness:550, damping:47, mass:1}` snappy follow |
| Mono bar spring | `{stiffness:200, damping:25}` |
| CSS durations | `--duration-fast 120ms / -base 200 / -slow 300 / -pulse 1600 / -roll 650` |
| Blessed feel decisions | brush: visual tracks raw pointer via spring during drag, quantize-settle detent on release · line: cursor line chases pointer, tooltip+dots snap to bucket · skeletons: shimmer band along shape (floor 0.4), bar/line re-randomize geometry on shimmer-exit · sankey: nodes grow → links fade-stagger; connected ribbons dash-march on hover |

`.jump()` = instant (keyboard, reduced-motion, first-show); `.set()` = spring retarget.
`useSpring(number)` does NOT retarget from a changing render value — always `.set()` in
an effect/handler.

## Pitfall catalog (symptom → cause → fix)

**CSS / tokens**
- Animation/shadow/radius silently `none` → Tailwind v4 PRUNES plain `@theme` vars
  with no scanned utility usage; raw `var()` in CSS is invisible to the scanner →
  token block must be `@theme static` (motion/radius/shadows/typography already are).
  Diagnose with browser `getPropertyValue('--token')` on `:root`, not source grep.
- `@extrapolated` comments vanish → `ultracite fix` CSS property-sort eats adjacent
  comments → grep + restore after every scoped fix.
- `var(--color-tbn-*)` in raw CSS = always a bug (utility-only aliases, undefined at
  runtime) → use `var(--tbn-*)`.
- Reduced motion: Tailwind `motion-reduce:animate-none` only kills CSS *animations* —
  `transition:` rules need the explicit `@media (prefers-reduced-motion: reduce)`
  block, and JS springs need `useReducedMotion()` gates.

**Motion / animation**
- Staggered CSS entrance dies after index 0 → gating attr (`useEntered`) flips ~16ms
  after mount; removing the trigger attr CANCELS running/pending CSS animations →
  gate staggered entrances on a STABLE attr (`data-animate` on root, see sankey), or
  latch with `useState(() => ...)` (see line `drawEntering`). Transitions are safe
  with fast-flip attrs; animations are not.
- Bar/rect value animation janky → transitioning `x/y/width/height` attrs = reflow
  per frame → static geometry + `transform: scaleY(var(--tbn-bar-scale))`,
  `transform-box: fill-box`. Exclude motion-driven variants from the CSS transform
  rule (`:not([data-variant="monospace"])`) so CSS never fights motion's transform.
- Chart re-renders every mousemove → pixel state in `useState` → motion value +
  imperative `setAttribute`/`style.setProperty` subscription (see `use-line-cursor` /
  `chart-tooltip`). Also cache `getBoundingClientRect` in a ref refreshed by
  ResizeObserver + capture-phase window `scroll` listener (scroll invalidates
  rect.left without firing either).
- Morph restarts while scrubbing → unmemoized array prop (`points.slice()`) gives the
  morph effect a new dep identity per render → `useMemo` every derived array passed
  to a motion hook.
- Entrance lost in dev only → ref write during render + StrictMode double render →
  `useEntered` or a `useState` initializer latch, never `ref.current = x` in render.

**Data / frame math**
- Sankey render crash `"circular link"` → d3-sankey throws on cycles; domain data HAS
  cycles (reopen edges) → `breakCycles` in frame.ts is load-bearing, keep it before
  `layout()`.
- Wrong totals/slices → `.find()` takes first row per key; bucketed data has many →
  filter+sum. Negative values corrupt SUBSEQUENT arc geometry → clamp contribution to
  ≥0, keep raw value for display.
- Brush/interaction dead on unbucketed data → missing `periodBucket` becomes bucket
  `""` (falsy!) → compare `=== undefined`, never `if (bucket)`.
- Last morph point snaps → float accumulation overflows `Math.ceil(pos)` index →
  clamp to `points.length - 1`.
- Composite keys from data strings → join with `""` (unit separator), never
  `-` (ward names contain dashes). Value-derived React keys (key={height}) → index
  keys + `noArrayIndexKey` ignore for static never-reordering arrays.
- New frame: division by zero on empty/[0,0] domains, r ≤ 0 rings (filter out),
  sentinel comparisons (`Number.NEGATIVE_INFINITY`, not `-1`).

**Testing (Storybook play)**
- `pnpm -F @jp/storybook exec vitest run <chart-name>`; no per-pkg test script.
- Keyboard-driven selection is deterministic; synthetic pointer clicks on svg can be
  flaky — real `userEvent.click` on rects has worked, but fall back to keyboard.
- Portal'd popups → `within(document.body)`. First run after new dep import → "Vite
  reloaded a test" → re-run once.
- Paint is NOT asserted by DOM queries — charts keep a `getBoundingClientRect().height
  > 100` guard, but mask/filter/token issues need browser verification (below).

## Empirical browser verification

When a paint effect may be "DOM-present but invisible" (masks, filters, tokens,
animations): start `pnpm -F @jp/storybook dev` (port 6006), drive with the
`agent-browser` skill (story ids `components-<chart>--<kebab>`), and read ground truth
via `getComputedStyle` (`animation-name`, `filter`, resolved custom properties) +
screenshots a few hundred ms apart for motion. Faint effects need a grayscale/level
boost to see in screenshots. Kill Storybook and confirm port 6006 free when done.

## Repo mechanics

- Exports: every externally-importable file needs a `packages/tribune/package.json`
  `exports` entry (no barrel, no wildcard). Internal-only imports need none.
- NEVER run root `pnpm fix` — scope `ultracite fix` to touched files.
- Lint: complexity ≤5/function, no `any`, 100-char lines, minimal comments (one-line
  WHY only; ≥3 consecutive comment lines are hook-rejected).
- Feel-gate protocol: perceptible motion change → stop, name the story, ask the human
  to keep/drop. Record verdicts in ADR-0038 adoption ledger (chart suite row).
- Known pre-existing red: `chip/chip.css:19` token violation (not chart scope).
