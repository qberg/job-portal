# ADR-0009 — Async worker spine: transactional outbox → relay → BullMQ on the existing Valkey

**Status:** Accepted

**Date:** 2026-06-28

## Context

The `outbox_jobs` table + writer exist (commands stage jobs in the same
transaction as their state change), but **nothing consumes them**. The first
real consumer arrives with resume/document evidence (thumbnail/preview
generation must run async — the upload is presigned, so the API never holds
the bytes). The second is deferred candidate/employer notification delivery
(email, SMS). This is the **shared async-processing spine** for the whole
system.

The decisive infrastructure fact: **Valkey (Redis-API) is already deployed and
load-bearing** — `docker-compose.yml` runs `valkey/valkey:8`, and `@jp/cache`
is ioredis on `REDIS_URL` (connection-managed, heartbeated). So there is **no
"second datastore" to avoid**; the question is only how best to use what's
already here.

## Decision

Adopt the **transactional outbox → relay → BullMQ** pattern (matching the
architecture donor, `petition-management`), on the existing Valkey:

- **Stage transactionally** — commands write `outbox_jobs` rows inside the
  business `db.transaction()` (already the case). This is the no-dual-write
  guarantee; it never changes.
- **Relay** — a poller claims pending rows with `SELECT … FOR UPDATE SKIP
  LOCKED`, calls `queue.add(job.queue, job.payload, { jobId: job.id })`
  (BullMQ dedups on the outbox row id), and marks the row `dispatched |
  failed`. The relay is the **sole** dispatcher; producers only stage.
- **BullMQ workers** consume — `asset.analyze` (thumbnail/preview render) now,
  `candidate.notify` / `employer.notify` (multi-channel delivery) later — with
  BullMQ's native **retries + exponential backoff, rate limiting, priorities,
  repeatable jobs (cron), and Bull Board** for ops visibility.
- **Co-location** — for a single worker app, the relay loop **and** the BullMQ
  workers run in one **`apps/worker`** deploy unit.
- **Redis connection topology** — the relay pattern means the **API never
  connects to BullMQ** (it only writes Postgres outbox rows); its single Redis
  socket stays the `@jp/cache` client. The **worker** declares **one**
  dedicated BullMQ ioredis (`maxRetriesPerRequest: null`, `enableReadyCheck:
  false`) shared by the relay `Queue.add` (non-blocking) and auto-`.duplicate()`d
  by `Worker` and `QueueEvents` for their blocking loops (`BZPOPMIN`) → 3
  sockets from one instance — **plus a separate** cache ioredis if the worker
  caches. **Never pass the cache connection to BullMQ** — `Worker` throws
  unless `maxRetriesPerRequest: null`, and a blocked worker would starve cache
  `GET`s on a shared socket.
- **Idempotent handlers** — at-least-once delivery; `asset.analyze` overwrites
  the same derived key, notification handlers carry a dedup key. The `jobId =
  outbox.id` gives enqueue-level dedup; handlers cover execution-level
  retries.
- **Schema** — `outbox_jobs` carries `priority`, `dispatched_at`, `failed_at`,
  `error_message`, `processing_started_at`.
- **Native deps** (libvips + libheif for images/HEIC, a PDF rasterizer for
  page-1 of resumes) live in the **worker image only** — the API image stays
  slim.

**Observability (phased; design complete, infra reused/right-sized to load):**
reuse already-deployed infra before standing up anything new.

- **Launch** — `@bull-board/hono` mounted behind auth (queue visibility,
  in-process, no extra service) · Sentry SDK pointed at self-hosted error
  tracking on `worker.on('failed')` · existing pino (`@jp/logger`) structured
  logs. Error payloads stay on owned infra, not a third-party cloud; set
  `sendDefaultPii: false` and scrub PII fields.
- **Phase 2** — `prom-client` + a `QueueEvents` bridge exposing `/metrics`,
  scraped by Prometheus + a Grafana queue-depth/failure-rate dashboard.
- **Phase 3** — **OpenTelemetry** as the vendor-neutral, durable bet:
  `bullmq-otel` (official adapter, producer→consumer trace propagation) +
  `@opentelemetry/sdk-node` + auto-instrumentations (ioredis/pg/http) → an OTel
  Collector → the chosen tracing backend.
- Rejected-as-overkill-now: hosted Sentry, full LGTM/SigNoz at launch,
  Datadog/New Relic (cost + lock-in), Taskforce.sh (Bull Board is free +
  in-process).

## Consequences

- A new `apps/worker` deploy unit (Kamal) running relay + BullMQ workers; its
  image carries the native rasterization libs.
- BullMQ runs on Valkey 8 — officially supported (the BullMQ maintainers run
  their full test suite against Valkey); no compatibility gamble.
- The storage port gains `getObject` (the worker reads originals to render).
- Handlers must be idempotent; every queue gets a dead-letter path + a test
  for it.

## Alternatives considered

- **graphile-worker / pg-boss (Postgres-native, no Redis).** Correct only if
  we had no Redis; we do. Trades away BullMQ's notification features
  (native rate-limiting, flows, priorities, dashboard) and divergence from the
  proven donor spine for a simplicity win that's moot here.
- **BullMQ direct from the command (no outbox).** Rejected: the dual-write
  problem — a crash between `commit` and `queue.add` loses the job. The outbox
  + relay is exactly the fix.
- **Dedicated `outbox-dispatcher` daemon separate from workers.** Rejected:
  justified in a multi-app distributed topology; over-structured for a single
  worker app. Revisit if a second consumer app appears.
- **Synchronous-at-commit generation.** Impossible (presigned uploads: the API
  never holds the bytes) and would block the register response.

## Why BullMQ over a Postgres-native queue

With Valkey already running, BullMQ's marginal infra cost is ≈ zero, and it is
the most battle-tested Node queue with the richest feature set — **native
rate-limiting** (a hard requirement for provider TPS caps on notification
delivery), flows, priorities, and a dashboard — which a DX-grade notification
workload genuinely uses. It keeps us consistent with the architecture donor's
proven spine. The transactional-outbox + relay preserves correctness, so
BullMQ's non-transactional enqueue is never on the business path.
