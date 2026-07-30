---
name: verify-package
description: Verify a change in any package/app of this monorepo the right way — scoped commands, the no-NEW-errors baseline method, and the known-flake table. Use before declaring any slice done, when a test fails and you suspect a flake, or when deciding which checks a diff needs. Written for subagents (opus/sonnet/haiku) executing scoped work.
---

# Verify a package change

Gate for any slice = **no NEW failures**, never "everything green" — a repo this size will
eventually carry known pre-existing failures and shared-infra flakes. Method: capture baseline →
change → diff the failures.

## Commands (always scoped — never bare from repo root)

| Target | Typecheck | Tests | Lint |
| --- | --- | --- | --- |
| any package/app | `pnpm -F <pkg> typecheck` | `pnpm -F <pkg> test` | `pnpm exec ultracite check <paths>` |
| apps/api | same + `pnpm -F @jp/api check:arch` (dep-cruiser) | needs local `_test` Postgres (vitest globalSetup migrates it) | same |
| design-system pkg (once one exists) | `pnpm -F <ds-pkg> typecheck` | TODO(exemplar): first job-portal module pending | same |
| repo-wide sweep | `pnpm exec turbo run typecheck --continue` | `pnpm exec turbo run test --continue` | root `pnpm check` (count vs baseline) |

Hard rules (a PreToolUse hook enforces most): never root `pnpm fix` (scoped `ultracite fix <paths>`
or `pnpm -F <pkg> fix`); never raw `npx biome`; never run api tests from repo root; never read `.env`.

## Cross-package guards — the check lives in a package your diff never touched

Some vocabularies are split across packages **on purpose**, so no compiler links them and a
scoped typecheck of the packages you edited proves nothing. The guard is a test somewhere else.
Run it by hand; nothing in your diff points at it. petition-management's concrete case was a
DS package that deliberately had no dependency on `domain-types`, so a shared enum (icon/glyph
keys) needed a hand-maintained, self-keyed registry with its own coverage test — an unregistered
key silently rendered a default with no type or runtime error. job-portal doesn't have this
guard yet:

TODO(exemplar): first job-portal module pending — when a vocab gets deliberately split across
packages here, document the guard test in this table (what changed → what else to run → why).

## No-NEW-errors method

1. Before editing: run the scoped typecheck/tests once; record failures (or trust a baseline the
   orchestrator gave you).
2. After editing: rerun; report only the delta.
3. When unsure whether an error is yours: **NEVER `git stash`** — on a shared branch with
   concurrent agents a repo-wide stash can nuke another agent's work. Instead:
   `git status --porcelain` (is the failing file even in your diff?) + `git log -1 -- <file>`
   (last touched by an unrelated commit = pre-existing). Need a real clean-tree run:
   `git worktree add` a throwaway checkout, never stash.
   For lint: run `ultracite check` on exactly your touched files — pre-existing repo noise stays out.

## Known flakes & pre-existing failures

None recorded yet — job-portal has no packages/apps built yet, so there is no verified flake
history to carry over. Do NOT invent entries here. Seed this table for real the first time
`/verify-package` surfaces a genuine flake or pre-existing failure: record what failed, the
one-line cause, whether an isolated rerun cleared it, and the date verified.

## Reporting contract

Failures only. Passing = one line `N passed`. A failure needs: file, assertion/error, one-line cause,
and whether the isolation rerun cleared it. Never paste full runner output.
