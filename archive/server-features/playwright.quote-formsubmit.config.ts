import { defineConfig, devices } from "@playwright/test";

// Dedicated production server: never reuse a running server with unknown config.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["quote-formsubmit.spec.ts", "contact-validation.spec.ts"],
  outputDir: "test-results/quote-formsubmit",
  timeout: 60_000,
  workers: 2,
  use: { baseURL: "http://127.0.0.1:3102", trace: "retain-on-failure" },
  webServer: {
    command: "env -u SMTP_HOST -u SMTP_PORT -u SMTP_SECURE -u SMTP_USER -u SMTP_PASS -u NOTIFICATION_FROM_EMAIL -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY -u SUPABASE_SERVICE_ROLE_KEY npm run start -- --hostname 127.0.0.1 --port 3102",
    url: "http://127.0.0.1:3102", reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 } } },
  ],
});
