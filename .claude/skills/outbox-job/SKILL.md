---
name: outbox-job
description: Add a new async job type on the transactional-outbox pipeline — queue vocab, claim-check payload, same-txn staging, worker handler via defineJob, retry config. Use when a write needs an async side-effect (search sync, notification, transcription, render), when adding a BullMQ queue or worker handler, or when debugging outbox relay/worker behavior. Written for executor agents of any size — follow it literally.
---

# Add an async job type

Spine: business txn stages a row in `outbox_jobs` → relay in `apps/worker` claims
(`FOR UPDATE SKIP LOCKED`) and dispatches to BullMQ on Valkey → per-queue Worker runs the
handler. **API never connects to BullMQ** (writes outbox rows only). **Never share the cache
ioredis client with BullMQ.** Exemplars: TODO(exemplar): first job-portal module pending.

## Steps

1. **Queue name** → `packages/domain-types/src/kernel/queues.ts` `Queues` registry (current:
   TODO(exemplar): first job-portal module pending). This is the contract between API outbox
   and worker — both import it, never string literals.
2. **Payload schema (valibot).** LAW: **claim-check, never snapshot.** Payload carries only
   keys (`{index, entityId}`, `{recordingId}`) — the worker re-reads Postgres at consume time
   and projects current state. Snapshotted documents break under retry-reorder (an old retry
   overwrites newer state). Schema lives with the handler (`apps/worker/src/handlers.ts`) or in
   the owning package (TODO(exemplar): first job-portal module pending).
3. **Staging helper** in the owning module's repo, wrapping
   `stageJobs(db, queue, payloads)` (`apps/api/src/kernel/orpc`-adjacent:
   `apps/api/src/kernel/outbox/stage.ts`). Cf. TODO(exemplar): first job-portal module pending.
   Call it with the **txn handle inside the business transaction** — commit atomicity is the
   whole point; a stage outside the txn can fire for a rolled-back write.
4. **Worker handler** via `defineJob` (`apps/worker/src/define-job.ts`):
   `{schema, load, guard?, act, logMessage}` — parse→load→guard→act→log. Parse/guard mismatch
   throws `UnrecoverableError` → DLQ, no retry (use `rowOrThrow` for deterministic
   missing-row). Transient failures throw normally → BullMQ retry/backoff. Cf.
   TODO(exemplar): first job-portal module pending.
5. **Register** in `createHandlers` (`apps/worker/src/handlers.ts`) —
   `Record<QueueName, Job>`; typecheck forces completeness when you added the Queues entry.
   Per-queue retry override in `JOB_ATTEMPTS` (`apps/worker/src/queue.ts`). Relay config
   (batch 50, poll 1s, lease 300s, 5 dispatch attempts) = `apps/worker/src/config.ts` — don't
   tune without cause.
6. **Idempotency.** BullMQ `jobId` = outbox row id (dedup across relay retries) — free. Your
   handler must ALSO be idempotent on re-run (upsert not insert; deterministic external ids),
   because BullMQ retries after partial completion.

## Run + verify locally

`docker compose up -d` (postgres/valkey/meilisearch) → `pnpm -F @jp/worker dev` (relay + workers,
needs `DATABASE_URL` + `REDIS_URL` in `apps/worker/.env`; unset `MEILI_URL` = Fake search).
Watch: Bull Board `http://localhost:3002/admin/queues` (needs `BULL_BOARD_USER/PASSWORD`),
outbox rows `select status, queue, attempts from outbox_jobs order by created_at desc limit 10`.
Prove the seam end-to-end with `/watch-it-work` — green unit tests are not proof for a
cross-process flow. Test the error paths: bad payload → DLQ (UnrecoverableError), transient
throw → retries then failed, staged-but-rolled-back txn → no job.

## Done =

Queues entry + payload schema + txn-staged helper + defineJob handler + registry entry, error
paths tested, live smoke via Bull Board/outbox query, honest status. User owns commits.
