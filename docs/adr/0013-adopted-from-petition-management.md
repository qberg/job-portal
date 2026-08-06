# ADR-0013 — Adopted from petition-management

**Status:** Accepted (amended 2026-08-06 by ADR-0014: the Storybook deferral
below is lifted — tribune arrives as a curated fork with its Storybook
harness)

**Date:** 2026-07-30

## Context

`job-portal` is a new product. Rather than re-derive an architecture from
scratch, this repo clones `petition-management`'s architecture wholesale on
2026-07-30: same monorepo shape, same backend stack, same deployment
discipline, same enforcement mechanisms. `petition-management` is a mature,
production-launched sibling repo built by the same team; reusing its proven
decisions is lower-risk and higher-consistency than reinventing them, and its
own ADRs (this repo's `docs/adr/0001`–`0012`) already record the reasoning in
detail. This ADR is the record of *that transplant itself* — what came across,
what was deliberately left behind, and under what package scope this repo now
operates.

## Decision

Carry the following architectural decisions forward from `petition-management`,
renumbered sequentially into this repo's `docs/adr/`:

| New # | Title | Carries |
| --- | --- | --- |
| 0001 | Ports-and-adapters for external providers | Provider-swap discipline |
| 0002 | Backend: Hono + oRPC, kernel-style composition | HTTP/API/persistence stack |
| 0003 | Inward dependencies, pure leaf types, lazy packages | Monorepo package-boundary rule |
| 0004 | Deployment: DigitalOcean (BLR) + Kamal + managed data | Region/deploy/data-tier baseline |
| 0005 | Deploy refinements: same-origin, managed-PG, Cloudflare | Same-origin admin, CF edge, Tofu/R2 |
| 0006 | Domain-oriented modular monolith | kernel/shared/modules layering |
| 0007 | Batch mutations, AIP-235 | Bulk-action API convention |
| 0008 | API module-internal hexagonal + CQRS-lite segments | Module internal shape |
| 0009 | Async worker spine: outbox → relay → BullMQ | Async job pipeline |
| 0010 | API error model: errors as values | Result/error-map discipline |
| 0011 | Meilisearch shared search read-model | Search sync architecture |
| 0012 | Production topology and staging→prod pipeline | Deploy topology |

**Package scope:** this repo's internal workspace packages are namespaced
`@jp/*` (matching `petition-management`'s `@pm/*` convention, scoped to this
product).

**Deliberately dropped**, not carried into this repo even though they exist in
`petition-management`:

- **The CMS app** (`apps/cms-admin`, Payload-based) — no content-management
  surface exists for this product yet; adopted only if/when one is needed.
- **The Storybook app** (`apps/storybook`) — deferred; no component library
  large enough to warrant an isolated Storybook deploy yet. *(Deferral lifted
  2026-08-06 by ADR-0014.)*
- **The CLI app** (`apps/cli`) — deferred; no operational job/bootstrap
  surface exists yet that needs a standalone CLI.
- **The Tolgee self-hosted translation-management service** — deferred *for
  now*; this product has no content-translation workflow yet. Revisit if/when
  multi-locale content authoring is needed.
- **All petition-domain modules** — `packages/petition-lifecycle`, the
  `modules/petitions` vertical, and every petition-specific bounded context
  (citizen intake, ward/department reference data, WhatsApp conversational
  intake, evidence/redaction handling, etc.). None of this is job-portal
  domain; only the *mechanism* ADRs (kernel/shared/modules shape, hexagonal
  segments, error model, outbox, search-sync, batch mutations) were carried —
  the domain content inside `modules/<context>/` starts empty for this repo
  and is rebuilt from job-portal's own domain (jobs, candidates, applications,
  employers, matching) as it is built.

## Consequences

- Every carried ADR (0001–0012) reads as job-portal's own applied
  architecture — some prose was translated from petition-domain nouns
  (citizen, staff, petition, ward) to job-portal equivalents (candidate,
  employer/staff, job listing, department) at carry-time, but the technical
  decisions themselves are unchanged from the source.
- Cross-references inside the carried ADRs to `petition-management` ADRs that
  were **not** carried (e.g. its residency, redaction, and later
  infrastructure-sovereignty decisions) were removed or generalized rather
  than reproduced — this repo doesn't inherit decisions it doesn't have the
  source ADR for, per the no-invented-decisions rule below.
- Divergence is expected and fine: as job-portal's domain and scale diverge
  from petition-management's, individual carried ADRs will get superseded by
  job-portal-specific ADRs. Carrying them forward is a starting point, not a
  permanent tether.
- The dropped items (CMS, Storybook, CLI, Tolgee) remain valid options — if a
  future need arises, port the corresponding `petition-management` ADR and
  app scaffold at that time rather than building a divergent version from
  scratch.

## Alternatives considered

- **Design job-portal's architecture from scratch.** Rejected: `petition-management`
  already paid the cost of getting this stack right (including a production
  launch) — re-deriving it would re-litigate settled decisions for no benefit.
- **Carry every `petition-management` ADR, including domain-specific ones.**
  Rejected: petition-domain modules, CMS, Storybook, CLI, and Tolgee solve
  problems this product doesn't have yet; carrying them would import
  unused surface area and unearned complexity. They're listed above as
  explicit, deliberate omissions rather than silently absent.
- **Reference `petition-management`'s ADRs by pointer instead of copying/renumbering.**
  Rejected: this repo needs its own self-contained `docs/adr/` that reads
  correctly without requiring access to a sibling repo; renumbering and
  adapting the prose keeps this repo's history coherent on its own.
