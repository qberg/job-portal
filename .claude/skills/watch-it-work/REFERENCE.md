# Watch It Work — this repo

## Local infra (real, not Neon)

```bash
docker compose up -d postgres valkey      # pgvector pg17 on host 5433, valkey on 6380
```
Each app reads `DATABASE_URL` + `VALKEY_URL` from its own `.env`. Local values:
```
DATABASE_URL=postgres://postgres:localdev@localhost:5433/apm?sslmode=disable
VALKEY_URL=redis://localhost:6380
```
`createClient` (packages/database) derives SSL from the URL — off for `localhost`/`sslmode=disable`, so the apps' `ssl: true` boots work locally unchanged.

## Booting apps (one terminal each, long-running)

```bash
cd apps/<app> && pnpm dev      # tsx/vite watch; hot-reloads on edit
```
Boot **the riskiest unknown first** and read its readiness log before booting the rest. Typical order for an outbox flow: the consumer app → the producer app → `outbox-dispatcher` (the relay). The dispatcher prints its **monitored queue set** on boot — confirm your queue is in it (unregistered = silent stall, see `apps/outbox-dispatcher/CLAUDE.md`).

## Logs = the contract

Structured pino. Readiness + step signals are **load-bearing** (`apps/api-admin/CLAUDE.md` marks them "do not remove"):
- `[SYS] ... // ONLINE` — a worker/consumer connected. Read the fields (`queues: N`, `concurrency`) — verify the *count*, not just "ONLINE".
- `[NET] JOB DISPATCHED // <id>` (outbox-dispatcher) — a staged row handed to BullMQ. Proves *dispatch*, not *consume*.
- `[SYS] ... APPLIED // DONE|GRANTED` — a consumer applied the effect. **This is the far hop.**
Every line carries the **correlation id** (e.g. `accountPersonaId`). Trace the same id across terminals, in order.

## Seed / drive / verify — the cli job registry

Ad-hoc ops jobs live in `apps/cli/src/jobs/` + `JOB_REGISTRY` (`apps/cli/src/commands/job.command.ts`). Run:
```bash
pnpm --filter @apm/cli cli job <name>
```
Write jobs with the **typed drizzle schema** (not raw SQL) and make them **obey the same guards as production** (e.g. a resubmit job must check `status === 'draft'` like `submit-for-review` does). Stage the upstream outbox job; let the live dispatcher + worker project the downstream row — don't insert the downstream row yourself.

Existing M4 jobs (templates): `seed-review-demo` (stage an upstream submit), `resubmit-persona` (re-stage, guard-respecting), `verify-rejection` (print far-side state), `grant-admin-role` (fresh-DB admin ABAC provisioning).

Admin login on a fresh DB: out-of-band provisioning, never self-grant. Sign up via the running app (`POST /api/auth/sign-up/email` — hashes correctly), then grant ABAC role with `cli job grant-admin-role`. Identity (signup) ≠ authority (role).

## Worked example — M4 persona-review (one id across 4 processes)

1. `docker compose up -d postgres valkey`; boot api-portal (watch `PERSONA DECISION WORKERS // ONLINE  queues: 3`), api-admin (`PERSONA REVIEW WORKER // ONLINE`), outbox-dispatcher (queue set includes the 3 `portal.persona.*`).
2. `cli job seed-review-demo` → watch dispatcher dispatch `admin.persona-review` → api-admin `PERSONA REVIEW PROJECTION // DONE` (queue row exists, production-shaped).
3. web-admin → `/user-management/mentor` → reject Ada in the drawer (note required).
4. Trace `accountPersonaId`: api-admin decide → dispatcher `JOB DISPATCHED queue: portal.persona.rejected` → api-portal `PERSONA REJECTION APPLIED // DONE`.
5. `cli job verify-rejection` → assert the **far side**: `draftStatus: rejected`, `historyDecisions: [rejected]`, `persona.rejected` notification. Approve path → `personaStatus: active` + frozen `personaScopes`. 4th reject → `personaStatus: revoked` + resubmit then blocked.

## Pitfalls seen live here

- A Slice refactor dropped the consumer's `APPLIED // DONE` log → consumer worked but went dark. Tests don't assert logs; only the live run caught it.
- A dev resubmit job bypassed `submit-for-review`'s `resubmitGuard` → "resubmit forever" on a revoked persona. The bug was the harness, not the product. Mirror the guard.
- Integration tests need `DATABASE_URL` set inline (`vitest run` doesn't load `.env`) — else they hit `localhost:5432` (a different DB) and fail on missing tables.
