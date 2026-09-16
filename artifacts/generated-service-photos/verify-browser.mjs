import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const directory='artifacts/generated-service-photos';
const browser=await chromium.launch(), results=[];
for(const [width,dpr] of [[1440,1],[1440,2],[768,2],[390,2],[360,2]]) {
 const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:dpr,hasTouch:width<768});const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'&&route.request().method()==='GET'?route.continue():route.abort());
 for(const kind of ['domestic','international']) {
  const response=await page.goto(`http://127.0.0.1:3102/services/${kind}`);assert.equal(response.headers()['x-content-type-options'],'nosniff');
  for(let index=1;index<=3;index++) {
   const filename=`selected-${kind}-${index}-392.webp`;
   const image=page.locator(`main img[src="/media/photos/${filename}"]`);
   await image.scrollIntoViewIfNeeded();await image.evaluate(e=>e.decode());await page.mouse.move(0,0);await page.waitForTimeout(250);
   const state=await image.evaluate(e=>{const rect=e.getBoundingClientRect(), frame=e.closest('[data-photo-frame]');return {url:new URL(e.currentSrc).pathname,src:e.getAttribute('src'),srcset:e.getAttribute('srcset'),sizes:e.sizes,alt:e.alt,display:{width:rect.width,height:rect.height},frame:{width:frame.clientWidth,height:frame.clientHeight},complete:e.complete,filter:getComputedStyle(e).filter,transform:getComputedStyle(e).transform};});
   const actual=await sharp(`public/media/photos/${filename}`).metadata();
   assert.equal(state.url,`/media/photos/${filename}`);assert(state.complete);
   assert(actual.width>=Math.ceil(state.display.width*dpr));assert(actual.height>=Math.ceil(state.display.height*dpr));
   assert.equal(actual.width*(index===1?248:254),actual.height*392);
   assert(Math.abs(state.display.width-state.frame.width)<1);assert(Math.abs(state.display.height-state.frame.height)<1);
   if(width===1440){
    await image.screenshot({path:`${directory}/${kind}-${index}-${dpr}x-after.png`});
    // Temporarily fulfill only this one URL with its saved previous bytes. The
    // website DOM/styles and requested URL stay identical for the comparison.
    const previous=await readFile(`${directory}/before/${filename}`);
    await page.route(`**/media/photos/${filename}`,route=>route.fulfill({body:previous,contentType:'image/webp'}));
    await page.reload();const old=page.locator(`main img[src="/media/photos/${filename}"]`);await old.scrollIntoViewIfNeeded();await old.evaluate(e=>e.decode());await page.waitForTimeout(100);
    const oldBox=await old.boundingBox();assert(Math.abs(oldBox.width-state.display.width)<.1);assert(Math.abs(oldBox.height-state.display.height)<.1);
    await old.screenshot({path:`${directory}/${kind}-${index}-${dpr}x-before.png`});
    await page.unroute(`**/media/photos/${filename}`);await page.reload();
   }
   if(dpr===2 && [1440,390].includes(width)) {
    await image.scrollIntoViewIfNeeded();await image.evaluate(e=>e.decode());
    const frame=image.locator('..'), heading=page.locator('h1'), beforeHeading=await heading.boundingBox();
    for(let tap=0;tap<2;tap++) {
     if(width<768) await frame.tap({position:{x:40,y:40}});else await frame.click({position:{x:40,y:40}});
     await expect(page.locator('.image-feedback-layer')).toHaveCount(1);
     assert.deepEqual(await heading.boundingBox(),beforeHeading);
     await expect(page.locator('.image-feedback-layer')).toHaveCount(0);
    }
    await page.mouse.move(0,0);
   }
   results.push({kind,index,viewport:width,dpr,...state,filePixels:[actual.width,actual.height],pixelDensity:actual.width/state.display.width});
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);await context.close();
}
await browser.close();await writeFile(`${directory}/browser-results.json`,JSON.stringify(results,null,2));console.log(`PASS: ${results.length} image/density checks, same URLs/frames, exact ratios, no overflow or page errors.`);
