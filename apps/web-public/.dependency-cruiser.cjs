"use strict";
// FSD import-direction guard. Layer order: shared < entities < features < widgets
// < views < app. `pages` is renamed `views` (Next reserves src/pages); routing is
// the Next `app/` segment tree (no TanStack routes/). Layers are created JIT, so a
// rule simply never matches until its folder exists.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      from: { path: "^src/shared" },
      name: "fsd-shared-no-upper-layers",
      severity: "error",
      to: { path: "^src/(entities|features|widgets|views|app)" },
    },
    {
      from: { path: "^src/entities" },
      name: "fsd-entities-no-upper-layers",
      severity: "error",
      to: { path: "^src/(features|widgets|views|app)" },
    },
    {
      from: { path: "^src/features" },
      name: "fsd-features-no-upper-layers",
      severity: "error",
      to: { path: "^src/(widgets|views|app)" },
    },
    {
      from: { path: "^src/widgets" },
      name: "fsd-widgets-no-views-or-app",
      severity: "error",
      to: { path: "^src/(views|app)" },
    },
    {
      from: { path: "^src/views" },
      name: "fsd-views-no-app",
      severity: "error",
      to: { path: "^src/app" },
    },
    {
      comment:
        "ADR-0069: portal's sole shared/cms dependency is the office-contact accessor" +
        " (marketing views are exempt; add new ones here consciously)",
      from: {
        path: "^src/(features|views|app/\\[locale\\]/portal)",
        pathNot: "^src/views/(articles|gallery|home|videos)",
      },
      name: "portal-cms-office-contact-only",
      severity: "error",
      to: {
        path: "^src/shared/cms",
        pathNot: "^src/shared/cms/office-contact(\\.logic)?\\.ts$",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      conditionNames: ["import", "require", "node", "default"],
      exportsFields: ["exports"],
    },
    exclude: { path: "node_modules" },
    tsConfig: { fileName: "./tsconfig.json" },
  },
};
