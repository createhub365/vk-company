import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage({viewport:{width:1100,height:750}});
await page.route('http://reference.local/media.mp4',async r=>r.fulfill({contentType:'video/mp4',body:await readFile('artifacts/media-depth-fix/reference.mp4')}));
await page.setContent('<video style="width:100%;height:720px" muted src="http://reference.local/media.mp4"></video>');
await page.waitForFunction(()=>document.querySelector('video').readyState>=1, null, {timeout:10000});
console.log(await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight})));
for(const time of [0,1,2,3,4,5,6,7,8]){await page.locator('video').evaluate((v,t)=>new Promise(resolve=>{v.onseeked=resolve;v.currentTime=t+.01;}),time);await page.waitForTimeout(150);await page.screenshot({path:`artifacts/media-depth-fix/reference-frame-${time}.png`});}
await browser.close();
