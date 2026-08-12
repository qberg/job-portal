---
name: adopt-from-reference
description: Plan and execute adopting architecture, packages, tooling, or workflow from a sibling reference repo (e.g. petition-management) into this one, then delegate the junior-shaped remainder as simple-English issues. Use when the user says "adapt/bring/port X from <sibling repo>", "plan this like we did in <repo>", or wants something set up that already exists in a sibling product.
---

# Adopt from reference

Role: senior architect + CTO. Bar: **additive over the reference** — deviate
only for a better solution, and record why. The reference repo paid for its
decisions in production; re-litigating them needs evidence, not taste.

## Phases

### 1. Recon (subagent, read-only)

Spawn a read-only investigator over BOTH repos. Ask for: the thing's location
and size; its law (ADRs, nested CLAUDE.md, skills); its test surface; and what
the target repo already pre-wired (turbo tasks, pnpm catalog, root scripts,
explicit deferrals in ADRs — a deferral being lifted must be amended, not
ignored). Main thread keeps conclusions, never file dumps.

### 2. Grill the fork points (invoke `grill-with-docs`)

One question at a time, recommendation first. The recurring forks:

- **Transfer mode**: curated fork (default) / wholesale / shared package —
  shared package is deferred until a 3rd consumer proves the need.
- **Naming**: the reference's vocabulary is company-wide (skills, docs, grep
  muscle memory transfer verbatim); only the pnpm scope changes.
- **Seed scope**: mechanism only; content arrives by demand-driven adoption,
  one task each. No pre-copied "core kit" (vertical-slice law).
- **Law transfer**: executable law (skills, package CLAUDE.md) copies
  verbatim; ONE fresh ADR imports reference history by link; superseded
  target ADRs get amended in place with a dated note.
- **Task split**: judgment work (pruning, token decisions) = senior;
  bounded + mechanically verifiable = junior issue.

### 3. Sort every carried rule: mechanism vs product

- **Mechanism** (token tiers, gates, pipelines, pitfall catalogs, build law)
  carries verbatim.
- **Product** (radius, fonts, brand colors, domain nouns, domain glyphs,
  marketing tokens) NEVER carries — replace from the target product's
  Figma/domain, or mark `/* @extrapolated: <reason>, pending HITL */`.
- Add a preamble note where copied law cites ADR numbers: they point at the
  REFERENCE repo's `docs/adr/`, not the target's numbering.

### 4. Execute the senior slice, gates green

- Rename scope everywhere, then `grep` for the old scope AND the reference
  product's nouns — zero leaks.
- Regenerate generated content (icons, ramps); never hand-edit `generated/`.
- Inherited red gates: fix the debt, or make a reasoned config delta (comment
  says why). Never bypass, never silently inherit red.
- Licensing check on binary assets (fonts, images) before they enter a
  public repo.
- All root gates green before delegating anything.

### 5. Record

Fresh ADR (Accepted with the landing PR), CONTEXT.md terms for any new
vocabulary, ADR index row, amended superseded ADRs.

### 6. Delegate

Junior issues use the six-part template (`.github/ISSUE_TEMPLATE/task.md`,
rules in `docs/process/issue-writing.md`): Goal / Why / Steps / Done means /
Check your work / Do NOT. One action per step, commands verbatim, reference
paths exact (`repo/path/file.ts`, never "look at how X does it"). File with
`gh issue create --label task`. The first issue must be fully unblocked by
the senior slice.

## Before ending — checklist

- [ ] grep old scope + reference product nouns → zero hits
- [ ] every eyeballed value carries an `@extrapolated` marker
- [ ] all gates green (`typecheck`, `check`, `check:tokens`, `knip`, `test`)
- [ ] ADR written + indexed; superseded ADRs amended in place, dated
- [ ] issues filed, junior-shaped, unblocked
- [ ] memory updated with locked decisions + pending HITL items
