import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch(),results=[];
const routes=['/','/services/domestic','/services/international','/about','/contact','/get-a-quote','/faq','/track','/privacy','/terms','/404.html'];
for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:width===390?2:1,hasTouch:width===390}),page=await context.newPage();
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 await page.addInitScript(()=>{window.scrollTasks=[];new PerformanceObserver(list=>window.scrollTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});});
 for(const route of routes){
  const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  const response=await page.goto(`http://127.0.0.1:3102${route}`);assert.equal(response.headers()['x-content-type-options'],'nosniff');
  await page.waitForTimeout(route==='/get-a-quote'?2200:700);await page.mouse.move(8,350);
  assert(!await page.locator('body').innerText().then(t=>/Illustrative (courier environment|route imagery|international logistics|operations environment)/.test(t)));
  await page.evaluate(()=>{window.scrollSamples=[];window.scrollStart=performance.now();window.scrollRecording=true;const sample=t=>{if(!window.scrollRecording)return;window.scrollSamples.push({t,y:scrollY});requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  let reached=false,steps=0;
  for(;steps<80;steps++){
   await page.mouse.wheel(0,580);await page.waitForTimeout(100);
   reached=await page.evaluate(()=>scrollY>=document.documentElement.scrollHeight-innerHeight-2);if(reached)break;
  }
  await page.waitForTimeout(900);
  const state=await page.evaluate(()=>{window.scrollRecording=false;return{samples:window.scrollSamples,tasks:window.scrollTasks.filter(e=>e.start>=window.scrollStart),scrollY,max:document.documentElement.scrollHeight-innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,lenis:document.documentElement.dataset.depthScroll||'native',webglFrames:document.querySelector('.quote-bubble-canvas')?.dataset.frames||null,images:[...document.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0}))};});
  assert(Math.abs(state.scrollY-state.max)<=2,`Bottom unreachable ${route} ${width}`);assert(!state.overflow);assert.deepEqual(errors,[]);assert(state.images.every(i=>i.loaded));
  const intervals=state.samples.slice(1).map((s,i)=>s.t-state.samples[i].t).sort((a,b)=>a-b);
  results.push({route,width,steps,...state,frameP95Ms:intervals[Math.floor(intervals.length*.95)],framesOver50ms:intervals.filter(x=>x>50).length,errors});
  const name=route==='/'?'home':route.replaceAll('/','-').slice(1);
  await page.screenshot({path:`artifacts/three-fixes/page-${name}-${width}.png`,fullPage:true,scale:'css'});
  console.log(width,route,'p95',results.at(-1).frameP95Ms,'>50ms',results.at(-1).framesOver50ms,'long tasks',state.tasks.length);
  page.off('pageerror',onError);
 }
 await context.close();
}
await browser.close();await writeFile('artifacts/three-fixes/site-scroll-results.json',JSON.stringify(results,null,2));
