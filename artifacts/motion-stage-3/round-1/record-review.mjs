import {createRequire} from 'node:module'; const require=createRequire('/Users/pranshudhiman/Desktop/vk and company/package.json'); const {chromium}=require('@playwright/test');
const browser=await chromium.launch();
for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:width===390?3:2,hasTouch:width===390,isMobile:width===390,recordVideo:{dir:'/Users/pranshudhiman/Desktop/vk and company/artifacts/motion-stage-3/round-1/recordings',size:{width,height:900}}});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 const page=await context.newPage();await page.goto('http://127.0.0.1:3102');await page.locator('.cinematic-hero-background').evaluate(i=>i.decode());await page.waitForTimeout(1700);
 if(width===1440){
  for(const [x,y] of [[1120,270],[300,520],[900,670],[680,420]]){await page.mouse.move(x,y,{steps:10});await page.waitForTimeout(450);}
  await page.mouse.move(4,4);await page.waitForTimeout(500);
  for(let i=0;i<6;i++){await page.mouse.wheel(0,110);await page.waitForTimeout(180);}await page.waitForTimeout(500);
  for(let i=0;i<6;i++){await page.mouse.wheel(0,-110);await page.waitForTimeout(180);}
 }else{
  const cdp=await context.newCDPSession(page);
  async function swipe(start,end){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:240,y:start}]});for(let step=1;step<=14;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:240,y:start+(end-start)*step/14}]});await page.waitForTimeout(25);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  await swipe(760,300);await page.waitForTimeout(700);await swipe(260,760);await page.waitForTimeout(600);await cdp.detach();
 }
 await page.waitForTimeout(1300);const video=page.video();await context.close();await video.saveAs(`/Users/pranshudhiman/Desktop/vk and company/artifacts/motion-stage-3/round-1/hero-review-${width}.webm`);
}
await browser.close();console.log('Saved 1440px mouse/wheel and 390px native-touch review recordings.');
