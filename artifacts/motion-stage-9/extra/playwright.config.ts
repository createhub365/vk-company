import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'.', testMatch:'*.spec.ts', outputDir:'./results', grepInvert:/original section geometry/,workers:2,timeout:45000,retries:0,
reporter:[['list'],['json',{outputFile:'artifacts/motion-stage-9/extra/results.json'}]],
use:{baseURL:'http://127.0.0.1:3109',video:'off',trace:'off'},projects:[1440,390].map(width=>({name:`width-${width}`,use:{browserName:'chromium',viewport:{width,height:900},deviceScaleFactor:2,hasTouch:width<768,isMobile:width<768}}))});
