import {chromium,expect} from '@playwright/test';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),results=[];
for(const width of [1440,390])for(const reducedMotion of ['no-preference','reduce']){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion}),page=await context.newPage();
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:3102/');await page.waitForTimeout(400);
 if(width===390){await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Enter');await expect(page.locator('header nav')).toHaveClass(/open/);}
 const visited=new Set();
 for(let index=0;index<9;index++){
  if(width===1440||index>0)await page.keyboard.press('Tab');
  const active=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return{inHeader:!!e.closest('header'),text:e.textContent?.trim(),label:e.getAttribute('aria-label'),visible:e.matches(':focus-visible'),style:s.outlineStyle,width:parseFloat(s.outlineWidth)};});
  if(active.inHeader){assert(active.visible);assert.notEqual(active.style,'none');assert(active.width>=2);visited.add(active.text||active.label);results.push({width,reducedMotion,method:'keyboard',...active});if(active.text==='Domestic'){await page.waitForTimeout(420);await page.screenshot({path:`artifacts/three-fixes/nav-keyboard-${width}-${reducedMotion}.png`});}}
 }
 for(const label of ['Domestic','International','About','Contact','Get a quote'])assert(visited.has(label),`Keyboard missed ${label}`);
 if(width===390){await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Open menu'})).toBeFocused();}
 for(const label of ['Domestic','International','About','Contact','Get a quote']){
  if(width===390)await page.getByRole('button',{name:'Open menu'}).click();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:label,exact:true}).click();await page.waitForTimeout(300);
  const state=await page.evaluate(()=>[...document.querySelectorAll('header a,header button')].filter(e=>e.matches(':focus')).map(e=>({label:e.textContent||e.getAttribute('aria-label'),visible:e.matches(':focus-visible'),style:getComputedStyle(e).outlineStyle})));
  for(const e of state)assert.equal(e.style,'none',JSON.stringify({width,reducedMotion,label,state}));results.push({width,reducedMotion,method:'mouse',label,state});
 }
 await page.screenshot({path:`artifacts/three-fixes/nav-mouse-${width}-${reducedMotion}.png`});
 await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle==='solid'));
 await context.close();
}
await browser.close();await writeFile('artifacts/three-fixes/focus-after.json',JSON.stringify(results,null,2));console.log(`PASS ${results.length} keyboard/mouse focus observations; all five nav items, desktop/mobile, normal/reduced motion.`);
