import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'../../tests/e2e',testMatch:'service-tilt.spec.ts',outputDir:'./tilt-results',workers:1,timeout:45000,
reporter:[['list'],['json',{outputFile:'tilt-results.json'}]],
use:{baseURL:'http://127.0.0.1:3110',browserName:'chromium',video:'off',trace:'off'}});
