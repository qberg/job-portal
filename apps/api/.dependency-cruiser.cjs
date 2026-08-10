"use strict";
/**
 * Domain-Oriented Modular Monolith (ADR-0016) + per-module hexagonal segments.
 * CQRS-lite: query/ READS, repo/ WRITES, never blur. domain/ pure core.
 * commands/ orchestrate (tx, Result). handlers/ = thin oRPC driving adapter.
 * Composition root = src/rpc/router.ts + kernel/orpc/handlers.ts (mounts router).
 * Contract: apps/api/CLAUDE.md.
 * @type {import('dependency-cruiser').IConfiguration}
 */
const SEG = "^src/(modules|shared)/[^/]+";

module.exports = {
  forbidden: [
    {
      comment:
        "domain/ is pure logic — valibot, @jp/domain-types, @jp/auth/can, contract schemas only. No db, no infra, no adapters.",
      from: { path: `${SEG}/domain/` },
      name: "domain-stays-pure",
      severity: "error",
      to: {
        path: [
          "@jp/database",
          "drizzle-orm",
          "@jp/cache",
          "@jp/logger",
          "(/query/|/repo/|/commands/|/handlers/)",
          "\\.handler\\.ts$",
          "kernel/orpc",
          "^src/rpc",
        ],
      },
    },
    {
      comment:
        "query/ is the READ side. It never imports the write side (repo/), the orchestrator (commands/), or the wire (handlers/oRPC). Shared Row/Scope/SQL go in <aggregate>.model.ts.",
      from: { path: `${SEG}/query/` },
      name: "query-reads-only",
      severity: "error",
      to: {
        path: [
          "(/repo/|/commands/|/handlers/)",
          "\\.handler\\.ts$",
          "kernel/orpc",
          "^src/rpc",
        ],
      },
    },
    {
      comment:
        "repo/ is the WRITE side (driven adapter). It never imports the read side (query/), the orchestrator (commands/), or the wire (handlers/oRPC).",
      from: { path: `${SEG}/repo/` },
      name: "repo-writes-only",
      severity: "error",
      to: {
        path: [
          "(/query/|/commands/|/handlers/)",
          "\\.handler\\.ts$",
          "kernel/orpc",
          "^src/rpc",
        ],
      },
    },
    {
      comment:
        "<aggregate>.model.ts holds persistence contracts (Row types, Scope VO, scope SQL). Leaf: @jp/database + drizzle + @jp/domain-types only — no segment imports.",
      from: { path: `${SEG}/[^/]+\\.model\\.ts$` },
      name: "model-is-leaf",
      severity: "error",
      to: {
        path: [
          "(/domain/|/query/|/repo/|/commands/|/handlers/)",
          "\\.handler\\.ts$",
          "kernel/orpc",
          "^src/rpc",
        ],
      },
    },
    {
      comment:
        "commands/ orchestrate domain+query+repo in a tx. Transport-agnostic — no oRPC, no handlers, no router.",
      from: { path: `${SEG}/commands/` },
      name: "commands-no-wire",
      severity: "error",
      to: {
        path: ["(/handlers/)", "\\.handler\\.ts$", "kernel/orpc", "^src/rpc"],
      },
    },
    {
      comment:
        "*.handler.ts is the oRPC entrypoint — only the composition root (src/rpc) mounts handlers. Call command/query/repo, never another handler.",
      from: {
        path: "^src",
        pathNot: ["^src/rpc", "(/handlers/|\\.handler\\.ts$)"],
      },
      name: "handlers-are-the-sink",
      severity: "error",
      to: { path: "(/handlers/|\\.handler\\.ts$)" },
    },
    {
      comment:
        "Cross-module is allowed via command/query/repo (petitions promotes an engagement draft), but never reach into another module's handlers — its private wire surface.",
      from: { path: "^src/modules/([^/]+)/" },
      name: "no-foreign-module-handlers",
      severity: "error",
      to: {
        path: "^src/modules/[^/]+/(handlers/|[^/]*\\.handler\\.ts)",
        pathNot: "^src/modules/$1/",
      },
    },
    {
      comment:
        "shared/ is owned by nobody — it cannot depend on a module's language. Deps flow modules -> shared, never reverse.",
      from: { path: "^src/shared" },
      name: "shared-no-modules",
      severity: "error",
      to: { path: "^src/modules" },
    },
    {
      comment:
        "modules/shared must not import the composition root (src/rpc) or the handler-mount (kernel/orpc/handlers). Wiring depends on them, not the reverse.",
      from: { path: "^src/(modules|shared)" },
      name: "no-reach-into-composition",
      severity: "error",
      to: { path: ["^src/rpc", "kernel/orpc/handlers"] },
    },
    {
      comment:
        "Circular import — extract the shared piece into model.ts or a lower segment.",
      from: { path: "^src", pathNot: "node_modules" },
      name: "no-circular",
      severity: "error",
      to: { circular: true, path: "^src" },
    },
    {
      comment: "Orphan module — nothing imports it. Wire it up or delete it.",
      from: {
        orphan: true,
        pathNot: ["src/rpc/router\\.ts$", "\\.d\\.ts$"],
      },
      name: "no-orphans",
      severity: "warn",
      to: {},
    },
  ],
  options: {
    enhancedResolveOptions: {
      conditionNames: ["import", "require", "node", "default"],
      exportsFields: ["exports"],
    },
    exclude: { path: "\\.(test|spec)\\.ts$" },
    tsConfig: { fileName: "./tsconfig.json" },
    // see type-only imports so query⊥repo is total (no `import type` boundary cheats)
    // and type-only-consumed leaves (model.ts) aren't false-flagged as orphans.
    tsPreCompilationDeps: true,
  },
};
