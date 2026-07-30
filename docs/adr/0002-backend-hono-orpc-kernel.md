# ADR-0002 — Backend: Hono + oRPC, kernel-style composition, Postgres/Drizzle, outbox+BullMQ

**Status:** Accepted

**Date:** 2026-06-13

## Context

Greenfield TS pnpm monorepo for the job portal. Needs public inbound webhooks
(payment/job-board/notification providers call us — must be REST), a typed
internal admin API, and slow async work (resume parsing, AI matching) that
cannot run inside a webhook request. We evaluated NestJS vs a lean Hono setup;
the sibling `petition-management` repo (this repo's architecture donor) already
runs a mature version of the lean stack, confirming it as a fit — used as a
taste reference, not a runtime dependency.

## Decision

- **Hono** (+ `@hono/node-server`) as the HTTP layer on Node 22 / ESM.
- **oRPC** for the admin API (emits an OpenAPI contract — audit-friendly and
  integration-friendly for enterprise/partner clients), **valibot** for schema
  validation. Public inbound webhooks are plain Hono REST routes.
- **Manual composition root** ("kernel" module per app: wires ports/adapters,
  oRPC, middleware, db) — no DI-container magic. Pure-function-friendly.
- **Postgres + Drizzle** for persistence.
- **Transactional outbox → poller (`FOR UPDATE SKIP LOCKED`) → BullMQ/Redis →
  worker apps** for all slow/async processing. The webhook commits an outbox row
  and returns fast; workers do parsing/matching/notification work.

## Consequences

We own architectural discipline that NestJS would enforce (module boundaries via
dependency-cruiser instead of a framework). Worker apps are separate
deployables.

## Alternatives considered

- **NestJS.** Rejected: its module/DI structure isn't needed once composition is
  explicit in a kernel; adds framework weight without buying us anything a
  manual composition root doesn't already give us.
- **tRPC instead of oRPC.** Rejected: gives end-to-end type safety but no
  OpenAPI contract, and a contract is needed for audit/partner-integration
  purposes.
- **Synchronous processing inside the webhook handler.** Rejected: slow AI/parse
  work would blow past the webhook provider's short ack deadline.
