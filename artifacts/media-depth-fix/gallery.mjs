import {chromium} from '@playwright/test';import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const checks=[];await mkdir('artifacts/media-depth-fix/gallery',{recursive:true});
for(const width of [1440,768,390,360]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:width<500?3:2});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 for(const route of ['/','/services/domestic','/services/international','/about','/contact','/get-a-quote']){
  await page.goto('http://127.0.0.1:3102'+route);let i=0;
  for(const frame of await page.locator('[data-photo-frame]').all()){
   await frame.scrollIntoViewIfNeeded();await frame.locator('img').evaluate(e=>e.decode());
   await frame.screenshot({path:`artifacts/media-depth-fix/gallery/${route.replaceAll('/','-')||'home'}-${width}-${i++}.png`,scale:'css'});
  }
  checks.push({route,width,photos:i});
 }
 await page.close();
}
await writeFile('artifacts/media-depth-fix/gallery.json',JSON.stringify(checks,null,2));await browser.close();
