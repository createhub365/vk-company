import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const results=[];
for(const config of [{name:'wide-touch',width:1024,touch:true},{name:'narrow-mouse',width:390,touch:false}]){
 const context=await browser.newContext({viewport:{width:config.width,height:900},hasTouch:config.touch});const page=await context.newPage();
 await page.goto('http://127.0.0.1:3102/services/domestic');await page.locator('.page-hero-image img').evaluate(i=>i.decode());await page.waitForTimeout(200);
 const frame=page.locator('.page-hero-image'),box=await frame.boundingBox();await page.mouse.move(box.x+10,box.y+20);await page.waitForTimeout(200);
 const result=await frame.evaluate(el=>({transform:getComputedStyle(el).transform,hover:el.hasAttribute('data-photo-hover'),hoverNone:matchMedia('(hover:none)').matches}));assert.equal(result.transform,'none');assert.equal(result.hover,false);results.push({...config,...result});await context.close();
}
const page=await browser.newPage({viewport:{width:1440,height:900}});
const response=await page.goto('http://127.0.0.1:3102/motion-foundation-demo');assert.equal(response.status(),404);assert.equal(response.headers()['x-content-type-options'],'nosniff');
await page.goto('http://127.0.0.1:3102/services/domestic');await page.locator('.page-hero-image img').evaluate(i=>i.decode());await page.waitForTimeout(200);
const box=await page.locator('.page-hero-image').boundingBox();await page.mouse.move(box.x+10,box.y+10);await page.waitForTimeout(200);assert.equal(await page.locator('.page-hero-image').getAttribute('data-photo-hover'),'');
await page.locator('nav').getByRole('link',{name:'Get a quote'}).click();await page.waitForURL('**/get-a-quote');await page.locator('.quote-photo img').evaluate(i=>i.decode());await page.waitForTimeout(200);
const qb=await page.locator('.quote-photo').boundingBox();await page.mouse.move(qb.x+10,qb.y+10);await page.waitForTimeout(200);assert.equal(await page.locator('.quote-photo').getAttribute('data-photo-hover'),null);
await writeFile('artifacts/motion-stage-2/final-browser-check.json',JSON.stringify({pointerPolicies:results,throwawayRouteStatus:404,headersApplied:true,clientNavigationQuoteExclusion:true},null,2));await browser.close();console.log('PASS: large touch + small mouse pointer gates; demo is real 404; deployed headers applied; Quote exclusion survives client navigation.');
