import base from "./playwright.config";
import { defineConfig } from "@playwright/test";

// Validate the static export with its Pages headers and the existing form mocks.
export default defineConfig({
  ...base,
  testIgnore: "image-feedback.spec.ts",
  outputDir: "test-results/media-public",
  use: { ...base.use, baseURL: "http://127.0.0.1:3103" },
  webServer: { command: "node scripts/preview-static.mjs 3103", url: "http://127.0.0.1:3103", reuseExistingServer: false },
});
