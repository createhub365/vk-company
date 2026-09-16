import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const phase=process.argv[2]||'before';const browser=await chromium.launch();const results=[];
for(const rate of [1,4])for(const mode of (phase==='before'?['normal','native-wheel','no-webgl','no-button-effects']:['normal'])){
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1}),page=await context.newPage();
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
 await page.addInitScript(mode=>{
  window.profileTasks=[];new PerformanceObserver(list=>{window.profileTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})));}).observe({type:'longtask',buffered:true});
  window.profileWheels=[];window.addEventListener('wheel',e=>window.profileWheels.push({delta:e.deltaY,mode:e.deltaMode,time:performance.now()}),{capture:true,passive:true});
  if(mode==='native-wheel')window.addEventListener('wheel',e=>e.stopImmediatePropagation(),{capture:true,passive:true});
  if(mode==='no-webgl'){const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};}
 },mode);
 await page.goto('http://127.0.0.1:3102/get-a-quote');
 if(mode!=='no-webgl')await page.waitForFunction(()=>document.querySelector('.quote-media')?.dataset.bubbles==='webgl',{timeout:15000}).catch(()=>{});
 await page.waitForTimeout(1800);
 if(mode==='no-button-effects')await page.addStyleTag({content:'.button,.button::before{transform:none!important;transition:none!important;animation:none!important}'});
 await page.mouse.move(12,450);
 const before=await page.evaluate(()=>({frames:Number(document.querySelector('.quote-bubble-canvas')?.dataset.frames||0),bubbles:document.querySelector('.quote-media')?.dataset.bubbles,lenis:document.documentElement.dataset.depthScroll||'native',tasks:window.profileTasks,ready:performance.now()}));
 await page.evaluate(()=>{window.profileSamples=[];const start=performance.now();window.profileStart=start;const sample=t=>{window.profileSamples.push({t:t-start,y:scrollY,frames:Number(document.querySelector('.quote-bubble-canvas')?.dataset.frames||0)});if(t-start<1700)requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 await page.mouse.wheel(0,500);await page.waitForTimeout(1800);
 const result=await page.evaluate(()=>({samples:window.profileSamples,wheels:window.profileWheels,tasks:window.profileTasks.filter(e=>e.start>=window.profileStart),frames:Number(document.querySelector('.quote-bubble-canvas')?.dataset.frames||0)}));
 const intervals=result.samples.slice(1).map((s,i)=>s.t-result.samples[i].t).sort((a,b)=>a-b);
 const settled=result.samples.find(s=>Math.abs(s.y-500)<=1)?.t??null;
 results.push({mode,rate,before,...result,settledWithinOnePixelMs:settled,settledToFinalPositionMs:result.samples.find(s=>Math.abs(s.y-result.samples.at(-1).y)<=1)?.t,frameP95Ms:intervals[Math.floor(intervals.length*.95)],framesOver50ms:intervals.filter(x=>x>50).length});
 await context.close();console.log(mode,rate,settled,results.at(-1).frameP95Ms,'webgl frames',before.frames,result.frames);
}
await browser.close();await writeFile(`artifacts/three-fixes/quote-profile-${phase}.json`,JSON.stringify(results,null,2));
