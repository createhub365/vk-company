import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch(); const results = [];
try {
const context = await browser.newContext({ viewport: { width: 768, height: 900 }, deviceScaleFactor: 2 });
await context.route('**/*', r => r.request().method() === 'POST' ? r.fulfill({status:200,contentType:'application/json',body:'{"success":"false"}'}) : new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
const page = await context.newPage(); await page.goto('http://127.0.0.1:3110/get-a-quote');
await page.waitForSelector('.form-depth[data-utility-ready]');
for (const [name,value] of Object.entries({name:'TEST ONLY Customer',phone:'+91 9876543210',email:'customer@example.com',originCountry:'India',originCity:'Mohali',originPostalCode:'140301',destinationCountry:'Canada',destinationCity:'Toronto',destinationPostalCode:'M5V 2T6',contentsDescription:'Printed documents & samples',packageCount:'2',approximateWeight:'1.5',dimensions:'30 × 20 × 10',preferredDispatchDate:'2026-10-01',instructions:'TEST ONLY'})) await page.locator(`[name="${name}"]`).fill(value);
const button = page.getByRole('button',{name:'Send quote request',exact:true});
async function capture(label) {
 await button.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
 const state=await button.evaluate(e=>{const b=e.getBoundingClientRect();const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);const root=getComputedStyle(document.documentElement);return {hit:hit?.outerHTML.slice(0,220),hitTag:hit?.tagName,hitClass:hit?.className,buttonIsOnTop:!!hit&&(hit===e||e.contains(hit)),box:b.toJSON(),formTransform:getComputedStyle(e.closest('form')).transform,tokens:Object.fromEntries(['--z-back','--z-front','--z-pop','--depth-rise','--depth-parallax-from','--depth-parallax-to'].map(t=>[t,root.getPropertyValue(t).trim()]))};});
 results.push({label,...state}); console.log(label,JSON.stringify(state)); await writeFile('artifacts/submit-tilt-staging/quote-diagnosis.json',JSON.stringify(results,null,2));return state;
}
await page.locator('[name="email"]').fill('invalid'); await capture('before-first-validation'); await button.click({timeout:5000});
await page.locator('[name="email"]').fill('customer@example.com'); await page.locator('[name="packageCount"]').fill('0');
await capture('after-email-error');
try {await button.click({timeout:2500});} catch(error) {results.push({failedClick:'after-email-error',error:error.message});}
await capture('after-validation-errors');
await page.screenshot({path:'artifacts/submit-tilt-staging/quote-768-before.png',scale:'css'});
for (const [label,selector,property,value] of [['flatten-form','.form-panel','transform','none'],['isolate-form','.form-depth','isolation','isolate'],['flatten-section','.quote-layout','transform-style','flat']]) {
 const target=page.locator(selector);if(!await target.count())continue;
 await target.evaluate((e,{property,value})=>e.style.setProperty(property,value,'important'),{property,value});await capture(label);await target.evaluate((e,property)=>e.style.removeProperty(property),property);
}
await context.close();
} finally {await browser.close();await writeFile('artifacts/submit-tilt-staging/quote-diagnosis.json',JSON.stringify(results,null,2));}
