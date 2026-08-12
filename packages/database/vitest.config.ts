import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // integration tests share one Postgres DB, files run serially
    fileParallelism: false,
    // creates + migrates a dedicated *_test DB; never touches the dev DB
    globalSetup: ["./src/test/global-setup.ts"],
  },
});
