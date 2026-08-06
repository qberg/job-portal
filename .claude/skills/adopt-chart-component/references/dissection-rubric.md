# Dissection rubric — reference source → verdict table

Read the pasted source as a *design document with an implementation attached*.
Score every distinct piece into one of four verdicts and post the table before
proposing anything.

## Verdicts

| Verdict | Meaning | Typical candidates |
|---|---|---|
| **Steal** | Port the idea faithfully onto visx + tokens | Interaction choreography, visual tricks, micro-feedback |
| **Adopt shape** | Keep the API/data seam, replace internals | Config records, row/series shapes that map onto `SeriesDatum` |
| **Steal concept, fix impl** | Idea good, implementation flawed | `Math.random` ghost data (make deterministic), unseeded jitter, per-render allocation |
| **Drop** | Library workaround, dead weight, or DS-law violation | Auto-drop list in SKILL.md; anything vetoed below |
| **Defer** | Real feature, too big for this pass — own gates/issue | Zoom brush, pan, export; name it to the user, don't build it |

## DS-law veto (run every Steal candidate through this)

A weaker model's failure mode is stealing something premium-looking that violates a
tribune invariant. Veto — cite the law — anything that is:

- **Directional gradient sweep** loading shimmer → tribune skeleton law: opacity pulse
  only, never a sweep. Content-shaped ghost + pulse already exists in chart-shell.
- **Multi-stop gradient strokes** on categorical series → palette law: color = series
  identity (cat-1..8). Gradient breaks the encoding; gradient-continuity dot tricks
  become moot with solid strokes.
- **Glow/bloom filters** on admin dataviz → glow doctrine: reserved for citizen hero
  surfaces (edge-glow); on charts it is decoration + per-frame blur cost.
- **Rounded corners** anywhere → DS is sharp-cornered (pragma-gated exceptions only).
- Celebration/particles not proportional to sentiment → celebration doctrine.

## Two more lenses before finalizing verdicts

- **Port fixes only for problems we actually have.** A reference mechanism often
  exists to fix that library's defect (e.g. a reveal mask so dots don't pop in before
  the line finishes drawing). If our component doesn't have the defect (no resting
  dots), the fix is dead weight — Drop, and say why.
- **Domain fit outranks visual polish.** The highest-value steal encodes *meaning* in
  our data: e.g. a dashed "buffer" last segment maps exactly onto our always-incomplete
  current period bucket. Rank steals by what they tell the citizen/staff, then by looks.

## Where the joy actually lives (look here first)

- Tooltip behavior: frosted/blur surfaces, anti-jump-on-appear, selected-series
  dimming, tabular-nums value columns, gradient indicator swatches.
- Continuity tricks: dot fill = full-width gradient rect clipped to a circle, so the
  dot color matches the line gradient at that exact x. Shared SVG `mask` ids so dots
  ride an area's intro reveal wipe.
- Loading states shaped like the content (ghost chart), not generic spinners.
- Dimming/highlight choreography on hover or legend selection.
- Easing/duration choices — extract them as *intent* ("tooltip follows in ~90ms so it
  feels attached to the cursor"), then map to our motion tokens, never copy raw ms.
- **Feel parity requires the reference's MECHANISM, not its values.** `useSpring` in
  the source is a load-bearing physics choice (velocity continuity), not a styling
  detail — port it as `chart-shell/spring.ts` usage, never approximate with easings.
  If the reference imports a part you weren't given, demand that source before
  designing its feel.

## Worked example (evilcharts base wrapper, adjudicated 2026-07-06)

| Piece | Verdict | Why |
|---|---|---|
| `ChartStyle` runtime `<style>` injection of `--color-{key}-{i}` per theme | Drop | recharts wants literal colors; visx takes tokens directly; dark mode already token-solved |
| `validateChartConfigColors` runtime throw | Drop | its own type already enforces the shape |
| `ChartContainer` `[&_.recharts-*]` className wall | Drop | style-override noise for internals we don't have |
| `ChartConfig` (label/icon per series key) | Adopt shape | maps onto `SeriesMeta`; colors become token refs |
| Tooltip frosted-glass variant | Steal | token-mapped `color-mix` + `backdrop-filter` |
| Tooltip empty-`<span>` anti-jump hack | Steal concept, fix impl | principle = never animate from origin; solved properly with `spring.jump` on appear (teleport attr was the v2 attempt, superseded) |
| Tooltip `selected` dims other rows to 30% | Steal | `data-dimmed` + existing `--tbn-viz-dim-opacity` |
| `getPayloadConfigFromPayload` | Drop | recharts payload gymnastics; `SeriesDatum` kills the need |
| `ChartDot` gradient-continuity clip trick + shared `maskId` | Steal | best idea in the file; ports cleanly to visx glyphs |
| `getLoadingData` random ghost series | Steal concept, fix impl | ghost chart good; `Math.random` per call = jumpy re-renders |

## Verdicts are proposals — the user's fun-signal is final

Drop/Defer verdicts based on taste or scope (NOT DS law) can be overridden by the
user — precedent: confetti Gate-1 reversal, line-chart reveal-wipes/marching-ants/brush
override 2026-07-06. When overridden: reconcile with judgment (scope the stolen idea
to where it carries meaning — e.g. marching ants on the provisional buffer segment
only, slowed), record the override in the table, and re-slice the build. DS-law vetoes
are NOT user-overridable in-session — those need the pragma/HITL route.

## Adjudication notes

- A clever type (`AtLeastOneThemeColor`) guarding a dropped mechanism dies with the
  mechanism — don't port types for their own sake.
- When a reference piece exists only because the host library hides internals
  (positioning, colors, payload shapes), the visx rebuild usually deletes the whole
  problem — check before porting a "fix".
- Record the source library + date in the table heading; verdicts are precedent for
  the next component from the same kit.
