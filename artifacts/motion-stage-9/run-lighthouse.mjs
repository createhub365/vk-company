import lighthouse from './tooling/node_modules/lighthouse/core/index.js';
import * as chromeLauncher from './tooling/node_modules/chrome-launcher/dist/index.js';
import { chromium } from '@playwright/test';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const phase = process.argv[2];
const runs = Number(process.argv[3] || 3);
if (!/^[a-z0-9-]+$/.test(phase)) throw new Error('Provide an artifact phase');
const directory = `artifacts/motion-stage-9/${phase}`;
await mkdir(directory, { recursive: true });
const profile = resolve(directory, 'lighthouse-browser-profile');
await mkdir(profile, { recursive: true });
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), userDataDir: profile, chromeFlags: ['--headless=new', '--no-first-run', '--disable-extensions', '--no-sandbox'] });
const results = [];
const origin = process.env.LIGHTHOUSE_ORIGIN || 'http://127.0.0.1:3102';
try {
  for (const [name, route] of [['home', '/'], ['domestic', '/services/domestic'], ['international', '/services/international'], ['contact', '/contact'], ['quote', '/get-a-quote']]) {
    if (process.env.LIGHTHOUSE_PAGE && process.env.LIGHTHOUSE_PAGE !== name) continue;
    for (let run = 1; run <= runs; run++) {
      const result = await lighthouse(`${origin}${route}`, { port: chrome.port, logLevel: 'error', output: ['json', 'html'], onlyCategories: ['performance'], formFactor: 'mobile', throttlingMethod: 'simulate', disableFullPageScreenshot: true });
      if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError));
      const { lhr } = result;
      await writeFile(`${directory}/${name}-${run}.json`, JSON.stringify(lhr, null, 2));
      if (run === 1) await writeFile(`${directory}/${name}.html`, result.report[1]);
      const row = { name, route, run, performance: Math.round(lhr.categories.performance.score * 100), cls: lhr.audits['cumulative-layout-shift'].numericValue, lcpMs: lhr.audits['largest-contentful-paint'].numericValue, fcpMs: lhr.audits['first-contentful-paint'].numericValue, tbtMs: lhr.audits['total-blocking-time'].numericValue, speedIndexMs: lhr.audits['speed-index'].numericValue, version: lhr.lighthouseVersion, userAgent: lhr.userAgent, settings: lhr.configSettings };
      results.push(row);
      await writeFile(`${directory}/lighthouse-summary.json`, JSON.stringify(results, null, 2));
      console.log(phase, name, run, 'Performance', row.performance, 'CLS', row.cls, 'LCP', Math.round(row.lcpMs), 'TBT', row.tbtMs);
    }
  }
} finally { await chrome.kill(); await rm(profile, { recursive: true, force: true }); }
