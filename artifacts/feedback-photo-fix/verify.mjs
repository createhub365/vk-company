import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch();
const routes=['/','/services/domestic','/services/international','/about','/contact','/get-a-quote','/faq','/privacy','/terms','/track'];
const report=[];
for(const width of [1440,768,390,360]){
 const context=await browser.newContext({viewport:{width,height:width===768?1024:900},deviceScaleFactor:width<500?3:2,isMobile:width<500,hasTouch:width<500});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of routes){
  await page.goto('http://127.0.0.1:3102'+route);await page.locator('h1').waitFor();
  for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());await page.waitForTimeout(80);}
  const images=await page.locator('img').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();return {src:e.getAttribute('src'),selectedSource:new URL(e.currentSrc).pathname,natural:[e.naturalWidth,e.naturalHeight],display:[b.width,b.height],objectFit:s.objectFit,objectPosition:s.objectPosition,filter:s.filter,opacity:s.opacity,scale:s.scale,transform:s.transform,placeholder:e.getAttribute('data-placeholder'),dpr:devicePixelRatio};}));
  for(const img of images){const meta=await sharp('public'+img.selectedSource).metadata();img.selectedPixels=[meta.width,meta.height];}
  report.push({width,route,images,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors:[...errors]});
  // Eager paint only for stitched screenshot capture; source-selection audit above used production lazy loading.
  await page.locator('img').evaluateAll(es=>es.forEach(e=>e.loading='eager'));
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);
  if(['/', '/about','/services/domestic','/services/international','/contact'].includes(route)){
   await page.screenshot({path:`artifacts/feedback-photo-fix/after-${route==='/'?'home':route.split('/').pop()}-${width}.png`,fullPage:true,scale:'css'});
   if(route==='/')await page.screenshot({path:`artifacts/feedback-photo-fix/after-hero-${width}-density.png`});
  }
 }
 await context.close();
}
await writeFile('artifacts/feedback-photo-fix/photo-audit-after.json',JSON.stringify(report,null,2));
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'artifacts/feedback-photo-fix',size:{width:1440,height:900}}});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
const page=await context.newPage();await page.goto('http://127.0.0.1:3102');await page.waitForTimeout(700);
for(const selector of ['h1','#domestic-services .editorial-image','.international-aircraft']){
 const target=page.locator(selector);await target.scrollIntoViewIfNeeded();await page.waitForTimeout(300);
 await target.click({position:{x:75,y:65}});
 await page.locator('.image-feedback-layer').evaluate(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=180}));
 await page.screenshot({path:`artifacts/feedback-photo-fix/after-active-${selector.replaceAll(/[^a-z]/g,'')}.png`});
 await page.waitForTimeout(700);await target.click({position:{x:180,y:110}});await page.waitForTimeout(700);
}
await page.goto('http://127.0.0.1:3102/contact');await page.getByLabel('Name',{exact:true}).fill('Local preview only');await page.waitForTimeout(600);
const video=page.video();await context.close();await video.saveAs('artifacts/feedback-photo-fix/interaction.webm');
await browser.close();console.log(`Audited ${report.length} route/viewport combinations; ${report.reduce((n,r)=>n+r.images.length,0)} image placements. Overflow: ${report.filter(r=>r.overflow).length}; page errors: ${report.flatMap(r=>r.errors).length}`);
