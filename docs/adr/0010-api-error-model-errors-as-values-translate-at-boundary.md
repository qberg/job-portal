# ADR-0010 — API Error Model: Errors as Values in the Core, Translate at the Boundary

**Status:** Accepted. Refines ADR-0008 (named the hexagonal segments; left the
error *contract between segments* underspecified — only "commands return
`Result`, handlers map via `error-map`").

**Date:** 2026-06-29

## Context

ADR-0008 says commands return `Result`, but prose alone does not hold on its
own: an agent can slip a command to `Promise<T | null>`, or lift a read with an
ad-hoc `if (!row) throw notFound(...)` scattered in the handler. Both pass
typecheck and lint. dep-cruiser already bars the core (`domain/query/repo/commands`)
from importing `kernel/orpc`, so the core *cannot* throw oRPC errors — but it is
blind to return *types*, so `Result` vs `T | null` is invisible to it, and
biome has no type-aware lint. The error model needs one named shape per path,
and the mechanizable part needs a type-aware gate.

## Decision

Errors are values in the core; only the boundary (the oRPC handler / a
`kernel/orpc` helper) constructs transport errors.

| Path | Core returns | Boundary translates via |
| --- | --- | --- |
| read (`handler → query`, no command) | `T \| null` | `requireFound(value, resource, id)` → 404 (leak-safe) |
| command, single failure mode | `Result<T, E>` (one-member `E`) | inline `if (isErr(r)) throw notFound(...)` |
| command, multiple failure modes | `Result<T, EUnion>` | `<x>.error-map.ts` exhaustive switch → typed oRPC errors |

Rules:

1. **Core never throws transport errors.** `domain/query/repo/commands` cannot
   import `kernel/orpc` (dep-cruiser). Runtime failures are values: `null` for
   absence, `Result` `err({code})` for richer domain/persistence failures.
   `throw` is for programmer errors only.
2. **Commands return `Result<T, E>`** — never `T | null`, never `void`-on-success.
   Absence/precondition outcomes are `err` codes, not `null`. (arch-test
   enforced.)
3. **Reads return `T | null`** (no `Result` ceremony — reads have no command
   per ADR-0008) and are lifted at the boundary by `requireFound`. No bespoke
   `if (!row) throw` in handlers.
4. **One-member `Result` error-maps are a smell** — map inline at the handler;
   do not write an exhaustive-`never` switch over a single code (it also trips
   TS2677/2322).
5. **Shared adapters for a shared command live at the module root**
   (`<ctx>/asset.mapper.ts`, `<ctx>/upload.error-map.ts`), never inside one
   audience's `handlers/` — the whole `handlers/` dir is sealed to cross-module
   import (`no-foreign-module-handlers`, `handlers-are-the-sink`).
6. **Every error path has a test** (unchanged from ADR-0008).

## Consequences

Uniform handlers (read = `requireFound(await query())`, command = `isErr` →
map); the security-relevant translation lives in one place per path and cannot
drift silently; new conventions get added as arch-tests rather than prose.

## Alternatives considered

- **Prose-only convention (no mechanical gate).** Rejected: this is exactly
  what ADR-0008 tried and an agent slipped past it; type-aware enforcement is
  needed because return-type violations pass both typecheck and lint.
- **Bespoke `if (!row) throw` per handler.** Rejected: scatters the
  leak-safety decision (what a 404 may reveal) across every handler instead of
  one `requireFound` helper.
- **`Result` for reads too.** Rejected: reads have no command per ADR-0008, so
  wrapping a plain lookup in `Result` ceremony buys nothing.

## Enforcement (because prose rots)

- dep-cruiser: core cannot import `kernel/orpc`; `handlers/` is import-sealed.
- arch-test (`src/test/architecture.test.ts`, ts-morph): every exported
  `modules/*/commands/*.command.ts` function returns `Promise<Result<...>>`.
  Catches the `T | null` slip mechanically; a missing/foreign return
  annotation also fails.
- `requireFound` + the `error-map` convention are documented in
  `apps/api/CLAUDE.md`.
