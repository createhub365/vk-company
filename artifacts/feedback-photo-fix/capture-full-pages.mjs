import {chromium} from '@playwright/test';
const browser=await chromium.launch();
for(const width of [1440,768,390,360]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 for(const route of ['about','services/domestic','services/international','contact']){
  await page.goto('http://127.0.0.1:3102/'+route);
  await page.locator('img').evaluateAll(es=>es.forEach(e=>e.loading='eager'));
  await page.setViewportSize({width,height:await page.evaluate(()=>document.documentElement.scrollHeight)});
  await page.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode())));
  await page.waitForTimeout(250);
  await page.screenshot({path:`artifacts/feedback-photo-fix/after-${route.split('/').pop()}-${width}.png`,fullPage:true});
  await page.setViewportSize({width,height:900});
 }
 await page.close();
}
await browser.close();
