---
name: tribune-component
description: Build a new @jp/tribune design-system component, or adopt a raw-vertex one to the project standard. Drives the two-gate workflow (API proposal -> token map -> build -> Figma parity), enforces 3-tier tokens, cva-for-variants/data-attrs-for-state, and the no-raw-color rule. Use when the user says "new tribune component", "build the X component", "adopt X", "formalize X", or a feature needs a DS primitive that doesn't exist yet. Authority is ADR-0038.
---

# tribune-component

Spine for taking a tribune component from "needed" to "adopted", pixel-faithful to
Figma and uniform with the rest of the system. Claude already knows React, base-ui,
and CSS; this skill encodes only the non-obvious process that keeps a component
honest. Defaults, not rails. Authority and rationale: `docs/adr/0038-tribune-component-authoring.md`. Always-on invariants: `packages/tribune/CLAUDE.md`.

Argument: the component name, and whether it is **new** or an **adoption** of an
existing raw-vertex copy. If absent, ask.

## Prime directive: Figma is truth, never extrapolate silently

`CLAUDE.md` law: never eyeball or infer a design value. Every color, dimension,
duration, and easing either comes from an authoritative declared source, or is
**explicitly marked `@extrapolated` and approved**. A magic number with no marker is
a bug. The whole workflow exists to give the human and you one shared picture of what
you are building before you build it.

**The frame is anatomy, not a ruler.** A Figma frame (PNG/PDF/render) tells you which
part is which and which variable each references — read that. It is NOT a value
source: reading a color/measurement off a render IS eyeballing (and off a screenshot
of our own app, circular). Division of labor: **you own the slots** (enumerate each
token a part needs, propose the name, leave the value blank `‹FIGMA: ___›`); **the
human owns the values** (Figma Dev Mode readout, Variables API / token export, or
typed). You map *part → existing named token*, never *pixel → value*. Given only an
image with no inspectable values, emit the blank slot map and BLOCK for Dev Mode.

## The two gates

Both gates are cheap artifacts posted to the user inline. Do not write CSS before
Gate 2 is approved.

### Gate 1 — API proposal

Research first, then propose. The proposal is one block:

- **Primitive**: which `@base-ui/react` primitive this wraps (or "none — leaf").
  **Wrapping a primitive → context7 base-ui lookup is BLOCKING:** read its live
  parts / props / `data-*` state attrs before proposing, and let them drive the prop
  surface. Guessing base-ui shape is the failure mode this gate exists to kill. Leaf
  (`none — leaf`) → skip; no research tax.
- **Surveyed**: 2–3 reference APIs by name (shadcn / Radix Themes / Ark / MUI / Base
  UI) and the one idea taken from each. Use context7 MCP for live docs. **Compound
  (≥2 parts) → consult `vercel-composition-patterns` first** (compound / context /
  render-slot patterns are the hard part); `vercel-react-best-practices` for hook /
  perf shape. Leaf → these are optional.
- **Prop surface**: the props, and the variant **axes** (intent / size / variant /
  boolean). Mark which are author-selected (→ cva) vs runtime state (→ data-attrs).
- **Shape**: compound (`Object.assign` root + parts) iff ≥2 consumer-arranged
  structural parts; flat for a leaf. No mode-swapping booleans; children over
  `renderX`.

STOP. Human approves the shape.

### Gate 2 — Token map

Draw the full variant × state grid. Every cell resolves the chain and is tagged.
Template: `references/token-map-template.md`. Shape:

```
COMPONENT: <name> · variant=<v> · Figma frame: <node-id / page>
─────────────────────────────────────────────────────────────────────
STATE      COMPONENT TOKEN      → SEMANTIC            → PRIMITIVE     VALUE   SRC
default    --x-bg               --tbn-x-bg             --color-…      oklch…  ✅ figma:F-..
hover      --x-bg-hover         --tbn-x-bg-hover       --color-…      oklch…  ⚠️ EXTRAPOLATED
focus-ring --x-ring             --tbn-x-focus-ring     (…/0.4)        oklch…  ❌ MISSING
─────────────────────────────────────────────────────────────────────
DIMENSIONS: h-? · px-? · radius-? · gap-?            (each ✅/⚠️/❌)
MOTION:     duration-? · easing-? · press-transform-? (each ✅/⚠️/❌)
SRC: ✅ figma-confirmed · ⚠️ extrapolated (needs OK) · ❌ missing (BLOCK)
```

Rules for the map:
- **You fill the slots, the human fills the values.** Read the frame for anatomy,
  enumerate every token slot, propose the token name, leave the value column as
  `‹FIGMA: ___›`. Post it; the human reads each value from Dev Mode and fills it in
  (or confirms the proposed token). Never read a value off the frame yourself. An
  ASCII anatomy diagram with numbered slots makes the shared picture concrete.
- Enumerate the **full grid** — every variant against every state the API claims.
  An empty cell is caught here, not in prod. Do not skip `disabled`.
- `❌ missing` **blocks** — ask the human for the Figma value.
- `⚠️ extrapolated` is allowed only with a rationale and becomes an `@extrapolated`
  marker in the CSS. Get explicit approval for each.

STOP. Human reads it against the Figma frame and resolves every `⚠️`/`❌`.

## Build

Now write the component to ADR-0038 §2–6. **Exemplar = `button.css`** (full token
chain + `@apply` discipline). Do NOT anchor on `card.css` — it is the minimal-consumer
case (no `@layer base`, references shared tokens directly) and copying it drops the
per-component aliasing. Checklist while building:

- **Tokens, 3 tiers.** Per-component `@layer base { :root, [data-theme="light"] { … } }`
  block aliases EVERY token the rules use into a `--tbn-<cmp>-*` semantic (→ system
  token / primitive), exactly like `--tbn-btn-primary-bg: var(--color-brand-500)`.
  Rules then reference only `--tbn-<cmp>-*` (or the local `--<cmp>-*` remap tier) —
  never a foreign `--tbn-*` raw. Local `--<cmp>-*` tier only if stateful or
  multi-variant remap (JIT). Approved extrapolated values carry
  `/* @extrapolated(state): reason, pending HITL */`.
- **No raw literals in component rules.** `oklch`/hex only in the `@layer base` block.
  Never `var(--color-tbn-*)` in raw CSS — use `var(--tbn-*)`.
- **cva** iff ≥1 multi-value axis; else `cn()`. Variant → className → CSS (recipe).
- **State via data-attrs** from the primitive (`[data-disabled]`, `[data-state=…]`),
  never minted classes.
- **CSS:** `@apply` for static utilities; raw property only for `var()`-backed
  declarations / transitions / rings.
- `import "./<name>.css"` in the `.tsx` (un-imported CSS is dead, silent).
- Add the `exports` entry in `package.json` (no barrel).
- Write `<name>.stories.tsx` covering every variant × state cell from the map.

Run `pnpm -F @jp/tribune check:tokens` — it mechanically enforces the color rules and
structural items. Fix before proceeding.

## Definition of done

- `check:tokens` clean; typecheck clean.
- Hand the human the Storybook story URL + the variant×state list; ask them to eyeball
  parity against the Figma frame. They are the parity oracle — do not screenshot.
- Update the **adoption ledger** table in ADR-0038: set the row to `✅ adopted`, or
  `🟡 debt` with the remaining `@extrapolated` markers noted.

## Marketing family mode (`src/marketing/<name>/`, ADR-0060)

Same workflow, same gates, same tooling — different surface laws. Deltas only:

- **Semantic prefix `--mkt-<cmp>-*`**, not `--tbn-*`. Chain otherwise identical
  (primitive stays `--color-*` in tribune tokens; new primitive = HITL first).
- **ADR-0027 rem discipline**: every Gate 2 dimension/radius/motion-distance value
  lands in REM (`px/16`); raw px only for border/outline hairlines. The
  `rem-discipline` hook blocks violations.
- **Rounding + gradients are Figma-blessed** — no sharp-corner law, no pragma.
  Gradient = a token **pair** (`--mkt-<cmp>-grad-from/to`), two slots in the map.
- Import path `@jp/tribune/marketing/<name>`; exports entry same as ever.
- Product surfaces (admin/portal) must not consume the component — note it in the
  story description.
- Ledger: marketing components track in ADR-0060, not the ADR-0038 adoption table.

## Adoption mode (raw-vertex copy)

Same workflow, but Gate 1 starts from the existing API — survey whether it already
matches references, propose the delta. Then run the full ADR-0038 §7 checklist. The
common failures in vertex copies: raw `oklch()` in component rules, minted state
classNames instead of data-attrs, missing `@layer base` token block, no story.
