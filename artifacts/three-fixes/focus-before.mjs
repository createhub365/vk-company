import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:1000}}),results=[];
const state=()=>page.evaluate(()=>({active:{tag:document.activeElement?.tagName,text:document.activeElement?.textContent?.slice(0,80),focusVisible:document.activeElement?.matches(':focus-visible'),outline:document.activeElement?getComputedStyle(document.activeElement).outline:''},links:[...document.querySelectorAll('header nav a')].map(e=>({text:e.textContent,focus:e.matches(':focus'),focusVisible:e.matches(':focus-visible'),outline:getComputedStyle(e).outline}))}));
await page.goto('http://127.0.0.1:3102/');await page.waitForTimeout(500);
for(const label of ['Domestic','International','Contact']) {await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:label,exact:true}).click();await page.waitForTimeout(400);results.push({method:'mouse',label,...await state()});}
await page.goto('http://127.0.0.1:3102/');await page.waitForTimeout(400);
for(let i=0;i<7;i++){await page.keyboard.press('Tab');results.push({method:'keyboard',...await state()});}
await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Domestic',exact:true}).click();await page.waitForTimeout(400);results.push({method:'mouse-after-keyboard',...await state()});
await writeFile('artifacts/three-fixes/focus-before.json',JSON.stringify(results,null,2));await browser.close();
