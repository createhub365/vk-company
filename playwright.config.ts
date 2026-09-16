import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "artifacts/submit-tilt-staging/e2e-results",
  timeout: 60_000,
  workers: 2,
  use: { baseURL: "http://127.0.0.1:3102", trace: "on-first-retry" },
  webServer: { command: "node scripts/preview-static.mjs 3102", url: "http://127.0.0.1:3102", reuseExistingServer: false },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 900 } } }
  ]
});
