import {chromium,expect} from '@playwright/test';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),results=[];
for(const reducedMotion of ['no-preference','reduce']){
 const context=await browser.newContext({viewport:{width:390,height:900},hasTouch:true,reducedMotion}),page=await context.newPage();
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:3102/get-a-quote');await page.waitForTimeout(1000);
 assert.equal(await page.locator('html').getAttribute('data-depth-scroll'),null);
 for(let i=0;i<3;i++){
  await page.getByRole('button',{name:'Open menu'}).click();await page.waitForTimeout(450);const y=await page.evaluate(()=>scrollY);
  assert(await page.locator('html').evaluate(e=>e.classList.contains('lenis-stopped')));
  await page.mouse.move(3,600);await page.mouse.wheel(0,300);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>scrollY),y);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Open menu'})).toBeFocused();
  assert.equal(await page.locator('html').getAttribute('data-depth-scroll'),null);assert(!await page.locator('html').evaluate(e=>e.classList.contains('lenis')));
 }
 const cdp=await context.newCDPSession(page);await cdp.send('Input.synthesizeScrollGesture',{x:20,y:650,yDistance:-350,speed:600,gestureSourceType:'touch'});await page.waitForTimeout(500);assert(await page.evaluate(()=>scrollY>100));
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Domestic',exact:true}).click();
 await expect(page).toHaveURL(/services\/domestic/);if(reducedMotion==='no-preference')await expect(page.locator('html')).toHaveAttribute('data-depth-scroll','smooth');
 await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Get a quote',exact:true}).click();await expect(page).toHaveURL(/get-a-quote/);await expect(page.locator('html')).not.toHaveAttribute('data-depth-scroll','smooth');
 await page.goBack();await expect(page).toHaveURL(/services\/domestic/);if(reducedMotion==='no-preference')await expect(page.locator('html')).toHaveAttribute('data-depth-scroll','smooth');
 results.push({reducedMotion,menuLockCycles:3,touchScroll:true,nativeQuote:true,smoothResumesElsewhere:reducedMotion==='no-preference',historyRestoration:true});await context.close();
}
for(const mode of ['no-js','no-webgl']){
 const context=await browser.newContext({javaScriptEnabled:mode!=='no-js'}),page=await context.newPage();
 if(mode==='no-webgl')await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
 await page.goto('http://127.0.0.1:3102/get-a-quote');await expect(page.locator('.quote-photo img')).toBeVisible();await expect(page.getByLabel('Name',{exact:true})).toBeVisible();results.push({mode,photoAndFormVisible:true});await context.close();
}
await browser.close();await writeFile('artifacts/three-fixes/quote-runtime-results.json',JSON.stringify(results,null,2));console.log('PASS: native Quote scroll, temporary Lenis menu lock, touch scroll, route/history lifecycle, reduced motion and static fallbacks.');
