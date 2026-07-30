# ADR-0003 — Architecture shape: inward dependencies, pure leaf types, lazy packages

**Status:** Accepted

**Date:** 2026-06-13

## Context

The codebase must stay scalable and maintainable over a multi-year engagement,
with new job-portal feature verticals (matching, applications, employer
tooling) arriving over time. We needed a rule for how bounded contexts map onto
the physical monorepo. The tempting "every context = its own package" was
rejected as false symmetry: it manufactures workspace-graph nodes, version
churn, and cross-package import gymnastics for boundaries a folder already
enforces. The sibling `petition-management` repo (this repo's architecture
donor) proves a leaner split.

## Decision

1. **The invariant — dependencies point inward.** A pure core depends on nothing
   effectful; the effectful shell (HTTP, DB, SDKs, queues) depends on the core.
   Nothing impure leaks into the pure layer. Enforced by `dependency-cruiser`.

2. **Bounded contexts are a logical map, not a packaging scheme.** `CONTEXT-MAP.md`
   lists them; physical layout is decided by the shared-library test below.

3. **`packages/domain-types`** — pure, leaf (only `typescript` as a dep), JIT
   (consumed as raw `.ts` via per-subpath `exports`, no build), foldered by
   context. Holds types, status unions, ABAC/roles, and dependency-free pure
   rules (e.g. `canTransition`). Safe for both frontend and backend. Mirrors
   `petition-management`.

4. **Runtime domain logic** (xstate FSMs, use-cases, validation) lives as
   `apps/api/src/modules/<context>/` — not a package.

5. **A folder becomes a package only when ≥2 deployables import it** (the
   shared-library test). Day-1 shared packages: `db`, `notifications`, `ai`,
   `outbox`, `contracts`, `utils`, `logger`, `env`, `auth`, `ui`. Runtime domain
   logic is extracted to a focused package *lazily*, only when a second
   deployable genuinely runs it (e.g. lifting an Application FSM into
   `packages/application-machine` if `matching-worker` must execute it).

## Consequences

- `dependency-cruiser` rules are load-bearing and must be maintained as
  boundaries are added.
- Per-context `CONTEXT.md` glossaries live in `docs/contexts/<context>/` until
  the first slice creates the module, then relocate next to the code.

## Alternatives considered

- **Every bounded context = its own workspace package.** Rejected: manufactures
  workspace-graph nodes, version churn, and cross-package import gymnastics for
  boundaries a folder already enforces.
- **Extract packages eagerly, ahead of a second consumer.** Rejected: guesses at
  a package boundary before real usage proves it; the lazy/JIT rule keeps
  extraction a mechanical move instead of a rewrite.
