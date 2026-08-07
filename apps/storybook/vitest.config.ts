import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Runs every *.stories play() as a headless-browser test. main.ts viteFinal
// (tailwind) is inherited via configDir, so token styles load in-test.
const storybookDir = fileURLToPath(new URL("./.storybook", import.meta.url));
const storybookPlugins = await storybookTest({ configDir: storybookDir });

export default defineConfig({
  plugins: storybookPlugins,
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
    },
    name: "storybook",
    setupFiles: ["./.storybook/vitest.setup.ts"],
  },
});
