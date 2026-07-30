---
name: db-change
description: Repo-correct workflow for any Postgres schema change — drizzle schema edit → generate → review SQL → migrate → downstream sync (seed/cache/Meili). Use when adding/altering tables, columns, enums, constraints, or indexes, when writing a migration, or when a schema change must propagate to seeders, cache, or search. Written for executor agents of any size — follow it literally.
---

# DB change — the one flow

Schema truth lives in `packages/database/src/schema/**/*.schema.ts` (glob-registered by
`drizzle.config.ts` — a new `*.schema.ts` file is picked up automatically, no barrel edit).
Migrations are **drizzle-generated, never hand-authored**, output to `packages/database/drizzle/`.
Casing is `snake_case` via config — write camelCase in TS, never hand-snake column names.

## Steps

1. **Vocab first, schema second.** If the change involves a cross-boundary enum/status/role,
   declare it in `@jp/domain-types` (`as const satisfies`, DERIVED key arrays via
   `Object.keys(Registry) as readonly Key[]`) BEFORE touching the schema. DB mirrors it as
   `text` + CHECK constraint (never a PG enum for domain statuses).
2. **Edit the schema file.** Bucket placement mirrors the kernel/shared/modules law:
   `kernel.schema/` (mechanism, e.g. `outbox.schema.ts`), `shared.schema/`, `modules/<ctx>`
   pattern. Invariants belong IN the schema — CHECK, FK, NOT NULL, unique — app-level checks
   are UX fast-path only. Exemplars with CHECKs+FKs: TODO(exemplar): first job-portal module
   pending.
3. **Generate:** `pnpm -F @jp/database db:generate` → READ the emitted SQL in
   `packages/database/drizzle/` line by line before proceeding. Wrong SQL = fix the TS schema
   and regenerate; never edit an emitted file to patch generator output.
   - Hand-SQL exceptions (only these): `ALTER TYPE … RENAME VALUE` for non-destructive enum
     renames; `EXCLUDE` constraints (no drizzle builder). Expression indexes round-trip clean —
     use the builder.
4. **Apply:** local `pnpm -F @jp/database db:migrate`. Staging/prod migrations go ONLY through
   this repo's ops tooling once it exists (TODO(exemplar): first job-portal module pending) —
   never export STAGING_DB/PROD_DB by hand.
5. **Downstream sync — check every box:**
   - Reference/catalog data changed → re-run this repo's seed/cache-flush tooling once it
     exists (TODO(exemplar): first job-portal module pending).
   - Search projection touched → backfill via outbox claim-check jobs for the affected search
     index (job name per this repo's queue registry — see `/outbox-job` skill). Worker is the
     SOLE Meili writer. New filterable attr must be in `ensureIndex` settings — filtering on an
     undeclared attr = Meili 400 at runtime.
   - Cache-aside keys whose source you wrote → the WRITER busts the key (`@jp/cache/invalidate`
     `invalidatePrefix`). Never rely on TTL.

## Laws & gotchas (violations = review rejection)

- **Shared branch, concurrent agents.** Another agent may land a migration under you. Before
  generating, pull/check `drizzle/meta/_journal.json`; if your generated number collides with a
  freshly-landed one, delete YOUR generated file and regenerate. Never renumber someone else's.
  Never `git commit --amend`.
- **Applied ≠ committed.** A migration can be applied to local/staging DB yet uncommitted, or
  committed yet unapplied to an env. Your final report MUST state both facts explicitly per env
  ("migration 00XX: committed, applied local, NOT applied staging").
- **Never edit an already-applied migration.** New migration on top, always.
- **Outbox staging is transactional.** Any async side-effect of a write (search sync,
  notification) is staged into `outbox_jobs` INSIDE the same business transaction — see
  `/outbox-job` skill. Schema: `packages/database/src/schema/kernel.schema/outbox.schema.ts`.
- **Timestamps:** valibot `isoTimestamp` admits tz offsets — order-compare via
  `new Date(x).getTime()`, never string `<`. Don't mix app clock with DB `now()` in one window
  computation.
- **Tests:** every new error path (CHECK violation, FK violation you surface) gets a test.
  Shared test-DB runs parallel — unique-per-test ids, teardown scoped to your ids only.
- **TS strictness:** index access is `T | undefined` (`noUncheckedIndexedAccess`); optional
  insert fields need conditional spread `...(cond ? { x } : {})`, never `{ x: undefined }`.

## Done =

`pnpm -F @jp/database db:generate` idempotent (no diff), migrate applied, downstream boxes
checked, `/verify-package` cadence run on touched packages, honest status report (incl.
applied-vs-committed per env). You do NOT commit — the user owns commits.
