import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch();
const report=[];
for (const base of ['https://vkandcompany.com','http://127.0.0.1:3102']) {
 const page=await browser.newPage({viewport:{width:1440,height:900}}); const errors=[]; const failed=[];
 page.on('pageerror',e=>errors.push(String(e))); page.on('console',m=>{if(m.type()==='error')errors.push(m.text())}); page.on('requestfailed',r=>failed.push(r.url()));
 await page.route('**/*',r=>r.request().method()==='GET'?r.continue():r.abort());
 const response=await page.goto(base); await page.waitForTimeout(1300);
 const label=base.startsWith('https')?'live':'before';
 await page.screenshot({path:`artifacts/feedback-photo-fix/${label}-home.png`});
 const scripts=await page.locator('script[src]').evaluateAll(es=>es.map(e=>e.src));
 const tests=[];
 for(const selector of ['h1','.cinematic-hero','.editorial-image']){
  const target=page.locator(selector).first(); await target.scrollIntoViewIfNeeded();
  await target.click({position:selector==='.cinematic-hero'?{x:1300,y:300}:{x:25,y:25}});
  tests.push({selector,animations:await page.evaluate(()=>document.getAnimations().map(a=>({duration:a.effect.getTiming().duration,keyframes:a.effect.getKeyframes()}))),layers:await page.locator('.image-feedback-layer').count()});
  await page.screenshot({path:`artifacts/feedback-photo-fix/${label}-${selector.replaceAll(/[^a-z]/g,'')}-interaction.png`});
  await page.waitForTimeout(500);
 }
 report.push({base,headers:await response.allHeaders(),scripts,errors,failed,tests});
 if(label==='before')for(const route of ['/','/services/domestic','/services/international','/about','/contact','/get-a-quote','/faq','/privacy','/terms','/track']){
  await page.goto(base+route); await page.locator('footer').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
  report.push({route,images:await page.locator('img').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {src:e.getAttribute('src'),currentSrc:e.currentSrc,natural:[e.naturalWidth,e.naturalHeight],display:[r.width,r.height],filter:s.filter,opacity:s.opacity,transform:s.transform,objectFit:s.objectFit};}))});
  if(['/about','/services/domestic','/contact'].includes(route))await page.screenshot({path:`artifacts/feedback-photo-fix/before-${route.split('/').pop()}.png`,fullPage:true});
 }
 await page.close();
}
await writeFile('artifacts/feedback-photo-fix/baseline.json',JSON.stringify(report,null,2));await browser.close();
