import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
const directory='artifacts/service-photo-diagnosis', manifest=JSON.parse(await readFile('lib/photographs.json','utf8'));
const browser=await chromium.launch(), results=[];
for(const width of [1440,768,390,360]) {
 const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:width<768?3:2});
 const page=await context.newPage();
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'&&route.request().method()==='GET'?route.continue():route.abort());
 for(const kind of ['domestic','international']) {
  await page.goto(`http://127.0.0.1:3102/services/${kind}`); await page.mouse.move(0,0); await page.waitForTimeout(400);
  const images=page.locator('main [data-photo-frame] img');
  for(let index=0;index<await images.count();index++) {
   const image=images.nth(index); await image.scrollIntoViewIfNeeded(); await image.evaluate(e=>e.decode()); await page.waitForTimeout(300);
   const record=await image.evaluate(e=>{
    const rect=e.getBoundingClientRect(), parents=[];
    for(let p=e;p&&p.tagName!=='BODY';p=p.parentElement) { const s=getComputedStyle(p); parents.push({tag:p.tagName,class:p.className,transform:s.transform,filter:s.filter,opacity:s.opacity,backfaceVisibility:s.backfaceVisibility,transformStyle:s.transformStyle}); }
    return {src:e.getAttribute('src'),currentSrc:new URL(e.currentSrc).pathname,sizes:e.sizes,srcset:e.srcset,display:{width:rect.width,height:rect.height},naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,objectFit:getComputedStyle(e).objectFit,parallaxAncestor:!!e.closest('.parallax-media'),parents};
   });
   const source=await sharp(`public${record.currentSrc}`).metadata();
   const name=index===0?`selected-${kind}`:`selected-${kind}-${index}`;
   const original=manifest[name].original, master=await sharp(original).metadata();
   let compare;
   if(width===1440||width===390) {
    const before=await image.screenshot({path:`${directory}/${kind}-${index}-${width}-normal.png`});
    await image.evaluate(e=>{for(let p=e;p&&p.tagName!=='BODY';p=p.parentElement){ p.dataset.diagnosticTransform=p.style.getPropertyValue('transform');p.dataset.diagnosticPriority=p.style.getPropertyPriority('transform');p.style.setProperty('transform','none','important'); }});
    const after=await image.screenshot({path:`${directory}/${kind}-${index}-${width}-transforms-off.png`});
    const first=await sharp(before).raw().toBuffer({resolveWithObject:true}), second=await sharp(after).raw().toBuffer({resolveWithObject:true});
    compare={sameDimensions:first.info.width===second.info.width&&first.info.height===second.info.height,identicalPixels:first.data.equals(second.data)};
    await image.evaluate(e=>{for(let p=e;p&&p.tagName!=='BODY';p=p.parentElement){const value=p.dataset.diagnosticTransform;if(value)p.style.setProperty('transform',value,p.dataset.diagnosticPriority);else p.style.removeProperty('transform');delete p.dataset.diagnosticTransform;delete p.dataset.diagnosticPriority;}});
   }
   results.push({route:`/services/${kind}`,index,name,viewport:width,dpr:width<768?3:2,...record,selectedPixels:[source.width,source.height],original,originalPixels:[master.width,master.height],transformComparison:compare});
  }
 }
 await context.close();
}
await browser.close();await writeFile(`${directory}/measurements.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(({name,viewport,display,selectedPixels,parallaxAncestor,transformComparison})=>({name,viewport,display,selectedPixels,parallaxAncestor,transformComparison})),null,2));
