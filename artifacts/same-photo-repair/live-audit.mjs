import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const records=[];
for(const route of ['/','/services/domestic','/services/international']){
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});const failures=[];
 page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()}));
 await page.route('**/*',r=>r.request().method()==='GET'?r.continue():r.abort());
 await page.goto('https://vkandcompany.com'+route);await page.locator('h1').waitFor();
 for(const i of await page.locator('main img').all()){await i.scrollIntoViewIfNeeded();await i.evaluate(e=>e.decode().catch(()=>{}));}
 const images=await page.locator('main img').evaluateAll(es=>es.map(e=>({src:e.getAttribute('src'),currentSrc:e.currentSrc,alt:e.alt,natural:[e.naturalWidth,e.naturalHeight],box:e.getBoundingClientRect().toJSON(),fit:getComputedStyle(e).objectFit,filter:getComputedStyle(e).filter,transform:getComputedStyle(e).transform})));
 const steps=await page.locator('.process-list li').evaluateAll(es=>es.map(e=>({html:e.innerHTML,images:e.querySelectorAll('img').length})));
 records.push({route,images,steps,failures});
 if(route==='/')await page.locator('.process-flow').screenshot({path:'artifacts/same-photo-repair/live-process-1440.png',style:'header{visibility:hidden}',scale:'css'});
 else {await page.screenshot({path:`artifacts/same-photo-repair/live-${route.split('/').pop()}-full.png`,fullPage:true,scale:'css'});}
 await writeFile(`artifacts/same-photo-repair/live-${route.split('/').pop()||'home'}.html`,await page.content());await page.close();
}
await writeFile('artifacts/same-photo-repair/live-audit.json',JSON.stringify(records,null,2));await browser.close();console.log(records.map(r=>({route:r.route,images:r.images.map(i=>i.src),stepCounts:r.steps.map(s=>s.images),failures:r.failures})));
