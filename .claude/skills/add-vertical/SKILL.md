---
name: add-vertical
description: Layer-by-layer recipe for adding a new endpoint or feature vertical to the modular monolith — domain-types vocab → database schema → api-contract → oRPC handler → FE consumption, with every repo gotcha at its point of use. Use when adding an endpoint, contract, handler, module, or any feature that spans db→api→ui. Written for executor agents of any size — follow it literally, exemplar = TODO(exemplar): first job-portal module pending.
---

# Add a vertical slice

One slice = one thin path end-to-end, smoke-tested before the next begins. Bucket first:
`kernel/` = mechanism zero domain nouns; `shared/` = cross-context domain;
`modules/<ctx>/` = one context's language. Deps flow modules → shared → kernel, never reverse.
Mirror lazily — no empty layers. **Exemplar to copy:** TODO(exemplar): first job-portal module pending.

## Layer walk (in this order)

### 1. Vocab — `packages/domain-types`
Path: `src/modules/<ctx>/*.ts` (or `src/shared/`, `src/kernel/`). Patterns
(TODO(exemplar): first job-portal module pending):
- Values: `X_VALUES = [...] as const satisfies readonly X[]` → feeds valibot `picklist()`.
- Registries: `as const satisfies Record<string, T>`; key arrays ALWAYS derived —
  `Object.keys(Registry) as readonly KeyId[]` — never hand-listed (satisfies can't force
  completeness; hand-list silently drops new entries from picklists).
- FSM transitions: `Record<Status, readonly Status[]> satisfies`.
FE/BE/DB all import from here — never redeclare an enum elsewhere.

### 2. Schema — `packages/database`
Path: `src/schema/modules.schema/<ctx>/*.schema.ts`; register the namespace in
`src/schema/registry.ts` (spread into `schema`). Then follow the `/db-change` skill for
generate/migrate/downstream. Invariants (CHECK/FK/NOT NULL) live in schema; wrap domain
status values from domain-types, never free-text.

### 3. Contract — `packages/api-contract`
Path: `src/modules/<ctx>/<name>.contract.ts` + `<name>.input.ts` / `<name>.resource.ts`.
- **NO wildcard export.** Every new subpath import needs an explicit `exports` entry in
  `packages/api-contract/package.json` (e.g. `"./<ctx>/<name>-input": "./src/modules/<ctx>/<name>.input.ts"`)
  BEFORE any consumer imports it — else module-not-found.
- GET with no args → **OMIT `.input()` entirely.** Never `v.void()` (OpenAPIHandler injects
  `{}` → Scalar GET 400; RPC path works so tests miss it). Never `object({})`.
  Optional GET args → `.input(object({ x: optional(...) }))` = query params.
- Path param: `.route({method:"GET", path:"/<resource>/{id}"})` — path key binds to the SAME
  input key name.
- Bulk action = AIP-235 batch: `POST /res/batch-delete` `{ids}` → `{results:[{id,status}]}`;
  partial success is contract, not error; one SQL `IN(ids) RETURNING`, no `Promise.all` fan-out.
- valibot: NAMED object schemas; `.check(pred)` callback arg typed as
  `InferOutput<typeof Schema>` (inline/narrowed arg trips TS2769 under
  `exactOptionalPropertyTypes`). Export types via `InferOutput<typeof X>`.
- Assemble the flat key in `src/contract.ts` (`appContract`) — flat keys, NO audience
  namespaces. Audience = which base procedure (step 4), not a router branch.

### 4. Handler — `apps/api`
Path: `src/modules/<ctx>/handlers/<name>.handler.ts`, mirrors contract keys; register in
`src/rpc/router.ts` `appRouter` under the SAME flat key.
Base procedures (`src/kernel/orpc/builder.ts`): `pub` (no auth), `authed` (staff/internal session +
`can`/permissions), plus any additional audience-scoped procedure this app needs
(TODO(exemplar): first job-portal module pending). Pick by audience.
Handler shape (TODO(exemplar): first job-portal module pending): permission check → command/repo call →
`isErr(result)` → mapped domain error, else map row → resource. Runtime errors = `Result<T,E>`;
programmer errors = `throw`. Authz: ownership ≠ eligibility; read-scope ≠ write-scope — thread
the scope sentinel through EVERY helper; zero-scope → `sql\`false\``, out-of-scope read → 404.
Async side-effects → stage outbox job in the same txn (`/outbox-job` skill).

### 5. FE — consumption
- **web-admin** (SPA): `src/shared/api/orpc.ts` client; per-entity query factory
  (`src/entities/<x>/api.ts`) returning `client.<flatKey>.queryOptions()` /
  `.mutationOptions()` with optimistic onMutate/onError-rollback; components use
  `useSuspenseQuery`. Admin surface = design tokens + Tailwind scale only (Quality Bar).
- **web-public** (RSC): server client `src/shared/api/orpc.server.ts` (forwards cookies).
  Strings through Lingui (`/i18n-strings` skill).
- Flow state = xstate, never useState booleans + ternaries. Derive during render; effects only
  for external systems.

## Verify

Scoped: `pnpm -F @jp/domain-types typecheck && pnpm -F @jp/api-contract typecheck &&
pnpm -F @jp/api typecheck` + touched FE pkg. Lint = scoped `ultracite fix <paths>` (NEVER raw
biome, NEVER root `pnpm fix`). Arch = `pnpm check:arch` (Stop-hook enforces). Full cadence +
known flakes = `/verify-package`. Every error path gets a test. End with honest AC status;
user owns commits.
