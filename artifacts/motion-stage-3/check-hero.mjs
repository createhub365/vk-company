import {chromium} from '@playwright/test';import {readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const browser=await chromium.launch();const dir='artifacts/motion-stage-3';const results=[];const before=JSON.parse(await readFile(`${dir}/before/layout.json`,'utf8'));
for(const scenario of [{name:'desktop',width:1440},{name:'mobile',width:390,touch:true},{name:'desktop-reduced',width:1440,reduced:true},{name:'mobile-reduced',width:390,touch:true,reduced:true},{name:'desktop-no-js',width:1440,nojs:true},{name:'mobile-no-js',width:390,nojs:true}]){
 const record=!scenario.reduced&&!scenario.nojs;
 const context=await browser.newContext({viewport:{width:scenario.width,height:900},deviceScaleFactor:scenario.width<768?3:2,hasTouch:!!scenario.touch,isMobile:!!scenario.touch,javaScriptEnabled:!scenario.nojs,reducedMotion:scenario.reduced?'reduce':'no-preference',...(record?{recordVideo:{dir:`${dir}/recordings`,size:{width:scenario.width,height:900}}}:{})});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.__heroEntries=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){const a=animate.call(this,frames,options);if(this.closest('.hero-motion')){const record={class:this.className,line:this.dataset.heroLine,frames,options,at:performance.now()};window.__heroEntries.push(record);a.ready.then(()=>record.startTime=a.startTime);}return a;};});
 await page.goto('http://127.0.0.1:3102');await page.locator('.cinematic-hero-background').evaluate(i=>i.decode());
 await page.waitForTimeout(150);await page.screenshot({path:`${dir}/${scenario.name}-entrance.png`,scale:'css'});
 await page.waitForTimeout(1450);await page.screenshot({path:`${dir}/${scenario.name}-rest.png`,scale:'css'});
 const initial=await page.evaluate(()=>({
  entries:(window.__heroEntries||[]).sort((a,b)=>a.options.delay-b.options.delay),h1:document.querySelector('h1').textContent,br:document.querySelector('h1').querySelectorAll('br').length,
  planes:[...document.querySelectorAll('[data-hero-plane]')].map(e=>({name:e.dataset.heroPlane,transform:getComputedStyle(e).transform,willChange:getComputedStyle(e).willChange})),
  emphasis:getComputedStyle(document.querySelector('.hero-line-borders')).transform,
  layout:[...document.querySelectorAll('header,main > section,footer,.cinematic-copy h1,.cinematic-support,.cinematic-copy .lede,.cinematic-copy .hero-actions')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,class:e.className,x:r.x,y:r.y+scrollY,width:r.width,height:r.height};}),
  overflow:document.documentElement.scrollWidth>innerWidth,
 }));
 assert.equal(initial.h1,'Across cities.Across borders.');assert.equal(initial.br,1);assert.equal(initial.overflow,false);
 const untouched=initial.layout.filter(e=>e.tag==='HEADER'||e.tag==='FOOTER'||e.tag==='SECTION'&&!e.class.includes('cinematic'));
 const baseline=before.find(r=>r.width===scenario.width).layout.filter(e=>e.tag==='HEADER'||e.tag==='FOOTER'||e.tag==='SECTION'&&!e.class.includes('cinematic'));
 assert.equal(untouched.length,baseline.length); for(let i=0;i<untouched.length;i++){assert.equal(untouched[i].class,baseline[i].class);for(const key of ['x','y','width','height'])assert(Math.abs(untouched[i][key]-baseline[i][key])<.1,`Non-hero ${key} changed: ${untouched[i].class}`);}
 if(record){assert.equal(initial.entries.length,4);assert.deepEqual(initial.entries.map(e=>e.options.duration),[600,600,400,400]);assert.deepEqual(initial.entries.map(e=>e.options.delay),[0,210,810,900]);assert(initial.entries.every(e=>JSON.stringify(e.options.easing.match(/[\d.]+/g).map(Number))==='[0.16,1,0.3,1]'));assert(Math.max(...initial.entries.map(e=>e.startTime))-Math.min(...initial.entries.map(e=>e.startTime))<1);}
 else {assert.equal(initial.entries.length,0);}
 const pointer=[];
 for(const point of [{x:scenario.width*.85,y:260},{x:scenario.width*.15,y:640}]){
  await page.mouse.move(point.x,point.y);await page.waitForTimeout(80);
  pointer.push(await page.locator('[data-hero-plane="front"]').evaluate(e=>{const s=getComputedStyle(e),m=new DOMMatrixReadOnly(s.transform);return {x:m.m41,y:m.m42,z:m.m43,willChange:s.willChange};}));
  await page.waitForTimeout(700);
 }
 if(record&&scenario.width===1440)assert(pointer.some(p=>Math.abs(p.x)>.1));else assert(pointer.every(p=>p.x===0&&p.y===0));
 assert(pointer.every(p=>Math.abs(p.x)<=10&&Math.abs(p.y)<=10));
 await page.screenshot({path:`${dir}/${scenario.name}-pointer.png`,scale:'css'});
 await page.mouse.move(2,5);await page.waitForTimeout(1500);
 const scroll=[];
 for(const target of [180,420,720,420,180,0]){
  // Immediate native positioning also exercises scrollbar-like jumps, not a timed tween.
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),target);await page.waitForTimeout(100);
  scroll.push(await page.evaluate(()=>{const s=document.querySelector('.hero-stage'),section=document.querySelector('.cinematic-hero'),c=getComputedStyle(s),m=new DOMMatrixReadOnly(c.transform);return {y:scrollY,height:section.getBoundingClientRect().height,top:section.getBoundingClientRect().top,progress:Number(s.dataset.heroProgress||0),z:m.m43,opacity:Number(c.opacity)};}));
  if(target===420)await page.screenshot({path:`${dir}/${scenario.name}-scroll-${scroll.length}.png`,scale:'css'});
  await page.waitForTimeout(240);
 }
 if(record){for(const sample of scroll){const expected=Math.max(0,Math.min(1,(sample.y-Math.max(0,sample.top+sample.y))/sample.height));assert(Math.abs(sample.progress-expected)<.002);assert(Math.abs(sample.z-(-60*(scenario.width<768?.5:1)*expected))<.1);assert(Math.abs(sample.opacity-(1-.6*expected))<.002);}assert.equal(scroll[1].z,scroll[3].z);assert.equal(scroll[0].z,scroll[4].z);}else if(scenario.reduced){assert(scroll.every(s=>s.z===0&&s.opacity===1));}
 await page.waitForTimeout(1200);
 const willChange=await page.locator('.hero-motion [data-depth-motion]').evaluateAll(els=>els.map(e=>getComputedStyle(e).willChange));assert(willChange.every(v=>v==='auto'));
 if(scenario.name==='desktop'){
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);assert(await page.locator('.hero-motion [data-depth-motion]').evaluateAll(els=>els.every(e=>getComputedStyle(e).transform==='none'&&getComputedStyle(e).opacity==='1')));
  await page.screenshot({path:`${dir}/desktop-live-reduced.png`,scale:'css'});
 }
 assert.deepEqual(errors,[]);results.push({scenario,initial,pointer,scroll,willChange,errors});
 if(record){const video=page.video();await context.close();await video.saveAs(`${dir}/hero-${scenario.width}.webm`);}else await context.close();
}
await browser.close();await writeFile(`${dir}/hero-results.json`,JSON.stringify(results,null,2));console.log('PASS: hero timing, shared clock, spring pointer bounds/gates, exact reversible scroll mapping, unchanged non-hero layout, reduced motion, no-JS, and will-change cleanup.');
