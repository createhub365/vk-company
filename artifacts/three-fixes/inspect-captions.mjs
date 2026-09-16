import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(), page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
const findings=[];
for(const route of ['/', '/services/domestic','/services/international','/about']) {
 await page.goto(`http://127.0.0.1:3102${route}`);await page.waitForTimeout(400);
 const captions=await page.locator('.page-hero-image > span,.editorial-image > span').allTextContents();
 findings.push({route,captions});
 if(route!=='/') {
  const frame=page.locator('.page-hero-image');await frame.locator('img').evaluate(e=>e.decode());
  await frame.screenshot({path:`artifacts/three-fixes/${route.split('/').at(-1)}-caption-before.png`});
  await page.addStyleTag({content:'.page-hero-image > span {display:none !important}'});
  await frame.screenshot({path:`artifacts/three-fixes/${route.split('/').at(-1)}-caption-dom-hidden-control.png`});
 }
}
await writeFile('artifacts/three-fixes/caption-diagnosis.json',JSON.stringify(findings,null,2));await browser.close();console.log(findings);
