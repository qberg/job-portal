# CLAUDE.md — apps/api

> Hexagonal + vertical-slice + CQRS-lite. STRICT. `pnpm check:arch` (dep-cruiser) gates it at Stop. Don't fight it — match it.
> Rationale + alternatives rejected → **ADR-0034** (refines ADR-0016 buckets). This file = the rule; the ADR = the why.

## Buckets (ADR-0016)

`kernel/` mechanism, zero domain nouns · `shared/<ctx>/` cross-context domain · `modules/<ctx>/` one context's language. Deps inward: modules → shared → kernel. Never reverse.

## Segments — every module/context mirrors this (JIT, no empty dirs)

```
modules/<ctx>/
  domain/              pure logic. NO IO. hexagon core.
  <aggregate>.model.ts persistence contract: Row types + Scope VO + scope SQL helper. leaf. JIT (only when query AND repo share it).
  query/    *.query.ts READS. driven adapter (read side).
  repo/     *.repo.ts  WRITES/mutations. driven adapter (write side).
  commands/ *.command.ts  use-case orchestration. tx. returns Result. THE orchestrator.
  handlers/ *.handler.ts   oRPC driving adapter. THIN.
```

## Hexagonal map

- `domain/` = core. pure fns. in: `@jp/domain-types`, `valibot`, `@jp/auth/can`, contract schemas, `node:*`. NOTHING else.
- `query/` + `repo/` = driven adapters → DB port. in: `<x>.model`, `@jp/database`, `drizzle`, `domain`.
- `commands/` = application service. orchestrate domain+repo in a tx. transport-agnostic (callable from CLI/job/test). returns `Result<T,E>`.
- `handlers/` = driving adapter ← oRPC. authz gate → delegate → map DTO/error. NOTHING more.

## STRICT rules (dep-cruiser enforced)

1. **domain pure.** no `@jp/database`, no `drizzle`, no `@jp/cache`/`@jp/logger`, no query/repo/commands/handlers/orpc. pure fns only.
2. **query READS, repo WRITES. never blur.** a DELETE is a write → `repo/`. NEVER put a mutation in a `.query.ts`.
3. **query ⊥ repo.** neither imports the other. shared Row/Scope/helper → `<aggregate>.model.ts`.
4. **handler = THIN.** authz + delegate + map. NO business logic, NO orchestration, NO direct `drizzle`/`@jp/database`. handler is NOT the orchestrator — the **command** is.
5. **command = orchestrator.** wires domain+query+repo in a tx, returns `Result`. transport-agnostic. no oRPC/handlers/rpc imports.
6. **read path:** `handler → query`. no command (a command wrapping one read = ceremony).
7. **write path:** `handler → command → repo` (+domain/model). EXCEPTION: a single atomic statement (one `INSERT`/`DELETE … RETURNING`, e.g. AIP-235 batch) may go `handler → repo` direct. **command exists only when a write spans ≥2 repo ops OR needs domain decisioning inside a tx.** No empty pass-through commands.
8. **cross-module** via `command`/`query`/`repo` is fine (petitions promotes an engagement draft). NEVER import another module's `handlers/` — that's its private wire surface.
9. **`model.ts` is a leaf.** in: `@jp/database`, `drizzle`, `@jp/domain-types` only. imported by query/repo/commands/mappers.
10. **composition root** = `rpc/router.ts` + `kernel/orpc/handlers.ts` (mounts router). modules/shared never import it.

## Errors (ADR-0042 — errors as values in core, translate at boundary)

- **Core returns values, never transport errors.** `domain/query/repo/commands` can't import `kernel/orpc` (dep-cruiser). Absence = `null`; richer failures = `Result` `err({code})`. `throw` = programmer error only.
- **Commands return `Result<T,E>`** — NOT `T|null`. Enforced by `src/test/architecture.test.ts` (ts-morph). Reads (`handler→query`) return `T|null`.
- **Boundary translation:** read → `requireFound(value, resource, id)` (kernel/orpc → leak-safe 404), no ad-hoc `if(!row) throw`. Command single-error → inline `if(isErr) throw notFound(...)` (view-url precedent). Command multi-error → `<x>.error-map.ts` exhaustive switch. A one-member `Result` error-map is a smell (and trips TS2322) → map inline.
- **Shared adapters for a shared command live at the module root** (`<ctx>/asset.mapper.ts`, `<ctx>/upload.error-map.ts`), never in one audience's `handlers/` (sealed to cross-module import).
- Every error path = a test.

## Stack gotchas (see also root CLAUDE.md)

- oRPC authz = base proc (`authed`/`citizenAuthed`/`pub`) in `kernel/orpc/builder.ts`. audience = which base proc, not a router branch.
- Petition authz = `shared/petition-scope/` (ADR-0090): `petitionScopeGate` (coarse, 3 axes) + `canActOnPetitionRow` (row-level, dispatched by the row's registry `scopeStrategy`) + `PETITION_{READ,CREATE,UPDATE}` quartets; `shared/ward-scope/require-permission`. The ONLY implementation — `wardGate`/`wardScope`/`wardMatch` are DELETED (one axis could never gate three). Domain predicates (`canReadPetitions`, `canSaveDraft`, `draftScope`, …) are thin delegations; pass the whole `context` (it satisfies `StaffScopeAxes`). Never hand-roll a scope literal or `throw forbidden(...)` in a handler — `requirePermission(gate, PETITION_*_PERMISSIONS)`. Sentinels are per-axis: `allWards` widens ward rows ONLY, `allDepartments` department rows ONLY; only `:all` is global. A helper that collapses a sentinel into "everything" leaks other axes' PII.
- New lifecycle transition = a descriptor row in `commands/status-transitions.ts` (factory covers commands whose error is exactly `TransitionGuardError`; wider unions — attachments, dept-lookup — get explicit files that delegate shared arms to `handlers/transition.error-map.ts`).
- Cached reference list = a node in `shared/reference/reference.cache.ts` + `cachedReferenceListHandler(node, query)` — never inline a `db:reference:*` key string (CLI invalidation derives from the same node; drift = stale cache).
- oRPC no-input → OMIT `.input()`. NOT `v.void()` (breaks Scalar GET 400).
- IDs uuid v7 (keyset-friendly, time-ordered). valibot not zod. cyclomatic ≤5/fn.
- tx-retry OUTSIDE the tx (constraint retry wraps `db.transaction`, see `register-petition.command.ts`).
- run tests: `npx vitest run <path>` from `apps/api` (NEVER root).
- postgres.js can't bind raw `Date` inside sql`` template (runtime Bind TypeError, typecheck green) — build cond with typed comparators (`lte`/`gt`), embed fragment: `count(*) filter (where ${cond})`.
- conditional query shape (optional join/groupBy) = drizzle `.$dynamic()`, not branch-duplicated builders.
- oRPC-seam tests, no app.ts boot (env too strict for vitest): `call(handler, input, {context})` from `@orpc/server` = FULL pipeline (middlewares + input/output validation; validation AFTER auth → contract-rejection tests need valid session). Recipe: initDatabase(test) → initAuth(test secret) → signUpEmail + role UPDATE + signInEmail({asResponse:true}) → set-cookie into injected `request`. Exemplar: `modules/insights/handlers/query.handler.test.ts`.
- CLI call command = add `exports` subpath in `apps/api/package.json` (`"./petitions/x": "./src/.../x.command.ts"`, raw TS) + `@jp/api` dep in caller. only command graph bundles (db/domain/repo/outbox, NOT hono/orpc). commander eats `--flags` unless `program.enablePositionalOptions()` + `.command("job").passThroughOptions()`.
