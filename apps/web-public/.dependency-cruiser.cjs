// "use strict";
// // FSD import-direction guard. Layer order: shared < entities < features < widgets
// // < views < app. `pages` is renamed `views` (Next reserves src/pages); routing is
// // the Next `app/` segment tree (no TanStack routes/). Layers are created JIT, so a
// // rule simply never matches until its folder exists.
// /** @type {import('dependency-cruiser').IConfiguration} */
// module.exports = {
//   forbidden: [
//     {
//       name: "fsd-shared-no-upper-layers",
//       severity: "error",
//       from: { path: "^src/shared" },
//       to: { path: "^src/(entities|features|widgets|views|app)" },
//     },
//     {
//       name: "fsd-entities-no-upper-layers",
//       severity: "error",
//       from: { path: "^src/entities" },
//       to: { path: "^src/(features|widgets|views|app)" },
//     },
//     {
//       name: "fsd-features-no-upper-layers",
//       severity: "error",
//       from: { path: "^src/features" },
//       to: { path: "^src/(widgets|views|app)" },
//     },
//     {
//       name: "fsd-widgets-no-views-or-app",
//       severity: "error",
//       from: { path: "^src/widgets" },
//       to: { path: "^src/(views|app)" },
//     },
//     {
//       name: "fsd-views-no-app",
//       severity: "error",
//       from: { path: "^src/views" },
//       to: { path: "^src/app" },
//     },
//     {
//       name: "map-canvas-dynamic-only",
//       severity: "error",
//       comment:
//         "maplibre-gl is ~200KB gz; only next/dynamic may load the canvas (bundle-dynamic-imports)",
//       from: { pathNot: "^src/features/location/map-canvas" },
//       to: { path: "^src/features/location/map-canvas", dynamic: false },
//     },
//     {
//       name: "map-stage-canvas-dynamic-only",
//       severity: "error",
//       comment:
//         "maplibre-gl is ~200KB gz; only next/dynamic may load the MapStage canvas",
//       from: { pathNot: "^src/widgets/map-stage/map-stage-canvas" },
//       to: { path: "^src/widgets/map-stage/map-stage-canvas", dynamic: false },
//     },
//     {
//       name: "office-map-dynamic-only",
//       severity: "error",
//       comment:
//         "mapbox-gl is ~230KB gz; only next/dynamic may load the office map leaf",
//       from: { pathNot: "^src/widgets/office-location/office-map" },
//       to: { path: "^src/widgets/office-location/office-map", dynamic: false },
//     },
//     {
//       name: "portal-cms-office-contact-only",
//       severity: "error",
//       comment:
//         "ADR-0069: portal's sole shared/cms dependency is the office-contact accessor" +
//         " (marketing views are exempt; add new ones here consciously)",
//       from: {
//         path: "^src/(features|views|app/\\[locale\\]/portal)",
//         pathNot: "^src/views/(articles|gallery|home|videos)",
//       },
//       to: {
//         path: "^src/shared/cms",
//         pathNot: "^src/shared/cms/office-contact(\\.logic)?\\.ts$",
//       },
//     },
//   ],
//   options: {
//     doNotFollow: { path: "node_modules" },
//     exclude: { path: "node_modules" },
//     tsConfig: { fileName: "./tsconfig.json" },
//     enhancedResolveOptions: {
//       exportsFields: ["exports"],
//       conditionNames: ["import", "require", "node", "default"],
//     },
//   },
// };
