import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/index.ts"],
  format: ["esm"],

  // Workspace packages export raw TS (no build step); inline them so the prod
  // bundle is node-runnable. npm deps stay external (resolved from node_modules).
  noExternal: [/^@jp\//],
  outDir: "dist",
  sourcemap: true,
  target: "node22",
});
