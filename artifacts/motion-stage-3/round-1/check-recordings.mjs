import {createRequire} from 'node:module';const require=createRequire('/Users/pranshudhiman/Desktop/vk and company/package.json');const {chromium}=require('@playwright/test');import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const results=[];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});await page.goto(pathToFileURL(resolve(`/Users/pranshudhiman/Desktop/vk and company/artifacts/motion-stage-3/round-1/hero-review-${width}.webm`)).href);
 const video=page.locator('video');await video.evaluate(v=>new Promise(resolve=>{v.pause();if(v.readyState>=1)resolve();else v.addEventListener('loadedmetadata',resolve,{once:true});}));
 const metadata=await video.evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration}));
 for(const time of [0.5,3.5]){await video.evaluate((v,t)=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;}),time);await video.screenshot({path:`/Users/pranshudhiman/Desktop/vk and company/artifacts/motion-stage-3/round-1/recording-${width}-${time}.png`});}
 results.push({viewport:width,...metadata});await page.close();
}await browser.close();await writeFile('/Users/pranshudhiman/Desktop/vk and company/artifacts/motion-stage-3/round-1/recording-metadata.json',JSON.stringify(results,null,2));console.log(results);
