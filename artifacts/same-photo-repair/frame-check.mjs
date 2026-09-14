import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch();const results=[];
for(const width of [1440,768,390,360]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:width<500?3:2});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:3102');
 await page.locator('.process-list').scrollIntoViewIfNeeded();
 await page.locator('.process-list img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 await page.mouse.move(0,0);await page.waitForTimeout(700);
 const frames=await page.locator('.process-photo').evaluateAll(els=>els.map(el=>{
  const r=el.getBoundingClientRect(),s=getComputedStyle(el),img=el.querySelector('img'),next=el.nextElementSibling.getBoundingClientRect();
  return {width:r.width,height:r.height,top:r.top,radius:s.borderRadius,gapBelow:next.top-r.bottom,fit:getComputedStyle(img).objectFit,transform:s.transform};
 }));
 assert.equal(frames.length,4);assert(frames.every(f=>Math.abs(f.width/f.height-1.5)<.001));
 assert.equal(new Set(frames.map(f=>f.radius)).size,1);assert.equal(new Set(frames.map(f=>f.gapBelow.toFixed(2))).size,1);
 if(width===1440)assert.equal(new Set(frames.map(f=>f.top)).size,1);
 if(width===768){assert.equal(frames[0].top,frames[1].top);assert.equal(frames[2].top,frames[3].top);}
 if(width===1440||width===390)await page.locator('.process-list').screenshot({path:`artifacts/same-photo-repair/after-process-retina-${width}.png`,style:'header{visibility:hidden}'});
 results.push({width,deviceScaleFactor:width<500?3:2,frames});await page.close();
}
await writeFile('artifacts/same-photo-repair/frame-check.json',JSON.stringify(results,null,2));await browser.close();console.log('All process frames: 3:2, equal radius/spacing, aligned desktop/tablet rows. Retina screenshots saved.');
