# ADR-0004 — Deployment: DigitalOcean (BLR) + Kamal + managed data + thin Tofu

**Status:** Accepted

**Date:** 2026-07-19

## Context

We need a deployment target and tooling. Constraints: regional data residency,
an enterprise client, modest initial scale, containerized apps (api, workers,
web-admin static, web-public), and the no-debt principle. DigitalOcean has a
Bangalore (BLR) region. A concern was raised that DO managed-database network
charges might be expensive.

## Decision

- **Region:** DigitalOcean **Bangalore (BLR)** — satisfies residency.
- **Deploy:** **Kamal** deploys app containers to droplets (zero-downtime,
  Traefik TLS, rollbacks). Fits our multi-container, single-region shape better
  than Terraform-style tooling for the deploy step.
- **Data:** **DO Managed Postgres (with pgvector) + Managed Redis** — *not*
  Kamal accessories. Managed gives daily backups, 7-day PITR, and optional
  standby failover.
- **Provision:** a **thin OpenTofu** module for droplets + the managed DB/Redis
  + VPC + firewall + DNS — reproducible, staging/prod parity, no click-ops
  drift. Kept small; Kamal owns everything app-level.

## Consequences

- Two tools (Tofu for provision, Kamal for deploy) — accepted; each is small
  and owns a distinct layer.
- HA standby roughly doubles the DB line (~$60/mo) — accepted for production.
- Secrets/env via Kamal; app↔DB over the private VPC.

## Alternatives considered

- **Self-hosting Postgres on a droplet.** Saves ~$45/mo but means owning
  backups, HA, failover, and upgrades — unacceptable debt for a system of
  record. Rejected.
- **The managed-DB network-cost concern turned out unfounded**, not a reason to
  self-host: traffic to/from DO managed databases does not count against
  bandwidth, app↔DB over the private VPC (same DC) is free, and bandwidth
  overage is only $0.01/GiB. Managed Postgres is ~$15/mo (single) to ~$60/mo
  (HA), with no hidden network cost.
- **Terraform-style tooling for the deploy step itself** (not just provisioning).
  Rejected: Kamal fits the multi-container, single-region app-rollout shape
  better; Tofu is kept to the stateful/networked resources only.
