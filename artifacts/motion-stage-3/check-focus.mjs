import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:3102');await page.waitForSelector('.hero-stage[data-hero-progress]');
const link=page.locator('.cinematic-copy .hero-actions a');await link.focus();
const result=await link.evaluate(el=>({focused:document.activeElement===el,opacity:getComputedStyle(el.closest('.hero-follow')).opacity,transform:getComputedStyle(el.closest('.hero-follow')).transform,outline:getComputedStyle(el).outlineStyle,outlineWidth:getComputedStyle(el).outlineWidth}));
assert.equal(result.focused,true);assert.equal(result.opacity,'1');assert.equal(result.transform,'none');assert.equal(result.outline,'solid');assert.notEqual(result.outlineWidth,'0px');
await page.screenshot({path:'artifacts/motion-stage-3/keyboard-focus.png',scale:'css'});await page.keyboard.press('Enter');await page.waitForURL('**/get-a-quote');
await writeFile('artifacts/motion-stage-3/focus-result.json',JSON.stringify({...result,nativeQuoteNavigation:true},null,2));await browser.close();console.log('PASS: focused CTA immediately visible with its existing ring; Enter preserves native Quote navigation.');
