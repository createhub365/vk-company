import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const phase = process.argv[2];
const all = process.argv.includes('--all');
const directory = `artifacts/motion-stage-9/${phase}`;
await mkdir(directory, { recursive: true });
const routes = all ? ['/', '/services/domestic', '/services/international', '/about', '/contact', '/get-a-quote', '/faq', '/track', '/privacy', '/terms', '/404.html'] : ['/', '/services/domestic', '/services/international', '/contact', '/get-a-quote'];
const browser = await chromium.launch();
const results = [];
try {
 for (const route of routes) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' && ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort());
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
   window.profile = { tasks: [], frames: [], running: false, rafOwners: {}, pending: new Map(), maxPending: 0 };
   new PerformanceObserver(list => window.profile.tasks.push(...list.getEntries().map(e => ({ start: e.startTime, duration: e.duration, name: e.name })))).observe({ type: 'longtask', buffered: true });
   const request = window.requestAnimationFrame, cancel = window.cancelAnimationFrame;
   window.requestAnimationFrame = function(callback) {
    const label = callback.name || callback.toString().slice(0, 120);
    const id = request.call(window, time => { window.profile.pending.delete(id); window.profile.rafOwners[label] = (window.profile.rafOwners[label] || 0) + 1; callback(time); });
    window.profile.pending.set(id, label); window.profile.maxPending = Math.max(window.profile.maxPending, window.profile.pending.size); return id;
   };
   window.cancelAnimationFrame = id => { window.profile.pending.delete(id); return cancel.call(window, id); };
   // Measurement-only sampler uses the original rAF so it is excluded from the
   // application scheduler audit. Frame gaps are estimates, not GPU counters.
   window.beginScrollProfile = () => {
    window.profile.start = performance.now(); window.profile.running = true;
    function sample(t) { if (!window.profile.running) return; window.profile.frames.push(t); request.call(window, sample); }
    request.call(window, sample);
   };
  });
  const response = await page.goto(`${process.env.PREVIEW_ORIGIN || "http://127.0.0.1:3102"}${route}`);
  assert.equal(response.headers()['x-content-type-options'], 'nosniff');
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.beginScrollProfile());
  let bottom = false;
  for (let i = 0; i < 100; i++) {
   await page.mouse.wheel(0, 380); await page.waitForTimeout(180);
   bottom = await page.evaluate(() => scrollY >= document.documentElement.scrollHeight - innerHeight - 2);
   if (bottom) break;
  }
  await page.waitForTimeout(1100);
  const result = await page.evaluate(() => {
   window.profile.running = false;
   return { start: window.profile.start, tasks: window.profile.tasks.filter(t => t.start >= window.profile.start), loadTasks: window.profile.tasks.filter(t => t.start < window.profile.start), frames: window.profile.frames, rafOwners: window.profile.rafOwners, maxPending: window.profile.maxPending, pending: [...window.profile.pending.values()], hints: [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).willChange !== 'auto').map(e => ({ tag: e.tagName, class: e.className, hint: getComputedStyle(e).willChange })), overflow: document.documentElement.scrollWidth > innerWidth, scroll: scrollY, max: document.documentElement.scrollHeight - innerHeight, quoteFrames: document.querySelector('.quote-bubble-canvas')?.dataset.frames, mode: document.documentElement.dataset.depthScroll || 'native' };
  });
  assert(bottom, `Did not reach bottom: ${route}`);
  const gaps = result.frames.slice(1).map((value, i) => value - result.frames[i]);
  const sorted = [...gaps].sort((a, b) => a - b);
  const frameBudget = 1000 / 60;
  const estimatedMissedFrames = gaps.reduce((sum, gap) => sum + Math.max(0, Math.round(gap / frameBudget) - 1), 0);
  const row = { route, cpuSlowdown: 4, viewport: '390x844@2x', frameBudget, estimatedMissedFrames, gapsOver50ms: gaps.filter(g => g > 50).length, frameP95Ms: sorted[Math.floor(sorted.length * .95)], longestFrameMs: Math.max(...gaps), maxLongTaskMs: Math.max(0, ...result.tasks.map(t => t.duration)), ...result };
  results.push(row);
  await writeFile(`${directory}/scroll-summary.json`, JSON.stringify(results, null, 2));
  console.log(phase, route, 'longest task', row.maxLongTaskMs, 'estimated missed frames', estimatedMissedFrames, 'p95', row.frameP95Ms, 'idle hints', result.hints.length);
  await context.close();
 }
} finally { await browser.close(); }
