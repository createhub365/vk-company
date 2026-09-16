import{defineConfig}from'@playwright/test';
export default defineConfig({testDir:'../../tests/e2e',testMatch:['image-feedback.spec.ts','reference-designs.spec.ts'],outputDir:'./feedback-results',workers:1,timeout:40000,
use:{baseURL:'http://127.0.0.1:3110',browserName:'chromium',viewport:{width:1440,height:900},trace:'off',video:'off'}});
