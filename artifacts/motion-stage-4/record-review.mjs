import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const directory = 'artifacts/motion-stage-4';
const browser = await chromium.launch();
const evidence = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width === 390 ? 3 : 2,
    hasTouch: width === 390, isMobile: width === 390, recordVideo: { dir: `${directory}/recordings`, size: { width, height: 900 } } });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' && route.request().method() === 'GET' ? route.continue() : route.abort());
  const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:3102'); await page.waitForTimeout(1600);
  await page.screenshot({ path: `${directory}/nav-${width}-rest.png`, scale: 'css' });
  if (width === 1440) {
    for (const link of await page.locator('#main-navigation a').all()) { await link.hover(); await page.waitForTimeout(450); }
    await page.screenshot({ path: `${directory}/nav-1440-hover.png`, scale: 'css' });
    await page.mouse.down(); await page.waitForTimeout(300);
    await page.screenshot({ path: `${directory}/nav-1440-press.png`, scale: 'css' });
    await page.mouse.move(20, 400); await page.mouse.up();
    for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 80); await page.waitForTimeout(200); }
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${directory}/nav-1440-scrolled.png`, scale: 'css' });
    await page.locator('header .brand').focus();
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(300); }
    await page.screenshot({ path: `${directory}/nav-1440-keyboard.png`, scale: 'css' });
  } else {
    await page.locator('header .brand').focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${directory}/nav-390-door-moving.png`, scale: 'css' });
    await page.waitForTimeout(400);
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(250); }
    await page.keyboard.press('Shift+Tab');
    await page.screenshot({ path: `${directory}/nav-390-open-keyboard.png`, scale: 'css' });
    await page.keyboard.press('Escape'); await page.waitForTimeout(350);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.keyboard.press('Enter'); await page.waitForTimeout(65);
    await page.screenshot({ path: `${directory}/nav-390-reduced-moving.png`, scale: 'css' });
    await page.waitForTimeout(200);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(250); }
    await page.screenshot({ path: `${directory}/nav-390-reduced-keyboard.png`, scale: 'css' });
    await page.keyboard.press('Escape'); await page.waitForTimeout(350);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: 'Open menu' }).tap(); await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Close menu' }).tap();
  }
  await page.waitForTimeout(800);
  evidence.push({ width, errors, bodyOverflow: await page.evaluate(() => getComputedStyle(document.body).overflow) });
  const video = page.video(); await context.close(); await video.saveAs(`${directory}/nav-review-${width}.webm`);
}
await browser.close(); await writeFile(`${directory}/recording-results.json`, JSON.stringify(evidence, null, 2));
console.log('Saved nav review recordings at 1440px and 390px.');
