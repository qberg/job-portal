# ADR-0014 — Tribune as curated fork, Storybook harness with it

**Status:** Accepted

**Date:** 2026-08-06

## Context

`petition-management` grew a mature design system, `@pm/tribune` (~80
components, 718 files): a 3-tier token vocabulary (primitive → semantic
`--tbn-*` → component-local), a strict authoring law (its ADR-0038 two-gate
API/token workflow, chart doctrine, biscript ink alignment for Tamil/Latin),
and Storybook `play()` stories as its **only** test surface. job-portal's
public surface is Tamil-first bilingual on low-end Android, so the typography,
font, and ink-alignment machinery is directly needed — not nice-to-have.

ADR-0013 carried petition-management's architecture but deliberately dropped
both the Storybook app ("no component library large enough") and any UI
package. First real screens (Figma) are now imminent, which forces the
decision this ADR records: *how a design system crosses between Minsky
products*. Whatever we choose here becomes the company pattern the next
product mimics, so the bar is: at least as good as petition-management's
practice, deviating only where we found something better.

## Decision

1. **Curated fork, not shared package, not wholesale copy.**
   `packages/tribune` (`@jp/tribune`) is an independent fork. Each product
   owns its tribune; there is no cross-repo versioned dependency.
   Improvements travel between products by deliberate adoption, not by
   automatic sync.

2. **The name and vocabulary are company-wide; only the scope changes.**
   The package is named `tribune` and the semantic token prefix stays
   `--tbn-*` in every product. Tribune is the company design-system
   *pattern*: skills, docs, ADR law, and grep muscle memory transfer verbatim
   across repos. Only the pnpm scope (`@pm/` → `@jp/`) is product-specific.

3. **The seed is mechanism only — zero components.** The initial fork carries:
   package scaffold (JIT-compiled, no build step), 3-tier token files,
   typography including the public-surface composite tokens and `:lang(ta)`
   font swap, the Tamil font stack (Noto Tamil admin, Ila Sundaram public)
   with biscript ink alignment (`--tbn-ink-shift`, `--tbn-icon-anchor`), the
   icon-generation pipeline, the `styles` / `public` entry points, and the
   binding authoring law copied **verbatim into `packages/tribune/CLAUDE.md`**.

4. **Components arrive by adoption, one task each.** A component crosses from
   petition-management's tribune only when a real screen needs it, together
   with its stories, and is reviewed against the authoring law. No pre-copied
   "core kit".

5. **`apps/storybook` (`@jp/storybook`) lands with the seed.** Same harness as
   petition-management: Storybook 10.3.3 + react-vite, addons (docs, a11y,
   themes, links, vitest), and vitest browser-mode `play()` tests via
   Playwright. The harness is mechanism, and it is tribune's only test
   surface — the first adoption task must be able to ship green tests. This
   **lifts ADR-0013's Storybook deferral** (0013 amended in place).

6. **Executable law is copied, historical reasoning is referenced.** The
   design-system skills (`tribune-charts`, `adopt-chart-component`,
   `verify-package`) are copied verbatim into this repo during the seed. The
   petition-management ADRs behind them (0038 and relatives) are linked for
   history only — the binding text lives in-repo (`packages/tribune/CLAUDE.md`
   plus the skills), so this repo still reads correctly standalone,
   consistent with ADR-0013's no-pointer rule.

## Consequences

- Divergence between the two tribunes is expected and accepted. Backporting
  improvements is manual. If a **third** product appears and the copying cost
  hurts, that is the trigger to revisit extraction into a shared package —
  with real evidence, not speculation.
- The pre-wired `@jp/storybook` scripts in the root `package.json` and the
  `storybook` / `build-storybook` tasks in `turbo.json` stop being dead
  configuration.
- Storybook `play()` tests join the `test` gate in CI; a tribune component
  without stories is unmergeable by existing review law.
- knip stays honest: because the seed has zero components, nothing is
  exported-but-unused. Every adoption is pulled by a consuming screen.
- Deploying the built Storybook (petition-management serves its at a public
  URL) is **not** decided here; it needs no decision until there is something
  worth publishing.

## Alternatives considered

- **Wholesale fork (all 718 files).** Rejected: imports ~80 components with
  petition-era `@extrapolated` tokens nobody reviewed, knip and half-a-product
  law both scream, juniors inherit dead code.
- **Shared company package (own repo / npm scope).** Rejected for now:
  publishing, semver, and breaking-change coordination are heavy ceremony for
  a solo-plus-juniors team with two products. Revisit at the third product.
- **Rename per product (`--jp-*` prefix).** Rejected: kills verbatim skill and
  doc transfer, forces token-rename churn in every adopted file, makes juniors
  relearn vocabulary per project — the opposite of additive knowledge.
- **Re-write the tribune ADR corpus (900+ lines) as job-portal ADRs.**
  Rejected: duplicated prose drifts from the living law; the law's home is the
  package `CLAUDE.md` and the skills, which we copy instead.
- **Keep Storybook deferred (ADR-0013 stance).** Rejected: once tribune
  exists, adoptions without the harness would ship untested, violating the
  test gate.
