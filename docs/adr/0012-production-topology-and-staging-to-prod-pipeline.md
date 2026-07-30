# ADR-0012 — Production topology and the staging→prod pipeline

**Status:** Accepted. Builds on ADR-0005 (staging shape) and ADR-0004 (region /
Kamal / thin Tofu).

**Date:** 2026-07-20

## Context

Production launches as a **second droplet mirroring the staging one-box
shape** (kamal-proxy + api/worker/web-public + PG/Valkey/Meili accessories).
Same shape = same runbook = the whole point; a split-DB prod is a second box
to operate with no load to justify it. Staging is **not** promoted in place:
its PG is unbacked, its data is test residue, and promoting it would spend the
pre-prod environment exactly when launch needs one.

## Decision

1. **Registry: one self-hosted Zot, on the prod droplet** (`jp-registry.<ops-domain>`,
   DNS → prod IP). Prod pulls same-box — the zero-external-network deploy path
   where it matters most. Staging pulls cross-box over the droplet-to-droplet
   path. Dependency arrow points the right way: staging may depend on the prod
   box, never the reverse. Registry loss stays a non-event (the laptop is
   builder-of-record). **The registry host stays grey-cloud (DNS-only) with
   kamal-proxy auto-LE forever** — `docker push` moves multi-GB blobs and
   Cloudflare's proxy upload cap would break every push.

2. **Two environments = Kamal destinations, not duplicate configs.** Each
   per-app config splits into a base (builder, roles, accessories, shared
   clear env) plus `deploy.<app>.staging.yml` / `deploy.<app>.production.yml`
   overlays (hosts, server IP, env-specific values). Secrets = `.kamal/secrets-common`
   + `.kamal/secrets.<destination>` with **values inline in the gitignored
   destination files** — deploying with the wrong env's secrets becomes
   structurally impossible. Bases carry no hosts, so a bare `kamal deploy`
   without `-d` fails fast. Both secrets files owe a durable copy (password
   manager / encrypted laptop backup); the laptop is the secret store of
   record.

3. **Images are env-agnostic; prod deploys the staging-tested artifact.**
   Build-time bakes (e.g. `NEXT_PUBLIC_MAPBOX_TOKEN`, `API_INTERNAL_URL`) use
   the same values in both environments, and the east-west alias name
   (`jp-api-internal`) is identical by construction. Kamal tags by git SHA, so
   deploying prod from the same clean commit staging ran pulls the
   byte-identical image: build is cache-warm, push dedups, what was smoked is
   what ships.

4. **Guardrails live in Kamal-native hooks, not a wrapper script.**
   `.kamal/hooks/pre-build` aborts a production-destination deploy on a dirty
   tree (staging keeps dirty-deploy freedom). Command surface stays raw `kamal
   deploy [-c …] -d production`.

5. **Edge.** Host map: apex + `www` → web-public; `admin.` → api container
   (web-admin SPA stays same-origin per ADR-0005); `api.` → the same container
   for machine traffic (webhooks, provider callbacks). All product hosts
   **orange-cloud** with a **Cloudflare Origin CA wildcard cert** loaded via
   `proxy.ssl.certificate_pem`/`private_key_pem` secrets (15-year validity —
   less renewal ops than Let's Encrypt), SSL mode Full (strict), `forward_headers:
   true`, origin firewall restricted to CF IPs (+ SSH and the grey registry
   host). Auto-LE behind the orange proxy was rejected as patchwork (HTTP-01
   through the CF edge is flaky). **Cloudflare Access fronts `admin.`** —
   scanners never reach the auth login; `api.` stays Access-free so webhooks
   work. Staging keeps DNS-only + auto-LE unchanged.

6. **Data plane: prod is born empty.** Tunnel runbook: drizzle migrate →
   `seed` (reference catalog, no users) → `create-admin` → Meili backfills.
   Cloning the staging DB was rejected — test job listings and ghost
   candidates have no place in a PII system of record. Ongoing cadence: migrate
   over the tunnel **before** `kamal deploy -d production`. Auto-migration in
   a deploy hook was rejected (surprise DDL under load).

7. **Backups gate the DNS flip.** Before prod serves candidates: nightly
   client-side-encrypted `pg_dump` → separate object-storage backup bucket,
   nightly laptop pull of the same (a copy no cloud-account event touches),
   evidence-bucket sync on the same cron, and **one restore drill against a
   scratch DB**. PITR remains prod-hardening scope beyond this baseline.

8. **Domain split: an ops/staging domain hosts internal infra, a separate
   product domain hosts the public product.** Staging hosts and the registry
   keep their ops-domain names; moving them under the product brand domain is
   churn (CORS, cert re-issue) for zero function.

## Consequences

- Config refactor owed before prod exists: 4 configs → base + 2 overlays each,
  secrets files split per destination, one staging redeploy to prove the
  refactor changed nothing.
- Admin app URL and friends land in production overlays; the deploy runbook
  stays authoritative for both destinations.
- Prod deploys under pressure touch: laptop → prod box only. Staging box and
  every third party sit outside the path (registry grey-cloud is same-box for
  prod).
- Cloudflare Access + Origin CA deepen the Cloudflare coupling; both reverse
  with a DNS flip + config redeploy.

## Alternatives considered

- **Promote the staging box to prod in place.** Rejected: staging's PG is
  unbacked and its data is test residue; promoting it spends the pre-prod
  environment exactly when launch needs one.
- **Per-env rebuilds with per-env baked secrets/keys.** Rejected: prod would
  run an artifact staging never exercised, defeating the point of a
  staging→prod pipeline.
- **Auto-migration in a deploy hook.** Rejected: surprise DDL under load;
  migration stays an explicit pre-deploy tunnel step.
- **Cloning the staging DB into prod.** Rejected: test data and ghost accounts
  have no place in a PII system of record; prod is born empty and bootstrapped
  from the reference catalog + seed scripts.
- **A hand-rolled `bin/deploy` wrapper script for guardrails.** Rejected in
  favor of Kamal-native hooks, which are the documented mechanism for exactly
  this and keep the command surface raw.

## Lessons carried from the donor system's launch

The architecture donor (`petition-management`) ran this exact topology to a
real production launch and recorded operational lessons worth inheriting as
warnings, without replaying its launch-day specifics here:

- **Build-once holds for behavior, not for shell-baked metadata.** Anything
  baked into a prerendered static shell (canonical URLs, OG tags, hreflang) is
  environment-specific even when the image is not; resolve whether that
  metadata is request-time or per-env-build *before* it becomes a launch
  blocker.
- **A registry-placement fallback is worth having.** If the self-hosted
  registry isn't ready when a deploy is needed, falling back to a public
  registry (e.g. GHCR) is an acceptable temporary bridge as long as the
  committed self-hosted direction doesn't get quietly abandoned.
- **Sequence the backup gate correctly.** The backup stack must land before
  the first deploy that opens real user sign-in / PII writes on an otherwise
  unbacked production database — not necessarily before the DNS flip itself,
  if some other mechanism (e.g. a feature flag) is holding real user data out
  in the meantime.
