import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", testMatch: "utility-motion.spec.ts", outputDir: "test-results/utility-motion",
  timeout: 35_000, workers: 2,
  use: { baseURL: "http://127.0.0.1:3107", video: "off", trace: "off" },
  webServer: { command: "node scripts/preview-static.mjs 3107", url: "http://127.0.0.1:3107", reuseExistingServer: false },
  projects: [1440, 768, 390, 360].map(width => ({ name: `utility-${width}`, use: {
    browserName: "chromium", viewport: { width, height: 900 }, deviceScaleFactor: width < 768 ? 3 : 2,
    hasTouch: width < 768, isMobile: width < 768,
  } })),
});
