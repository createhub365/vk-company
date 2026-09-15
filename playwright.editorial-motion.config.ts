import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e", testMatch: "editorial-motion.spec.ts", outputDir: "test-results/editorial-motion",
  timeout: 45_000, workers: 2,
  use: { baseURL: "http://127.0.0.1:3105", trace: "retain-on-failure" },
  webServer: { command: "node scripts/preview-static.mjs 3105", url: "http://127.0.0.1:3105", reuseExistingServer: false },
  projects: [1440, 768, 390, 360].map(width => ({ name: `editorial-${width}`, use: {
    browserName: "chromium", viewport: { width, height: 900 }, deviceScaleFactor: width < 768 ? 3 : 2,
    hasTouch: width < 768, isMobile: width < 768,
  } })),
});
