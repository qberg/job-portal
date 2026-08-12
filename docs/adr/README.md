# Architecture Decision Records

This directory records the architecturally significant decisions behind
`job-portal`. Most of this repo's early architecture was carried forward from
the sibling `petition-management` repo — see ADR-0013 for what was adopted,
what was deliberately dropped, and why.

## Rule

**Every architecturally significant decision gets an ADR before or with the
PR that implements it.** "Architecturally significant" means: it changes a
module boundary, a data model that other contexts depend on, an external
dependency, a deployment shape, or an enforcement mechanism (dep-cruiser, arch
tests, CI gates) — not every implementation detail. Use `0000-template.md` for
every new ADR; the template's shape (Context, Decision, Consequences,
Alternatives considered) is mandatory.

Number sequentially from the last entry below; never reuse or backfill a
number.

## Index

| # | Title | Status | Summary |
| --- | --- | --- | --- |
| [0000](0000-template.md) | Template | — | Standard ADR shape: Context, Decision, Consequences, Alternatives considered. |
| [0001](0001-ports-and-adapters-for-external-providers.md) | Ports-and-adapters for external providers | Accepted | Every external provider (resume parsing, matching LLM, notifications, …) sits behind a narrow domain-owned port; no provider SDK types leak into domain code. |
| [0002](0002-backend-hono-orpc-kernel.md) | Backend: Hono + oRPC, kernel-style composition | Accepted | Hono HTTP layer, oRPC + valibot admin API, manual composition-root kernel, Postgres/Drizzle, outbox→BullMQ for async work. |
| [0003](0003-architecture-inward-dependencies-lazy-packages.md) | Inward dependencies, pure leaf types, lazy packages | Accepted | Dependencies point inward (enforced by dependency-cruiser); packages are extracted lazily only when ≥2 deployables need them. |
| [0004](0004-deployment-digitalocean-kamal-managed-data.md) | Deployment: DigitalOcean (BLR) + Kamal + managed data | Accepted | DO Bangalore region, Kamal for app rollout, managed Postgres + Redis, thin OpenTofu for provisioning. |
| [0005](0005-deployment-refinements-same-origin-managed-pg-cloudflare.md) | Deploy refinements: same-origin, managed-PG, Cloudflare | Accepted | Same-origin admin+api image, Cloudflare orange front, Tofu state in R2, in-VPC migrations, CI-only deploy secrets. |
| [0006](0006-domain-oriented-modular-monolith.md) | Domain-oriented modular monolith | Accepted | kernel / shared / modules buckets, mirrored isomorphically across every layer (db, api, frontend). |
| [0007](0007-batch-mutations-aip-235.md) | Batch mutations, AIP-235 | Accepted | One AIP-235-shaped batch endpoint per bulk action, partial-success per-item, no N-fan-out mutations. |
| [0008](0008-api-module-internal-hexagonal-cqrs-segments.md) | API module-internal hexagonal + CQRS-lite segments | Accepted | The internal shape of a module (domain/model/query/repo/commands/handlers), dep-cruiser enforced. |
| [0009](0009-async-worker-spine-outbox-relay-bullmq.md) | Async worker spine: outbox → relay → BullMQ | Accepted | Transactional outbox staged in-txn, relay dispatches to BullMQ on the existing Valkey, idempotent worker handlers. |
| [0010](0010-api-error-model-errors-as-values-translate-at-boundary.md) | API error model: errors as values | Accepted | Core returns `T \| null` / `Result<T,E>`; only the oRPC boundary constructs transport errors; arch-test enforced. |
| [0011](0011-meilisearch-shared-search-read-model.md) | Meilisearch shared search read-model | Accepted | Self-hosted Meilisearch as a CQRS read-model, synced via the outbox with a claim-check payload; Postgres stays source of truth. |
| [0012](0012-production-topology-and-staging-to-prod-pipeline.md) | Production topology and staging→prod pipeline | Accepted | Prod mirrors staging's one-box shape, Kamal destinations (not duplicate configs), env-agnostic images, born-empty data plane, backup-gated go-live. |
| [0013](0013-adopted-from-petition-management.md) | Adopted from petition-management | Accepted | Records the 2026-07-30 wholesale architecture clone from `petition-management`: what was carried (0001–0012), what was deliberately dropped (CMS, Storybook, CLI, Tolgee, petition-domain modules), and the `@jp/*` package scope. |
| [0014](0014-tribune-curated-fork-storybook-harness.md) | Tribune as curated fork, Storybook harness with it | Accepted | Design system crosses products as a curated fork: mechanism-only seed (`@jp/tribune`, `--tbn-*` kept), components by per-screen adoption, `apps/storybook` harness lands with the seed (lifts 0013's deferral). |
| [0015](0015-public-sign-in-multi-method-verified-linking.md) | Public sign-in: multi-method with verified account linking | Proposed | Phone/email/Google via one combined input, everything resolves to a 6-digit code; verified-email auto-link + user-initiated account-claim for phone-born accounts; 90-day rolling sessions; role-selection screen removed, employer is an entitlement. |
