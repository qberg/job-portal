# ADR-0008 — API Module-Internal Segments: Hexagonal + CQRS-lite, dependency-cruiser enforced

**Status:** Accepted. Refines ADR-0006 (named the kernel/shared/modules buckets;
left module *internals* undefined — "mirror lazily"). This ADR defines the
vertical *inside* an `apps/api` module/context.

**Date:** 2026-06-27

## Context

ADR-0006 gives buckets but not the shape *within* a context. Without a named
internal structure, agents invent ad-hoc folders, put writes in read files,
weld business flow to oRPC handlers, and let read/write code entangle. We own
the whole stack and this is going to be a large codebase — lock the best
pattern while small so agents don't trip themselves. The structure must be
*enforced*, not just documented, because prose rules rot.

## Decision

Every `modules/<ctx>/` (and `shared/<ctx>/`) mirrors a **hexagonal (ports &
adapters) + vertical-slice + CQRS-lite** segment set, created JIT:

| Segment | Role (hexagonal) | Imports |
| --- | --- | --- |
| `domain/` | core — pure business logic, no IO | `@jp/domain-types`, `valibot`, `@jp/auth/can`, contract schemas, `node:*` |
| `<aggregate>.model.ts` | persistence contract leaf — Row types + Scope VO + scope SQL helper | `@jp/database`, `drizzle`, `@jp/domain-types` |
| `query/ *.query.ts` | driven adapter — **READS** | `model`, `@jp/database`, `drizzle`, `domain` |
| `repo/ *.repo.ts` | driven adapter — **WRITES** | `model`, `@jp/database`, `drizzle`, `domain` |
| `commands/ *.command.ts` | application service — orchestrate in a tx, return `Result` | `query`, `repo`, `domain`, `model`, `kernel` |
| `handlers/ *.handler.ts` | driving adapter (oRPC) — **thin** | `command` \| `query`, `domain`, mapper, `kernel/orpc` |

**Invariants (dependency-cruiser `pnpm check:arch`, Stop-hook gate):**

1. **domain is pure** — no db/infra/adapter imports.
2. **query READS, repo WRITES — never blur.** A DELETE is a write → `repo/`. No
   mutation in a `.query.ts`.
3. **query ⊥ repo, total** (incl. `import type` — `tsPreCompilationDeps:
   true`). Shared Row/Scope/SQL → `model.ts`.
4. **handler is thin, NOT the orchestrator — the command is.** handler = authz
   gate → delegate → map DTO/error. No business logic, no direct drizzle.
5. **read path** = `handler → query` (no command — wrapping one read is
   ceremony). **write path** = `handler → command → repo`. EXCEPTION: a single
   atomic statement (one `INSERT`/`DELETE … RETURNING`, e.g. an AIP-235 batch
   endpoint, ADR-0007) may go `handler → repo` direct. **A command exists only
   when a write spans ≥2 repo ops OR needs domain decisioning inside a tx.** No
   empty pass-through commands.
6. **cross-module** via `command`/`query`/`repo` is fine (e.g. applications
   promoting a candidate draft that a different module owns); never import
   another module's `handlers/` — its private wire surface.
7. **composition root** = `rpc/router.ts` + `kernel/orpc/handlers.ts` (mounts
   router); modules/shared never import it.

Tests (`*.test.ts`) are excluded from the boundary rules — integration tests
legitimately cross segments.

## Consequences

- `apps/api/CLAUDE.md` carries the terse rule; this ADR carries the rationale.
- dep-cruiser configs live per app (`apps/{api,web-admin,web-public}/.dependency-cruiser.cjs`);
  api adds the query/repo/model rules, web-admin enforces FSD layers (its own
  concern).
- `model.ts` is JIT — only where query AND repo share a contract. No empty
  segment dirs.

## Alternatives considered

- **reader/writer suffix in one `repo/` folder.** Rejected: segregation by
  filename, not gate-able cleanly; a write can hide in a `.reader.ts` and go
  unnoticed. Folder split makes it structural.
- **Full CQRS (separate read model + event projection).** Rejected:
  unjustified complexity at this scale.
- **Handler-as-orchestrator.** Rejected: couples use-cases to the transport;
  not reusable from CLI/jobs.
- **`query/` + `repo/` only, no `model.ts`.** Rejected: forces a query→repo
  edge for the shared Row/scope; breaks invariant 3.

## Why

**Pragmatic CQRS-lite** (Young/Vernon/Fowler): the read side bypasses the
domain/use-case layer and hits an optimized query — the recommended 90%
pattern. Full CQRS (separate stores + projections) is over-engineering for an
admin-heavy CRUD system at this scale. **Command-as-orchestrator** keeps
business flow transport-agnostic: a command function is callable from a
CLI/job/test without oRPC. Orchestration in the handler would weld it to HTTP.
**Enforced, not advised** — boundaries that aren't gated rot. The hook blocks
at Stop; agents can't land a violation. CLAUDE.md teaches intent, dep-cruiser
enforces structure. **`model.ts` leaf** breaks the only honest read↔write
coupling (shared Row type / scope helper) without a query→repo edge.
