import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: '.', testMatch: '*.spec.ts', outputDir: './results',
 grepInvert: /frozen navigation and existing page geometry/,
 workers: 2, timeout: 45000, retries: 0,
 reporter: [['list'], ['json', { outputFile: 'artifacts/motion-stage-9/regression/results.json' }]],
 use: { baseURL: 'http://127.0.0.1:3109', video: 'off', trace: 'off' },
 projects: [1440,768,390,360].map(width=>({name:`width-${width}`,use:{browserName:'chromium',viewport:{width,height:900},deviceScaleFactor:2,hasTouch:width<768,isMobile:width<768}})),
});
