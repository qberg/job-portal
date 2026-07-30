# ADR-0006 — Domain-Oriented Modular Monolith: kernel / shared / modules, mirrored across layers

**Status:** Accepted

**Date:** 2026-06-21

## Context

The codebase spans many layers (database, domain-types, api, api-contract,
frontend). We want one cohesive structure so a change is local and — since
agents are a primary author — the layout is predictable and composable. Need a
named, scalable pattern, not ad-hoc folders.

## Decision

Adopt a **Domain-Oriented Modular Monolith** — DDD bounded contexts as
**vertical slices**, a small **Shared Kernel**, organized **package-by-feature**
and **mirrored isomorphically across every layer**. (Synthesis of: Modular
Monolith, DDD Bounded Contexts + Shared Kernel, Vertical Slice Architecture,
Screaming Architecture / package-by-feature; frontend = Feature-Sliced Design;
monorepo = Nx domain-library style.)

Three buckets, same names in every layer:

- **kernel** — cross-cutting *mechanism / identity*, no standalone domain noun
  (auth, i18n, audit, abac-engine).
- **shared** — cross-context *domain* reference/vocab, owned by no single
  context (job_category, employment_type, location, currency, seniority_level;
  shared value types).
- **modules/<context>** — exactly one bounded context (jobs, candidates,
  applications, employers, matching).

Bucket test: *≥2 contexts reference it* → shared/kernel. *Mechanism, no domain
noun* → kernel. *Belongs to one context's language* → module.

**Three rules (where most teams rot):**

1. **Keep the kernel small** — it is a coupling magnet; unsure → module, not
   kernel.
2. **Mirror only where the slice exists** — no empty layers; create each
   layer-slice lazily (JIT). Symmetry where present, never forced.
3. **Deps point inward** — modules → shared → kernel (refines ADR-0003).

## Consequences

- Reference data (job_category, employment_type, …) lives in **shared**, NOT a
  "collections module"; "Collections" is the admin *feature* that edits shared
  reference data.
- `localization` = kernel.
- Database uses `kernel.schema/` + `modules.schema/`; add `shared.schema/`.
  Other layers grow the same three buckets as slices appear.

## Alternatives considered

- **Per-context microservices.** Rejected at this stage: premature distributed-
  systems cost for a single team; the modular monolith gets locality of change
  without the operational overhead.
- **Flat, layer-first structure** (controllers/, services/, models/ across the
  whole app). Rejected: change locality suffers — one feature touches every
  top-level folder instead of one vertical slice.
- **Forced full mirroring of all three buckets in every layer from day one.**
  Rejected: creates empty scaffolding ahead of need; JIT mirroring keeps the
  tree honest about what actually exists.

## Why

Locality of change; predictable, guessable layout that minimizes agent
hallucination and makes composition mechanical; boundaries enforced by
dependency direction; ubiquitous language (the `CONTEXT.md` glossaries) carried
end-to-end.
