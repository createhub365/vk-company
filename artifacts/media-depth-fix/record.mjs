import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();
const results=[];
for(const [name,width,height,touch] of [['desktop',1440,900,false],['mobile',390,844,true]]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:touch?3:2,hasTouch:touch,isMobile:touch,recordVideo:{dir:'artifacts/media-depth-fix/recordings',size:{width,height}}});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 const page=await context.newPage();await page.goto('http://127.0.0.1:3102/get-a-quote');
 await page.locator('.quote-media[data-bubbles="webgl"]').waitFor();await page.waitForTimeout(700);
 const frame=page.locator('.quote-photo'),b=await frame.boundingBox();
 if(!touch){
  for(const [x,y] of [[.1,.1],[.9,.1],[.9,.9],[.1,.9],[.5,.5]]){await page.mouse.move(b.x+b.width*x,b.y+b.height*y,{steps:18});await page.waitForTimeout(330);}
  await page.mouse.move(b.x+b.width*.93,b.y+b.height*.16,{steps:12});await page.waitForTimeout(600);
  await page.screenshot({path:'artifacts/media-depth-fix/pointer-tilt.png',scale:'css'});
  results.push({name,tilt:await frame.evaluate(e=>({transform:getComputedStyle(e).transform,highlight:getComputedStyle(e,'::after').opacity}))});
 }
 for(let i=0;i<3;i++){
  const x=b.x+b.width*(.3+i*.2),y=b.y+b.height*.6;
  if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
  if(i===0){await page.waitForTimeout(140);await page.screenshot({path:`artifacts/media-depth-fix/${name}-tap-active.png`,scale:'css'});}
  await page.waitForTimeout(850);
 }
 await page.mouse.move(4,200);await page.waitForTimeout(750);
 await page.evaluate(()=>scrollTo({top:600,behavior:'smooth'}));await page.waitForTimeout(900);
 await page.evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await page.waitForTimeout(900);
 if(!touch){await page.goto('http://127.0.0.1:3102/services/international');const aircraft=page.locator('.page-hero-image');const a=await aircraft.boundingBox();await page.mouse.move(a.x+a.width*.9,a.y+a.height*.2,{steps:20});await page.waitForTimeout(650);await page.mouse.click(a.x+a.width*.6,a.y+a.height*.55);await page.waitForTimeout(180);await page.screenshot({path:'artifacts/media-depth-fix/aircraft-tap-active.png',scale:'css'});await page.waitForTimeout(950);}
 const video=page.video();await context.close();await video.saveAs(`artifacts/media-depth-fix/${name}-interactions.webm`);
}
await writeFile('artifacts/media-depth-fix/interaction-observations.json',JSON.stringify(results,null,2));await browser.close();
