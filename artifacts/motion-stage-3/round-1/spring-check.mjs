import {createRequire} from 'node:module';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const require=createRequire('/Users/pranshudhiman/Desktop/vk and company/package.json');const {chromium}=require('@playwright/test');const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
await page.goto('http://127.0.0.1:3102');await page.waitForTimeout(1800);
const box=await page.locator('.cinematic-hero').boundingBox();
async function sampleMove(x,y){
 const sampling=page.evaluate(()=>new Promise(resolve=>{const values=[];const e=document.querySelector('[data-hero-plane="front"]');let start;function sample(t){start??=t;const m=new DOMMatrixReadOnly(getComputedStyle(e).transform);values.push({t:t-start,x:m.m41,y:m.m42});if(t-start<1500)requestAnimationFrame(sample);else resolve(values);}requestAnimationFrame(sample);}));
 await page.mouse.move(x,y);return sampling;
}
const outward=await sampleMove(box.x+box.width*.85,box.y+box.height*.5);
const returning=await sampleMove(800,40);
assert(outward.some(s=>s.x>4));assert(outward.every(s=>s.x>=-.001&&s.x<=4.201));assert(returning.every(s=>s.x>=-.001&&s.x<=4.201));
assert(Math.abs(returning.at(-1).x)<.01);
await writeFile('/Users/pranshudhiman/Desktop/vk and company/artifacts/motion-stage-3/round-1/spring-results.json',JSON.stringify({target:4.2,outward,returning},null,2));await browser.close();console.log('PASS: no observed overshoot on outward step or return to rest, target 4.2px.');
