---
name: adopt-chart-component
description: Adopt a chart component from a reference library (evilcharts, shadcn charts, tremor, any recharts-based kit) into @jp/tribune's visx chart suite — steal the interaction design, rebuild on our stack. Use when the user pastes reference chart source and asks to adopt/port it, mentions evilcharts, or wants premium chart UX brought into tribune.
---

# Adopt a chart component into tribune

You are the senior decision-maker: your output is verdicts, gates, specs, audits.
Delegate labor to subagents (haiku=trivial, sonnet=well-specced build, opus=reasoning-heavy)
and personally audit the full result — subagent checks passing is not the bar; the checklist
below is.

Works for BOTH: adopting into an existing tribune chart (upgrade-in-place) AND building a
NET-NEW chart form not yet in the suite (scatter/radar/heatmap). Same workflow; the only
fork is Gate 1 (delta vs whole-API) — see the Upgrade law + Recon step.

## Laws (non-negotiable)

- **Steal interaction design, never code.** Reference source is a design document.
  Our stack: visx low-level only, `SeriesDatum` projection, cat-1..8 palette,
  tribune 3-tier tokens (dataviz #105 gates). Code-quality worry solved by rewrite.
- **Read the reference's animation logic LITERALLY before building.** Trace which STATE
  each frame describes: recharts `shape` (isActive=false) = the RESTING state,
  `activeBar` (isActive=true) = the HOVERED state; `initial`/`animate` keyed on
  `isActive` tell you both. A monospace bar animates to `COLLAPSED` when NOT active
  (⇒ thin at rest, expands on hover) — the OPPOSITE of "collapse siblings on hover".
  Getting this backwards is a full rebuild the user will call "worst interactions". In
  your Gate-1 dissection, restate the resting vs hovered vs entering states in words
  before any code.
- **Auto-drop list** (recharts/shadcn noise — drop without debate): runtime `<style>`
  injection / `dangerouslySetInnerHTML` CSS, per-theme color arrays (tokens already
  handle dark mode), `[&_.recharts-*]` className overrides, payload-shape gymnastics
  (`getPayloadConfigFromPayload` etc.), runtime validation of type-enforced shapes,
  `Math.random()` in render.
- **Upgrade-in-place beats new component — but net-new is fine on the same rails.** Recon
  first. Sibling already covers the form → extend it, keep export paths, Gate 1 = delta.
  NET-NEW form (no sibling) → new FOLDER, but reuse the suite spine (`series.ts` projection,
  `ChartShell` frame + `DemoShell` stories, `--tbn-viz-*` tokens, `frame.ts` geometry +
  `variants/<x>.tsx` split); a new chart is never a new stack. Gate 1 = whole API.
  **Classify net-new-vs-sibling by DATA MODEL, not visual family.** Two forms can share a
  visual family (both polar-arc) yet be distinct: radial-bar = concentric INDEPENDENT
  magnitudes (one bar/`dimensionKey`, arc ∝ value/max, NEVER summed) vs donut = angular
  PART-TO-WHOLE segments of one ring (slices sum to 100%). Same look, different semantics ⇒
  net-new, NOT a donut variant. Conversely, when the data model IS the sibling's (radial-bar's
  == donut's: flat list, `periodBucket` unused, value = magnitude), STEAL that sibling's whole
  mechanism (donut = the arc exemplar for any arc/gauge/ring form — stroked path + dasharray/
  dashoffset, glow/gradient defs, `role=button` a11y), don't reinvent geometry.
  `variants/<x>.tsx` split is for genuinely-different MARK renders (bar's iso/trace/mono); a
  geometry-only axis (radial's full\|semi — same arc mark, different sweep/center) stays a
  `frame.ts` param + single component (mirror radar, which has no `variants/` folder).
- **Reuse before minting.** Grep `semantic/light.css` + `tokens/motion.css` before any
  new token — `--tbn-viz-dim-opacity`, `--tbn-viz-scrub-snap` etc. likely already exist.
- **Motion split by TYPE.** (1) One-shots (grow/collapse/blur-drop/wipe/reveal) = CSS
  keyframes/transitions, tokenized (`--tbn-viz-*` + `--ease-*`), zero per-frame JS. Our visx
  marks don't remount on hover, so evil's `introStartedAt` elapsed-anchor trick is a problem
  we don't have — a plain keyframe grow suffices. (2) Follow-motion (chasing a moving/snapped
  target: cursor glide, trace line, brush) = **motion.dev `useSpring` (300/35/0.8)**. GOTCHAS:
  `useSpring(number)` does NOT retarget on prop change — you MUST `mv.set(target)` in an effect;
  bind the value to `style`/attr, never `setState` per frame. (`chart-shell/spring.ts`, the old
  rAF port, is DELETED — migration complete 2026-07-07; motion.dev is the only spring.)
  Target-side laws (prop contract, motion constants, pitfalls) = the `tribune-charts` skill —
  read it before Gate 1; the port must land inside its contract.
- **A11y parity is ours to add, never the reference's to excuse.** These kits ship
  zero keyboard/ARIA (EvilBrush precedent) — our port always carries roles,
  keyboard operation, and `aria-valuetext`, budgeted into the spec from Gate 1.
- **Recharts compound = an artifact, not a design signal. Default FLAT.** A pasted
  `<XChart>`+`<Series>`+`<PolarGrid>`+`<Legend>` tree is compound only because recharts
  REQUIRES children composition — we don't inherit that constraint. The whole suite is
  FLAT (donut/bar/line: one `<Chart data series ...props>`, overlay derived from
  `seriesKeys(data)`, axes/grid always-on). Port to FLAT unless ≥2 parts are genuinely
  *consumer-arranged* (the compound-iff rule from tribune-component). Radar's compound
  reference → flat `<RadarChart>` mirroring donut's exact prop vocab (`size`/`hidden`/
  `dimmedKey`/`selectedKey`/`onSelectedKeyChange`/`glowing`/`animate`/`valueFormat`/
  `onDatumSelect`) + form-specific axes. Mirroring the closest sibling's prop names is a
  consistency win — grep it before naming anything.

## Workflow

1. **Recon.** Existing target → re-read its `.tsx` + `.css` for the exact current features
   (the delta). Net-new form → read the closest sibling + the shared spine (`series.ts`,
   `chart-shell/*`, `bar-chart/frame.ts` + `variants/`) as the pattern you'll mirror. Either
   way map the suite once (components, CSS, tokens, stories, consumers) — spawn a compressed
   investigator if no fresh map. GOTCHA: the suite may be UNTRACKED — `git diff` shows nothing;
   `git status` first, audit by reading files.
2. **Dissect.** Post a verdict table to the user: each piece of the pasted source →
   `Steal` / `Adopt shape` / `Steal concept, fix impl` / `Drop` + one-line why. The joy
   usually lives in: hover choreography, tooltip behavior, gradient-continuity tricks,
   dimming, loading ghosts. See [dissection-rubric.md](references/dissection-rubric.md).
3. **Gate 1 — API.** Run the `tribune-component` skill workflow. Existing target → propose
   the delta; net-new → propose the whole API (primitive, prop/variant axes, compound-vs-flat).
   For a NET-NEW form, state the `SeriesDatum` axis-mapping EXPLICITLY (which projection field
   is which axis) so existing helpers reuse verbatim — e.g. radar: `periodBucket`=spoke/axis,
   `dimensionKey`=overlaid series, `value`=radial reach ⇒ `bucketOrder()`=spokes,
   `seriesKeys()`=radars. Non-cartesian forms (radar/scatter/heatmap) still ride `SeriesDatum`;
   don't invent a bespoke data shape. STOP for approval.
4. **Gate 2 — token map.** Full variant×state grid per tribune-component skill. Every
   NEW value = `⚠️ extrapolated` with rationale (reference value + our adjustment);
   list them explicitly ("N need your yes/adjust: ..."). STOP for approval.
5. **Spec + delegate.** Write the build spec inline (see below), spawn builders,
   `run_in_background: false`. Parallelize ONLY on disjoint file sets (slices sharing
   a file go to one builder); builders never run storybook vitest (parallel runs
   collide — orchestrator runs it once after all builders land).
6. **Audit personally, then HAND THE BROWSER TO THE USER.** Read every changed file (not
   just diff — untracked!). Run the audit checklist below and fix small defects yourself.
   **Do NOT auto-drive agent-browser / take screenshots — the USER owns the browser and
   is the visual oracle.** They said so explicitly ("I will check the browser unless I
   explicitly ask you to"). Launching agent-browser unprompted burns tokens and steps on
   them. Instead: confirm the storybook is up (`curl :6006`), then POST a per-story eyeball
   checklist — name each new story (`Components/<Chart>` → the exact story labels) and, one
   line each, what to look for + the risky bit you can't test (seam, glow softness, motion
   feel). Drive agent-browser ONLY when the user explicitly asks you to verify visually.
   WHEN you do get the browser (only then): `eval` actual SVG attrs /
   `getBoundingClientRect` / `getComputedStyle` — the formula lied once (position math said
   Δ=0 while the DOM showed `text-anchor:start`); trust measured DOM + pixels over
   derivation. Stories live inside a `maxWidth:560` decorator (2-of-4-col dashboard cell)
   — eyeball at real width, never full viewport.
7. **Feel iteration.** Green checks prove correctness, never feel — the user is the
   FEEL oracle and will iterate ("still not smooth"). When feel feedback lands,
   diagnose the MECHANISM first (wrong physics: transition-retarget vs spring,
   layout-thrash, re-render per frame), not the values (durations/easings). Two
   delegated motion attempts failing = build the mechanism yourself.
8. **Done =** checks green + ADR-0038 ledger row added/updated (record failed
   mechanisms honestly, v2→v3) + parity ask posted to user (name the exact stories
   to eyeball) + debts flagged.

## Build spec must contain

- Mandatory reads first: `packages/tribune/CLAUDE.md`, `button.css` (alias exemplar),
  the current component files, `chart-shell/series.ts`, every consumer.
- Exact CSS: alias-tier additions, rule-by-rule changes, `@extrapolated` single-line
  trailing comments (a hook rejects ≥3 consecutive comment lines).
- Exact TS API with types; note `exactOptionalPropertyTypes` (conditional spread,
  never `{x: undefined}`) and `noUncheckedIndexedAccess`.
- Consumer migration rule: preserve exact information shown today; if unmappable,
  STOP and report — never invent an escape hatch.
- Stories for every new variant×state cell (existing play patterns). **Frame EVERY story in
  the family shell — never a bare `<Chart/>`** (reads unfinished, user calls it "ugly"). Copy
  bar-chart's `DemoShell`: `<ChartShell><ChartShell.Stats items annotations/><ChartShell.Body>
  …</ChartShell.Body></ChartShell>` — derived StatItems (Total/Peak/selected value) + chips
  (`[TYPE]`, `[SEGMENTS]`, `[FILL] Gradient`…). Interactive stories drive the readout (click/
  hover updates a Stat). Fixed-size charts (donut/pie square, not full-width `ParentSize`)
  center in the body (`flex justify-center`); bar/line fill width.
- Verify commands: `pnpm -F @jp/tribune check:tokens`, `pnpm -F @jp/tribune typecheck`,
  `pnpm -F @jp/storybook exec vitest run <filter>`. `check:tokens` scans the WHOLE pkg and
  exits 1 on the FIRST violation anywhere — a stranger's untouched file (e.g. `chip.css`) can
  fail the command though your files are clean. Confirm YOUR paths aren't in the violation
  list, don't fix the stranger's (shared branch). Same for typecheck/vitest pre-existing fails.
- A NET-NEW form OWNS a `ChartShell` skeleton shape: add it to the `SkeletonShape` union +
  a `ChartSkeleton` branch + a `.tbn-chart-shell__sk-<shape>` CSS class reusing the existing
  `tbn-chart-sk-pulse` opacity-pulse animation (NOT the reference's random-shape-morph — that
  violates the DS skeleton doctrine, drop it). Wire `skeleton="<shape>"` in the shell stories +
  a `Loading` story asserting the skeleton elements render. Two small shared edits to
  chart-shell.tsx/.css — flag them as touching a shared file. **ORCHESTRATOR owns the
  shared-file edits** (ChartShell skeleton union+branch+CSS, `package.json` export) and hands
  the builder a DISJOINT new-folder-only file set — shared branch, a builder editing
  chart-shell/package.json risks colliding with a concurrent agent (and the builder can't
  test the skeleton anyway; the orchestrator runs vitest once at the end). Do these yourself
  before delegating; tell the builder those files are DONE, do-not-touch.
- New form also needs a `package.json` `exports` entry (`./components/<x>`) — no wildcard,
  module-not-found without it (mirror the sibling chart entry).
- Tokenize a gradient's opacity ramp WITHOUT literals: SVG `stop-opacity` presentation
  attr can't take `var()`, but `<stop style={{ stopOpacity: "var(--tbn-x-fill)" }}>` can —
  and the edge stop = `calc(var(--tbn-x-fill) * 0.4)` keeps a fade tokenized off one value,
  zero new literals (radar fill-fade precedent). A gradient that carries opacity lets the
  painted `<polygon fill="url(#g)">` stay `fill-opacity:1`.
- Geometry scalars (bar thickness, iso depth, grid cell/gap, any factor JS uses for SVG
  coords) = JS consts, NOT tokens — a CSS var is DEAD, JS can't read it for a `<rect>`.
  Only PAINTED scalars (opacity/blur/color/timing) become tokens; non-color scalars live
  as literals in the `--tbn-viz-*` semantic tier (like `ghost-opacity`), no primitive tier.
- Bar thickness model: single-series `min(band * ratio, maxCap)` — ratio thins bars as
  categories grow (12 months ⇒ evil-thin), max stops the few-cat billboard; grouped FILLS
  its sub-band (the group-padding gives the pair gap). One knob can't serve both — a
  centering-cap applied to grouped bars separates the pair.
- Refactor BEFORE piling variants on: split the monolith (geometry→`frame.ts`,
  tooltip-anchor→`anchor.ts`, each look→`variants/<x>.tsx`) as a behavior-preserving pass
  (stories green before AND after) — then the render branches `isX ? <XBar> : ...` and each
  variant is a small file. Adding N looks to a 600-line ternary-heavy component compounds it.
- Guardrails verbatim: NEVER root `pnpm fix`/`check`; format scoped to touched files;
  `grep @extrapolated` after any formatter run (ultracite drops those comments); no
  commits; no `rounded-*` (HITL exception = `@ds-allow-rounded: <reason>` pragma; SVG `rx`
  isn't caught by the hook but still pragma-document it); no raw oklch/hex in component
  rules; lines ≤100 chars.

## Audit checklist (each item has burned us)

- [ ] **Paint timing**: any appear-frame attribute (teleport, first-frame suppression)
      set in `useLayoutEffect`, NOT `useEffect` — post-paint = the glide already ran.
- [ ] **Re-minted tokens**: every new literal in the diff — grep semantic tier; if an
      equivalent system token exists, chain to it and delete the `@extrapolated`.
- [ ] `@extrapolated` comments survived the formatter (grep touched CSS).
- [ ] Transition scoping: properties transition only under the intended state attr;
      override rules (`transition: none`) WIN by source order at equal specificity.
- [ ] Consumer migrations lost no information; deviations reported, judged, recorded.
- [ ] Pre-existing failures (other agents' WIP on the shared branch) identified and
      left alone — verify via stash test or `git log`, never "fix" a stranger's file.
- [ ] Motion doctrine: never animate from origin; `prefers-reduced-motion` drops
      movement, keeps fade.
- [ ] **Follow-motion is a spring, not a retargeted CSS transition** (see Motion law). A
      retargeted transition restarts from zero velocity each update — with snapped targets
      (buckets) it reads as stepping at any easing. CSS transitions only for one-shot changes.
- [ ] SVG hit-testing: readout layers painted above interactive paths (cursor line,
      lollipops, live dots) need `pointer-events: none` — else they eat clicks at the
      exact spot users aim for. Trace paint order top-down for every interactive layer.
- [ ] Animation fill-mode vs state attrs: `fill: both/forwards` with an explicit `to`
      frame overrides `[data-*]` styling of the same property forever — omit the end
      frame so the animation settles on the computed value.
- [ ] SVG a11y roles: `role="img"` makes ALL descendants presentational — never use it
      on an svg containing focusable/interactive children (sliders, buttons). biome
      `useSemanticElements` REJECTS `role="group"` (→ wants `<fieldset>`) AND `role="button"`
      (→ wants `<button>`) on SVG. Resolve per case: svg with NO slider descendants (donut/
      radar) → OMIT the svg role entirely, keep only `aria-label` (donut precedent — focusable
      `role=button` shapes still work); svg that IS a slider host (chart-brush) → keep
      `role="group"` + a `biome-ignore`. For the interactive shape's `role="button"`, the
      `biome-ignore` must sit on the EXACT element bearing the role — a comment on a `<g>`
      wrapper does NOT cover an inner `<polygon role="button">` (silent lint fail).
- [ ] **Transient enter-state assertions are flaky.** A play-test asserting `[data-entering]`/
      `.is-entering` races the rAF that clears it. (Staggered CSS entrances must gate on a
      STABLE attr anyway — removing a trigger attr cancels pending animations; see
      tribune-charts REFERENCE.md.) Assert a DETERMINISTIC artifact
      instead (`points` count, path `d` non-empty, element present) and leave the enter FEEL
      to the user (they're the motion oracle). Never gate a test on a one-frame attribute.
- [ ] Cross-agent claims: parallel builders may cite each other's "patterns" that don't
      exist — verify any claim about a sibling file against the file, not the report.
- [ ] Overlay clipping: visx `ParentSize` wraps content in `overflow:hidden` — any
      chip/label positioned outside the strip is silently clipped. A builder flagging
      a risk in its report and shipping it anyway is still a defect; fix, don't note.
- [ ] `startTransition`/deferred emits inside a CONTROLLED component defer the
      component's own visuals (value drives both). Emit sync; the consumer defers the
      expensive derivation (`useDeferredValue`) — make the story the exemplar.
- [ ] Hit zones: `::after` sized by `inset-y-0` inherits the VISIBLE element's height —
      fat targets need explicit negative insets to cover the full interactive strip.
- [ ] Interaction spec without reference source = blind port. If the reference imports
      a part you weren't given (e.g. a brush), ask for that file BEFORE designing its
      feel; API signature alone doesn't carry the motion.
- [ ] **SVG text position helpers return `textAnchor`, NEVER `anchor`** — `anchor` is a
      bogus attribute React silently drops, so the label defaults to `text-anchor:start`
      and flows RIGHT of its x (looks like a centering bug). Latent behind fat bars;
      thinning EXPOSES it. Verify the rendered attr in the DOM, not the position math.
- [ ] **Full-circle arc paths DEGENERATE — a `<path A>` arc whose start point == end point
      draws NOTHING.** Any 360° sweep (radial-bar/gauge/ring at 100%, full track) silently
      vanishes. CAP the sweep at 359.99° (`FULL_SWEEP_CAP`) in `frame.ts` — invisible ~0.01°
      gap, always renders. Semi/partial sweeps are safe; the bug hides until a datum hits the
      domain max, so demo data rarely triggers it — assert with `maxValue` forcing a bar to
      100% (or eyeball a full ring). For variable-length arc DRAW-IN, normalize with
      `pathLength={100}` + `stroke-dashoffset` 100→0 transition — one CSS rule draws any bar
      regardless of arc length (the skeleton `pathLength=100` trick, reused as enter motion).
- [ ] **NumberFlow/Odometer baseline**: its box is taller than plain text (mask overflow
      for the roll) → in top-aligned columns the number sits off-baseline vs a sibling text
      value. Fix via a SHARED baseline context (grid: labels row 1, values row 2,
      `align-items:baseline`, divider = row-spanning cell — or inline), NEVER by touching
      the odometer animation. Confirm with digit-vs-text `getBoundingClientRect().bottom`.
- [ ] **Story `decorators` trip TS2742** ("inferred type of meta cannot be named") —
      annotate `const meta: Meta<typeof X> = {...}`, NOT `satisfies`, once meta has a
      decorator (e.g. the `maxWidth:560` cell wrapper).
- [ ] **Bare-render stories = "ugly" bug.** Every story wrapped in the `ChartShell` +
      `ChartShell.Stats` (DemoShell) editorial frame like bar/line — a component floating
      alone with no header/annotation chips will be rejected on sight vs a framed sibling,
      even when the chart itself is correct. Fixed-size charts centered in the body. Check
      the pasted reference's OWN framing (the eval'd EvilPie sat in a card w/ header) — port
      that chrome, don't ship the naked mark.
- [ ] **Tooltip per expressive variant**: variants with their OWN readout (trace line,
      monospace label) suppress the shared tooltip (`show={cursor!==null && !(isTrace||isMono)}`);
      data variants (grid/iso) keep it. Don't suppress one and forget its sibling.
- [ ] **3D/iso needs WIDTH** — depth distorts thin bars; demo few wide bars, not 12 thin
      months. Prefer per-face `fill-opacity` contrast (front 1 / top ~0.55 / side ~0.4)
      over per-bar gradient defs — the 3D read comes from opacity, and it stays tokenized.
      Shared NEUTRAL hatch pattern (one def); currentColor-per-bar patterns are browser-flaky.
