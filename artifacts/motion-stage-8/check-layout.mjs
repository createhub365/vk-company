import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const phase = process.argv[2];
assert(['before', 'after'].includes(phase));
const directory = `artifacts/motion-stage-8/${phase}`;
await mkdir(directory, { recursive: true });
const routes = ['/services/domestic', '/services/international', '/about', '/contact', '/get-a-quote', '/faq', '/track', '/privacy', '/terms', '/404.html'];
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 768, 390, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce', hasTouch: width < 768 });
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' && route.request().method() === 'GET' ? route.continue() : route.abort());
    const page = await context.newPage();
    for (const route of routes) {
      const errors = [];
      const listener = error => errors.push(error.message);
      page.on('pageerror', listener);
      const response = await page.goto(`http://127.0.0.1:3102${route}`);
      assert.equal(response.headers()['x-content-type-options'], 'nosniff');
      await page.locator('main').waitFor();
      await page.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); await document.fonts.ready; });
      await page.waitForTimeout(150);
      const result = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
        images: [...document.images].map(image => ({ src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0 })),
        boxes: [...document.querySelectorAll('main h1,main h2,main h3,main p,main img,main input,main textarea,main select,main details')].map(element => {
          const box = element.getBoundingClientRect();
          return { tag: element.tagName, key: element.getAttribute('src') || element.getAttribute('name') || element.textContent.trim(), x: box.x, y: box.y + scrollY, width: box.width, height: box.height };
        }),
        primitives: [...document.querySelectorAll('[data-depth-motion]')].map(element => ({ transform: getComputedStyle(element).transform, opacity: getComputedStyle(element).opacity, willChange: getComputedStyle(element).willChange })),
      }));
      assert(!result.overflow, `${width} ${route} overflow`);
      assert(result.images.every(image => image.loaded), `${width} ${route} images`);
      assert.deepEqual(errors, []);
      assert(result.primitives.every(p => p.transform === 'none' && p.opacity === '1' && p.willChange === 'auto'));
      results.push({ route, width, ...result });
      if ([1440, 390].includes(width) && ['/services/domestic', '/about', '/contact'].includes(route)) {
        await page.screenshot({ path: `${directory}/${route.replaceAll('/', '-').slice(1)}-${width}.png`, fullPage: true, scale: 'css' });
      }
      page.off('pageerror', listener);
      console.log(phase, width, route, 'PASS');
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(`${directory}/layout.json`, JSON.stringify(results, null, 2));
if (phase === 'after') {
  const before = JSON.parse(await readFile('artifacts/motion-stage-8/before/layout.json', 'utf8'));
  const differences = [];
  results.forEach((now, index) => {
    const old = before[index];
    assert.equal(now.boxes.length, old.boxes.length);
    now.boxes.forEach((box, i) => {
      assert.equal(box.key, old.boxes[i].key);
      const changed = ['x', 'y', 'width', 'height'].filter(key => Math.abs(box[key] - old.boxes[i][key]) > 1);
      if (changed.length) differences.push({ route: now.route, width: now.width, index: i, changed, before: old.boxes[i], after: box });
    });
  });
  await writeFile('artifacts/motion-stage-8/layout-differences.json', JSON.stringify(differences, null, 2));
  console.log('Layout differences:', differences.length);
  assert.equal(differences.length, 0, 'Resting layout must be preserved');
}
