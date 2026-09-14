import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
await page.goto('http://127.0.0.1:3102/get-a-quote');await page.locator('.quote-media[data-bubbles="webgl"]').waitFor();
const cdp=await page.context().newCDPSession(page);const before=await page.evaluate(()=>visualViewport.scale);
await cdp.send('Input.synthesizePinchGesture',{x:195,y:465,scaleFactor:1.5,relativeSpeed:200,gestureSourceType:'touch'});
const after=await page.evaluate(()=>visualViewport.scale);assert(after>before);assert.equal(await page.locator('.image-feedback-layer').count(),0);
await page.screenshot({path:'artifacts/media-depth-fix/native-pinch.png',scale:'css'});
await writeFile('artifacts/media-depth-fix/native-gestures.json',JSON.stringify({pinch:{before,after},feedbackLayers:0},null,2));await browser.close();
