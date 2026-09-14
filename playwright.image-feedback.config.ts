import { defineConfig, devices } from "@playwright/test";

// Run after npm run build; dedicated local server with backend credentials unset.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "image-feedback.spec.ts",
  outputDir: "test-results/image-feedback-results",
  timeout: 60_000,
  workers: 2,
  use: { baseURL: "http://127.0.0.1:3101", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/preview-static.mjs 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", SUPABASE_SERVICE_ROLE_KEY: "" },
  },
  projects: [
    { name: "1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 } },
    { name: "390", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 } } },
    { name: "360", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 360, height: 800 } } },
  ],
});
