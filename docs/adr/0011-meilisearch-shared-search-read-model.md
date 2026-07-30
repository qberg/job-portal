# ADR-0011 — Search: self-hosted Meilisearch as a shared, outbox-synced CQRS read-model

**Status:** Accepted

**Date:** 2026-07-07

## Context

Internal user management (staff/recruiter directory) is expected to scale to
thousands of office users, searched as-you-type with typo tolerance and
Notion/iOS snappiness. A naive petition/job-ledger search built on Postgres
`ILIKE`/tsvector plus a client that flashes to a skeleton every keystroke is
the anti-pattern we are explicitly not repeating. We need one search
capability the office-user list uses first and the job listings ledger adopts
next.

## Decision

- **Self-hosted Meilisearch** as the search engine (docker-compose accessory +
  Kamal accessory; `MEILI_URL` / `MEILI_MASTER_KEY`). Chosen over Typesense for
  DX + best-in-class typo tolerance + single-binary ops; over Postgres
  `pg_trgm` because we want a real, shared search service (the job listings
  ledger migrates next), not a per-table hack. **Rejected Algolia** — a US SaaS
  would ship staff/candidate PII off-box and break the residency posture this
  repo enforces elsewhere. Reuse-before-add is satisfied by making search a
  *deployed shared capability*, not a one-off.
- **`@jp/search`** = an IoC port package: an `ensureIndex/index/search/remove`
  interface (`index` is batch — `SearchDocument[]`; `ensureIndex` idempotently
  declares searchable/filterable/sortable attributes, without which Meili
  rejects every filter), a Meilisearch provider (all writes
  `waitTask({timeout: 30_000})` — the client default 5s throws on tasks that
  succeed server-side → spurious retries), and a **Fake** provider for tests —
  mirrors `@jp/ai`, `@jp/notifications`, `@jp/storage`. The Fake matches
  string *values* only (never JSON keys) and applies a minimal `=`/`IN`/`AND`
  filter grammar that throws on unparseable filters or undeclared attributes —
  no false green. `resolveSearch()` **fails fast in production** when creds
  are unset (a silent Fake fallback splits the read/write processes: worker
  indexes real Meili while the api reads its own empty in-memory Fake); dev
  warns once and uses the shared Fake.
- **Meilisearch is a CQRS read-model, Postgres stays the source of truth.** The
  list read path (`access.staff.list`) queries Meili (typo search + role/
  status/department facet filters + sort + pagination + highlighting). Meili
  never holds authority; it is a projection.
- **Sync = the transactional outbox (ADR-0009), claim-check payload.** Every
  staff write stages **one `search.sync` job carrying `{index, entityId}`
  only** in the business txn → relay → BullMQ worker looks up the index's
  entry in an injected **projection registry** (`{settings, project(entityId)}`),
  re-reads current Postgres state, and upserts the doc — or removes it when
  the projection returns null (deleted / out-of-scope). Snapshot payloads lose
  to retry-reorder (a transiently-failed v1 job retrying after v2 completes
  overwrites the index with stale data; a reordered remove resurrects deleted
  docs); re-reading canonical Postgres at processing time converges under any
  ordering. The worker `ensureIndex`es every registered index at boot. **The
  writer keeps the index fresh** (same discipline as cache-aside invalidation);
  the API never writes Meili directly, and the worker is the only Meili
  writer — and the only place that builds the denormalized doc (the
  projection), so there is no doc-shape contract between command and indexer
  to drift.
- **The <1s index-lag window is covered by an optimistic client**: a newly
  invited row / a deactivation flips instantly client-side; the index catches
  up. No dual-read complexity.
- **Client contract (the actual snappiness), idiomatic TanStack** — Router
  `validateSearch` (valibot) owns `q/role/status/department/view` in the URL;
  TanStack Query keyed on the **debounced** query with **`placeholderData:
  keepPreviousData`** (never flash to skeleton) so out-of-order responses are
  discarded by key and stale results stay dimmed until the swap; the shared
  trailing-edge `useDebouncedValue` (~200ms, in `shared/lib`) batches
  keystrokes; virtualized `DataTable` for large lists. No new client lib —
  a correct ~8-line debounce buys everything needed; scale-robustness lives
  in the Query key contract + server-side bounded results, not the debounce.

**Performance is enforced, not asserted:**

- **Latency SLO:** server **p95 < 50ms**, perceived (post-debounce first
  paint) **p95 < 120ms**. Meili returns `processingTimeMs` per response; log
  it plus handler duration into the observability lane; alert on breach.
- **Accuracy = a golden relevance test set** run against a **real Meili in
  CI** (same discipline as the real-PG integration tests): `query →
  expected-top-hit` fixtures for typos, transpositions, prefixes, partial
  email. Ranking/tuning regressions fail the build.
- **Benchmark harness** (CLI job): seed 10k staff docs, run a query mix
  (exact / prefix / typo / facet-filtered), report **p50/p95/p99 broken down
  per segment** (Meili `processingTimeMs` vs handler vs network vs render) so
  a bottleneck is *localized*. Run at ship + as a regression guard.

## Consequences

- New deployed dependency (Meilisearch) + its master key in secrets + Kamal
  accessory + redeploy of the worker (owns the indexer).
- Eventual consistency: reads can lag writes by the outbox-relay interval
  (<1s); correctness lives in Postgres, the UI hides the window
  optimistically. Any read that must be strongly consistent (rare) bypasses
  Meili and hits Postgres.
- The job listings ledger is expected to migrate onto `@jp/search` in a
  follow-up; until then two search implementations coexist (accepted,
  time-boxed). Aggregate text-contains queries stay PG-FTS even after that
  migration — aggregate SQL needs the text predicate in-query and Meili
  filters cannot `LIKE`; the structural split is deliberate. Meili **quoted
  phrases disable typo tolerance** (exact mode) — the documented bridge for
  drill-through of a text-contains aggregate.
- A denormalized staff doc shape is now a contract between the writer (worker
  indexer) and the reader (`access.staff.list`); schema drift must update
  both. It lives in `@jp/domain-types/modules/access/staff-search` next to
  the index settings.
- The port pins `primaryKey: "id"` on `addDocuments` — a doc with several
  `*Id` fields defeats Meili's PK auto-inference and `addDocuments` silently
  indexes nothing.
- Port extensions: `SearchOptions.sort` (attribute must be sortable) and
  `IndexSettings.typoTolerance` (staff sets `oneTypo: 4` so short names
  typo-match). "Every staff write stages one `search.sync` job" includes CLI
  bootstrap jobs (`create-admin`, `assign-staff-department`): they stage the
  claim-check in the same transaction as the write. A `backfill-staff-search`
  job is the reindex escape hatch, not a required post-mutation step.

## Alternatives considered

- **Algolia (hosted SaaS).** Rejected: ships staff/candidate PII off-box,
  breaking the residency posture enforced elsewhere in the system.
- **Postgres `pg_trgm`.** Rejected: a per-table hack, not a shared search
  capability the job listings ledger can also adopt.
- **Typesense.** Considered; Meilisearch won on DX, typo tolerance, and
  single-binary ops.
- **Snapshot payload in the outbox job** (full document in the job body
  instead of a claim-check). Rejected: loses to retry-reorder — a
  transiently-failed job retrying after a newer one completes overwrites the
  index with stale data, and a reordered remove can resurrect a deleted doc.

## Why

One shared, residency-safe search capability; the outbox reuses proven infra
(no new sync pathway); Meili-as-read-model keeps authority in Postgres while
giving Algolia-grade feel; the SLO + golden set + benchmark make "utmost
experience" measurable rather than a claim.
