import{defineConfig}from'@playwright/test';
const baseURL=process.env.STAGING_PREVIEW_URL;
if(!baseURL||!new URL(baseURL).hostname.endsWith('.vk-company.pages.dev'))throw new Error('Supply the provider-verified staging preview URL');
export default defineConfig({testDir:'../../tests/e2e',testMatch:['quote-hit-testing.spec.ts','service-tilt.spec.ts'],grep:/Quote submit hit testing|service tilt 1440px|tilt disabled .*reduced.*true/,outputDir:'./live-results',workers:1,timeout:60000,
reporter:[['list'],['json',{outputFile:'live-results.json'}]],use:{baseURL,browserName:'chromium',trace:'off',video:'off'}});
