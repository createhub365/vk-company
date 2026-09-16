import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const serviceRecheck = process.argv.includes('--services');
const reduced = process.argv.includes('--reduced');
const routes = serviceRecheck ? ['/services/domestic', '/services/international'] : ['/services/domestic', '/services/international', '/about', '/contact', '/get-a-quote', '/faq', '/track', '/privacy', '/terms', '/404.html'];
const browser = await chromium.launch();
const results = [];
let blockedSubmissions = 0;
try {
  for (const width of [1440, 768, 390, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2, hasTouch: width < 768, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await context.route('**/*', route => {
      const readOnly = ['GET', 'HEAD'].includes(route.request().method());
      if (!readOnly) blockedSubmissions++;
      return new URL(route.request().url()).hostname === '127.0.0.1' && readOnly ? route.continue() : route.abort();
    });
    await context.addInitScript(() => {
      window.riseEvidence = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        if (this.dataset.depthMotion === 'rise') window.riseEvidence.push({ frames, options, text: this.textContent.slice(0, 100) });
        return animate.call(this, frames, options);
      };
    });
    const page = await context.newPage();
    for (const route of routes) {
      const errors = [];
      const listener = error => errors.push(error.message);
      page.on('pageerror', listener);
      await page.goto(`http://127.0.0.1:3102${route}`);
      await page.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
      await page.waitForTimeout(900);
      const initial = await page.locator('main h1').evaluate(e => {
        let opacity = 1;
        for (let p = e; p; p = p.parentElement) opacity *= Number(getComputedStyle(p).opacity);
        return { opacity, text: e.textContent };
      });
      assert.equal(initial.opacity, 1);
      const samples = [];
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      for (let y = 0; y <= max + 300; y += 300) {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Math.min(max, y));
        await page.waitForTimeout(90);
        samples.push(await page.evaluate(() => ({
          y: scrollY,
          overflow: document.documentElement.scrollWidth > innerWidth,
          planes: [...document.querySelectorAll('main [data-depth-motion="parallax"]')].map(e => {
            const m = new DOMMatrix(getComputedStyle(e).transform);
            return { z: m.m43, scale: m.m11, rotationX: m.m23, rotationY: m.m13, willChange: getComputedStyle(e).willChange };
          }),
        })));
      }
      await page.waitForTimeout(1050);
      const settled = await page.evaluate(() => ({
        rise: window.riseEvidence,
        hints: [...document.querySelectorAll('main [data-depth-motion]')].filter(e => getComputedStyle(e).willChange !== 'auto').length,
        images: [...document.images].every(i => i.complete && i.naturalWidth > 0),
        quoteParallax: document.querySelector('.quote-media')?.closest('.parallax-media') !== null,
        scrollMode: document.documentElement.dataset.depthScroll || 'native',
      }));
      assert.deepEqual(errors, [], `${width} ${route} browser errors`);
      assert(!samples.some(s => s.overflow), `${width} ${route} scrolling overflow`);
      assert.equal(settled.hints, 0, `${width} ${route} idle will-change`);
      if (reduced) {
        assert.equal(settled.rise.length, 0);
        assert.equal(settled.scrollMode, 'native');
        assert(samples.every(sample => sample.planes.every(plane => plane.z === 0 && plane.scale === 1)));
      }
      assert(settled.images);
      for (const sample of samples) for (const plane of sample.planes) {
        assert.equal(plane.rotationX, 0); assert.equal(plane.rotationY, 0);
        assert(plane.z >= (width < 768 ? -20 : -40) - .01 && plane.z <= (width < 768 ? 10 : 20) + .01);
      }
      if (route === '/get-a-quote') {
        assert.equal(settled.scrollMode, 'native');
        assert.equal(settled.quoteParallax, false);
        assert.equal(await page.locator('form .notice').innerText(), 'Submitting this form creates an enquiry. It does not confirm a quote, booking, pickup or dispatch.');
        assert.equal(await page.locator('form .notice').evaluate(e => e.closest('[data-depth-motion="rise"]') !== null), false);
      }
      if (['/contact', '/get-a-quote'].includes(route)) {
        await page.locator('input[name="name"]').focus();
        await page.keyboard.type('Local motion review');
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('input[name="phone"]').evaluate(e => document.activeElement === e), true);
        assert.notEqual(await page.locator('input[name="phone"]').evaluate(e => getComputedStyle(e).outlineStyle), 'none');
      }
      if (route === '/faq') {
        const summary = page.locator('main summary').first();
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await summary.evaluate(e => e.parentElement.open), true);
        await page.keyboard.press('Space');
        assert.equal(await summary.evaluate(e => e.parentElement.open), false);
      }
      results.push({ route, width, mode: 'motion', initial, samples, settled, errors });
      if (!reduced && [1440, 390].includes(width) && ['/services/domestic', '/about', '/contact'].includes(route)) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(700);
        await page.screenshot({ path: `artifacts/motion-stage-9/after/wrappers/after/${route.replaceAll('/', '-').slice(1)}-${width}-motion.png`, fullPage: true, scale: 'css' });
      }
      console.log('motion', width, route, 'PASS', settled.rise.length, 'reveals');
      page.off('pageerror', listener);
    }
    await context.close();
  }
  for (const width of reduced ? [] : [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:3102${route}`);
      const state = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, primitives: [...document.querySelectorAll('[data-depth-motion]')].map(e => ({ opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform })) }));
      assert(!state.overflow);
      assert(state.primitives.every(p => p.opacity === '1' && p.transform === 'none'));
      results.push({ route, width, mode: 'no-js', ...state });
      console.log('no-js', width, route, 'PASS');
    }
    await context.close();
  }
  assert.equal(blockedSubmissions, 0);
} finally {
  await browser.close();
  await writeFile(`artifacts/motion-stage-9/after/wrappers/${reduced ? 'reduced-' : ''}${serviceRecheck ? 'service-final-' : ''}motion-results.json`, JSON.stringify({ results, blockedSubmissions }, null, 2));
}
