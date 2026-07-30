# ADR-0007 — Bulk actions: one AIP-235 batch endpoint, partial-success per-item

**Status:** Accepted. Builds on ADR-0006 (modular monolith) and the admin app's
data-fetching conventions inherited from the architecture donor
(`petition-management`). First consumer: drafts batch-delete; next: job listings
ledger, candidates, employers — any collection with multi-select.

**Date:** 2026-06-26

## Context

Tables have row selection, so every list needs a bulk action. A placeholder
pattern of shipping N single mutations fanned out via `Promise.all` costs: N
HTTP round-trips, N auth checks, N db connections, N audit rows for one user
intent — trips rate limits, no atomicity, partial-failure reconstructed
client-side. Not a pattern to repeat per table.

## Decision

- **One batch endpoint per bulk action**, Google AIP-235 shape:
  `POST /res/batch-delete`, input `{ ids: uuid[] }` (valibot `minLength(1)`,
  `maxLength(N)` cap), output `{ results: [{ id, status }] }`. No `DELETE`
  body, no `/res/{id}` fan-out.
- **Partial-success is the contract, not an error.** Out-of-scope / missing /
  wrong-state ids come back `status: "not_found"` alongside `"deleted"` — HTTP
  200, never a thrown per-id error. Whole-request failures (authz) still throw
  (`forbidden`).
- **One SQL statement.** Reader runs `DELETE … WHERE id IN (ids) AND <state> AND
  <scope> RETURNING id`; handler diffs requested-vs-returned to label each id.
  Scope filter is the same `withScope` used by single-row reads — authz stays
  server-side.
- **Single-row = batch of one.** No separate single-resource endpoint; the row
  trash icon sends `ids:[one]`. One delete concept, one engine, no duplicated
  path.
- **Client = one optimistic mutation.** Remove the id-set from the list cache
  `onMutate`, roll back `onError`, invalidate `onSettled`; toast reads
  `results` to report partials.

## Consequences

- A new bulk action = batch contract + one `… IN(ids) RETURNING` reader +
  handler diff; client reuses the optimistic remove-set mutation shape.
- `POST` (not `DELETE`-with-body) sidesteps proxies stripping bodies and the
  oRPC Scalar GET-void trap; path reads `batch-delete`, not `:batchDelete`
  (matches kebab).
- Cap (`maxLength`) bounds the `IN` list; over-cap selections must chunk (none
  yet).
- Mixed-result toast convention: "N deleted · M were already gone".

## Alternatives considered

- **N single mutations + `Promise.all`.** Rejected: no atomicity, N× round-
  trips/auth/connections/audit, client-side partial reconstruction.
- **`DELETE /res` with `{ids}` body.** Rejected: bodies on DELETE are
  spec-grey and proxy-stripped; POST batch is the portable convention.
- **Keep single `/res/{id}` + add bulk.** Rejected: two endpoints for one
  intent the UI always expresses as a set — duplicated path, dead REST route.
- **All-or-nothing tx (reject whole batch if any id invalid).** Rejected: a
  stale id in a multi-select would fail the user's whole action; partial-
  success is friendlier and AIP-aligned.

## Why

Atomicity + one audit entry ("deleted N") for one intent; one rate-limit unit;
one connection. The fan-out gave none of these. Server owns partial-failure
truth in one response — no `Promise.allSettled` bookkeeping. AIP-235 is the
de-facto large-scale batch convention (GCP, Firebase); not reinvented.
