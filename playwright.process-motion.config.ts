import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", testMatch: "process-motion.spec.ts", outputDir: "test-results/process-motion",
  timeout: 35_000, workers: 2,
  use: { baseURL: "http://127.0.0.1:3106", video: "off", trace: "off" },
  webServer: { command: "node scripts/preview-static.mjs 3106", url: "http://127.0.0.1:3106", reuseExistingServer: false },
  projects: [1440, 768, 390, 360].map(width => ({ name: `process-${width}`, use: {
    browserName: "chromium", viewport: { width, height: 900 }, deviceScaleFactor: width < 768 ? 3 : 2,
    hasTouch: width < 768, isMobile: width < 768,
  } })),
});
