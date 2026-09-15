import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const directory = 'artifacts/motion-stage-5';
const browser = await chromium.launch(); const results = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width === 390 ? 3 : 2,
    hasTouch: width === 390, isMobile: width === 390, recordVideo: { dir: `${directory}/recordings`, size: { width, height: 900 } } });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' && route.request().method() === 'GET' ? route.continue() : route.abort());
  const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:3102'); await page.waitForTimeout(1400);
  const cdp = width === 390 ? await context.newCDPSession(page) : null;
  async function scrollTo(target) {
    if (!cdp) { await page.mouse.wheel(0, target - await page.evaluate(() => scrollY)); return; }
    for (let attempt = 0; attempt < 7; attempt++) {
      const delta = target - await page.evaluate(() => scrollY); if (Math.abs(delta) < 20) break;
      const travel = Math.sign(delta) * Math.min(Math.abs(delta), 350), start = travel > 0 ? 740 : 260;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 260, y: start }] });
      for (let step = 1; step <= 14; step++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 260, y: start - travel * step / 14 }] }); await page.waitForTimeout(25); }
      await page.waitForTimeout(130);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(180);
    }
  }
  for (const [name, selector] of [['domestic', '#domestic-services'], ['international', '.international-feature']]) {
    const section = page.locator(selector);
    const target = await section.evaluate(e => e.getBoundingClientRect().top + scrollY - 100);
    await scrollTo(target); await page.waitForTimeout(250);
    await page.screenshot({ path: `${directory}/${name}-${width}-moving.png`, scale: 'css' });
    await page.waitForTimeout(1300); await section.locator('img').evaluate(image => image.decode());
    await page.screenshot({ path: `${directory}/${name}-${width}-rest.png`, scale: 'css' });
    if (width === 1440) {
      const frame = section.locator('[data-photo-frame]'), box = await frame.boundingBox();
      await page.mouse.move(box.x + box.width * .85, box.y + box.height * .2, { steps: 8 }); await page.waitForTimeout(300);
      await frame.click({ position: { x: 70, y: 60 } }); await page.waitForTimeout(800);
    }
  }
  const back = await page.locator('#domestic-services').evaluate(e => e.getBoundingClientRect().top + scrollY - 100);
  await scrollTo(back); await page.waitForTimeout(1000);
  results.push({ width, errors, headings: await page.locator('.editorial-motion h2').allTextContents(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  await cdp?.detach(); const video = page.video(); await context.close(); await video.saveAs(`${directory}/editorial-review-${width}.webm`);
}
await browser.close(); await writeFile(`${directory}/recording-results.json`, JSON.stringify(results, null, 2));
console.log('Saved desktop wheel/pointer and mobile native-swipe editorial recordings.');
