import { defineConfig, devices } from "@playwright/test";

// Foundation smoke harness: RSC + cacheComponents resist unit testing, so e2e is
// the baseline. webServer boots the dev server; SITE_URL is injected so the run
// is self-contained in CI (no monorepo-root .env required there).
export default defineConfig({
  forbidOnly: !!process.env.CI,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm dev",
    env: { SITE_URL: "http://localhost:3000" },
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    url: "http://localhost:3000/en",
  },
});
