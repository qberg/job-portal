# ADR-0005 — Deploy refinements: same-origin, managed-PG-only, CF front

**Status:** Accepted. Refines ADR-0004 (region/Kamal/thin-Tofu still hold).

**Date:** 2026-07-19

## Context

Grilling the ADR-0004 plan surfaced open calls and deliberate deviations from
it. Each is hard-to-reverse, surprising, or a real trade-off → recorded here.

## Decision

| # | Decision | Trade |
|---|----------|-------|
| 1 | **PG managed, Valkey self-host** (Kamal accessory). Deviates from ADR-0004 (both managed). | PG holds PII + the outbox → keep backups/PITR. Valkey = cache + queue; the outbox is the durability anchor → loss just means re-drive. Saves ~$15–25/mo, ~$0 risk. |
| 2 | **api + web-admin = one same-origin image.** Hono serves the SPA + `/rpc` + `/api/auth`. | Kills cross-origin auth (no cross-site cookie, `VITE_API_URL` relative). CORS kept but env-gated (dev cross-origin, prod no-op). admin+api version-locked = wanted. |
| 3 | **Cloudflare orange front** on the product domain (Full-strict). | CF edge TLS + WAF + DDoS. Origin = CF Origin Cert in kamal-proxy (auto-LE off, HTTP-01 can't pass proxy). Firewall 80/443 = CF IPs only → origin hidden. App reads `CF-Connecting-IP` for audit, trusts CF only. |
| 4 | **Tofu from laptop, state in Cloudflare R2.** No infra CI. | State remote = durability + secret-safety (holds DB password), not CI. R2 free, S3-compat. No lock (single operator). |
| 5 | **Migrate from the droplet** (Kamal pre-deploy hook). | PG trusted-sources = VPC only (no public/CI). `drizzle-kit migrate` runs in-VPC pre-cutover. Breaking changes = expand/contract over 2 deploys → `kamal rollback` stays safe. Local dev = `drizzle-kit push`. |
| 6 | **Secrets = GitHub `production` Environment, CI-only deploy.** No vault (none exist yet). | No laptop deploy → no drift. |

## Topology

```
CF (DNS+proxy)
  app.<product-domain> ─► [orange] ─► DO droplet 2GB (BLR, VPC)
                                       kamal-proxy (CF Origin Cert)
                                       ├ api(+SPA)  now
                                       ├ workers    later (same image, CMD node worker)
                                       ├ web-public later
                                       └ valkey     accessory (AOF, noeviction)
                                            │ private VPC
                                 Managed PG 18 (pgvector), trusted=droplet only
```

Local dev: compose runs PG18 + Valkey only; apps on host via `turbo dev`.
Prod-only, trunk (`main`=prod). Staging later = Tofu workspace + Kamal
destination.

## Consequences

- CF Origin Cert (15yr) + CF IP list in firewall = small one-time cost, ~0
  churn.
- admin/api version-locked by design.
- web-public picks its own CF-proxy + database-writer story later. This ADR
  covers the admin app.

## Alternatives considered

- **Both PG and Redis managed** (ADR-0004's original shape). Deviated from:
  Valkey's durability requirement is much lower than PG's (outbox is the
  durability anchor, not the cache), so self-hosting it is low-risk and cheaper.
- **Cross-origin admin SPA + separate API host.** Rejected: cross-site cookies
  for auth are fragile; same-origin removes an entire class of CORS/cookie
  bugs at the cost of version-locking admin and api, which is a trade we want.
- **CI-driven infra provisioning (Tofu in CI).** Rejected for now: no infra CI
  exists yet; a single-operator laptop-applied Tofu with remote state is
  simpler and the state backend already gives durability.
