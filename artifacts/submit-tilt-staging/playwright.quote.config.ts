import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'../../tests/e2e',testMatch:'quote-hit-testing.spec.ts',outputDir:'./quote-results',workers:1,timeout:40000,
reporter:[['list'],['json',{outputFile:'quote-results.json'}]],
use:{baseURL:'http://127.0.0.1:3110',browserName:'chromium',video:'off',trace:'off'}});
