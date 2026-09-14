import {chromium} from '@playwright/test';import {readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch();const records=[];
for(const name of ['desktop','mobile']){
 const page=await browser.newPage({viewport:{width:name==='desktop'?1440:390,height:name==='desktop'?900:844}});
 await page.route('http://recording.local/video',async r=>r.fulfill({contentType:'video/webm',body:await readFile(`artifacts/media-depth-fix/${name}-interactions.webm`)}));
 await page.setContent('<style>body{margin:0}video{width:100%;height:100vh}</style><video muted src="http://recording.local/video"></video>');
 await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
 const metadata=await page.locator('video').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration}));
 assert(metadata.width>0);records.push({name,...metadata});
 for(const time of name==='desktop'?[2,4.6,7]:[1,2.2,3.3]){await page.locator('video').evaluate((v,t)=>new Promise(r=>{v.onseeked=r;v.currentTime=t;}),time);await page.waitForTimeout(150);await page.screenshot({path:`artifacts/media-depth-fix/playback-${name}-${time}.png`});}
 await page.close();
}
await writeFile('artifacts/media-depth-fix/recording-metadata.json',JSON.stringify(records,null,2));await browser.close();
