import { chromium } from '@playwright/test';import {writeFile} from 'node:fs/promises';import sharp from 'sharp';
const phase=process.argv[2]||'before';const browser=await chromium.launch();const results=[];
for(const width of [1440,768,390,360]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:width<500?3:2});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 for(const route of ['/','/services/domestic','/services/international']){
  await page.goto('http://127.0.0.1:3102'+route);const selector=route==='/'?'.process-list .process-photo':'.page-hero-image, .service-photo';
  const entries=[];
  for(const frame of await page.locator(selector).all()){
   await frame.scrollIntoViewIfNeeded();await frame.locator('img').evaluate(e=>e.decode());
   const item=await frame.evaluate(e=>{const img=e.querySelector('img'),s=getComputedStyle(img);return {frame:[e.clientWidth,e.clientHeight],image:[img.clientWidth,img.clientHeight],src:new URL(img.currentSrc).pathname,filter:s.filter,loaded:img.complete&&img.naturalWidth>0};});
   item.source=await sharp('public'+item.src).metadata().then(m=>[m.width,m.height]);entries.push(item);
  }
  await page.mouse.move(0,0);await page.waitForTimeout(700);
  if(route==='/')await page.locator('.process-flow').screenshot({path:`artifacts/photo-clarity/${phase}-four-steps-${width}.png`,style:'header{visibility:hidden}',scale:'css'});
  else {await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`artifacts/photo-clarity/${phase}-${route.split('/').pop()}-${width}.png`,scale:'css'});}
  results.push({width,route,entries,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),text:await page.locator('main').innerText()});
 }
 await page.close();
}
await writeFile(`artifacts/photo-clarity/${phase}.json`,JSON.stringify(results,null,2));await browser.close();console.log(`${phase}: ${results.length} layouts captured`);
