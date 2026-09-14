import { chromium } from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage();const errors=[],failed=[],scripts=[];
page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),method:r.method()}));
page.on('response',async r=>{if(r.url().includes('/_next/')&&r.url().includes('.js')){const s=await r.text().catch(()=>'');if(s.includes('image-feedback-layer'))scripts.push({url:r.url(),status:r.status(),hasSurfaceRestriction:s.includes('[data-image-feedback]'),hasForegroundExclusion:s.includes('data-image-feedback-foreground'),has450ms:s.includes('450')});}});
await page.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
const response=await page.goto('https://vkandcompany.com');await page.waitForTimeout(2000);
await writeFile('artifacts/feedback-photo-fix/live-check.json',JSON.stringify({headers:await response.allHeaders(),errors,failed,scripts,motion:await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)},null,2));await browser.close();
