import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
const directory = 'artifacts/motion-stage-5';
const browser = await chromium.launch();
const results = [];
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(pathToFileURL(resolve(`${directory}/editorial-review-${width}.webm`)).href);
  const video = page.locator('video');
  await video.evaluate(v => new Promise(resolve => { v.pause(); if (v.readyState >= 1) resolve(); else v.addEventListener('loadedmetadata', resolve, { once: true }); }));
  results.push(await video.evaluate(v => ({ width: v.videoWidth, height: v.videoHeight, duration: v.duration })));
  for (const time of [4, 7]) {
    await video.evaluate((v, time) => new Promise(resolve => { v.addEventListener('seeked', resolve, { once: true }); v.currentTime = time; }), time);
    await video.screenshot({ path: `${directory}/recording-${width}-${time}.png` });
  }
  await page.close();
}
await browser.close(); await writeFile(`${directory}/recording-metadata.json`, JSON.stringify(results, null, 2)); console.log(results);
