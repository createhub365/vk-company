import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import sharp from 'sharp';
const phase=process.argv[2]||'before';const browser=await chromium.launch();const records=[];
for(const width of [1440,768,390,360]){
 const page=await browser.newPage({viewport:{width,height:width===768?1024:900},deviceScaleFactor:width<500?3:2,isMobile:width<500,hasTouch:width<500});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
 for(const route of ['/','/get-a-quote','/services/international','/services/domestic','/about','/contact','/faq','/privacy','/terms','/track']){
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:3102'+route);
  await page.locator('h1').waitFor();await page.waitForTimeout(150);
  const content=await page.locator('main').evaluate(e=>({text:e.innerText.replace(/VKC/g,'').replace(/\s+/g,' ').trim(),links:Array.from(e.querySelectorAll('a')).map(a=>[a.textContent,a.getAttribute('href')]),fields:Array.from(e.querySelectorAll('input,select,textarea')).map(e=>[e.tagName,e.getAttribute('name'),e.getAttribute('type')])}));
  const layout=await page.evaluate(()=>Object.fromEntries(['.page-hero-copy','h1','.page-hero .lede','.form-shell','.page-hero-marker','.quote-media'].map(s=>[s,document.querySelector(s)?.getBoundingClientRect().toJSON()])));
  for(const i of await page.locator('img').all()){await i.scrollIntoViewIfNeeded();await i.evaluate(e=>e.decode());}
  const photos=await page.locator('img').evaluateAll(es=>es.filter(e=>!e.closest('.brand-logo')).map(e=>{const f=e.closest('[data-image-feedback]'),s=getComputedStyle(e),cs=getComputedStyle(f);return {src:e.getAttribute('src'),selected:new URL(e.currentSrc).pathname,img:e.getBoundingClientRect().toJSON(),frame:f.getBoundingClientRect().toJSON(),fit:s.objectFit,padding:cs.padding,aspect:cs.aspectRatio,filter:s.filter};}));
  for(const p of photos){const m=await sharp('public'+p.selected).metadata();p.pixels=[m.width,m.height];}
  records.push({route,width,content,layout,photos,errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  if(['/get-a-quote','/services/international'].includes(route)){
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(250);
   await page.screenshot({path:`artifacts/media-depth-fix/${phase}-${route.split('/').pop()}-${width}.png`,scale:'css'});
  }
 }
 await page.close();
}
await writeFile(`artifacts/media-depth-fix/${phase}-audit.json`,JSON.stringify(records,null,2));await browser.close();console.log(`${phase}: ${records.length} route/width combinations`);
