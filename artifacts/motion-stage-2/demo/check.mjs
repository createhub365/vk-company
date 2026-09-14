import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='artifacts/motion-stage-2/demo';await mkdir(dir,{recursive:true});
const browser=await chromium.launch();const results=[];
const base='http://127.0.0.1:3102';
for(const scenario of [
 {name:'desktop',width:1440,dpr:2}, {name:'tablet',width:768,dpr:2}, {name:'mobile',width:390,dpr:3,touch:true},
 {name:'small-mobile',width:360,dpr:3,touch:true}, {name:'reduced',width:1440,dpr:2,reduced:true}, {name:'no-js',width:390,dpr:3,nojs:true},
]){
 const context=await browser.newContext({viewport:{width:scenario.width,height:900},deviceScaleFactor:scenario.dpr,hasTouch:!!scenario.touch,isMobile:!!scenario.touch,javaScriptEnabled:!scenario.nojs,reducedMotion:scenario.reduced?'reduce':'no-preference',...(scenario.name==='desktop'?{recordVideo:{dir:`${dir}/recording`,size:{width:1440,height:900}}}:{})});
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'&&route.request().method()==='GET'?route.continue():route.abort());
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__motionSamples=[];
  const animate=Element.prototype.animate;
  Element.prototype.animate=function(frames,options){
   if(this.hasAttribute('data-depth-motion')) window.__motionSamples.push({id:this.id,frames,options,willChange:this.style.willChange});
   return animate.call(this,frames,options);
  };
 });
 await page.goto(`${base}/motion-foundation-demo`);await page.locator('#demo-media img').evaluate(i=>i.decode());
 await page.waitForTimeout(120);
 await page.screenshot({path:`${dir}/${scenario.name}-entry.png`,scale:'css'});
 await page.waitForTimeout(1100);
 const initial=await page.evaluate(()=>({
  samples:window.__motionSamples||[],smooth:document.documentElement.dataset.depthScroll||'native',
  perspective:getComputedStyle(document.querySelector('#demo-depth')).perspective,
  tokens:Object.fromEntries(['--z-back','--z-front','--z-pop'].map(p=>[p,getComputedStyle(document.documentElement).getPropertyValue(p).trim()])),
  riseTransform:getComputedStyle(document.querySelector('#demo-rise')).transform,riseWillChange:getComputedStyle(document.querySelector('#demo-rise')).willChange,
 }));
 if(!scenario.nojs&&!scenario.reduced){
  assert.equal(initial.smooth,'smooth');assert.equal(initial.samples.length,2);
  assert(initial.samples.every(s=>JSON.stringify(s.options.easing.match(/[\d.]+/g).map(Number))===JSON.stringify([0.16,1,0.3,1])));
  assert.match(initial.samples[0].frames[0].transform,/translateY\(40px\) rotateX\(12deg\)/);
  assert.equal(initial.samples[0].willChange,'transform, opacity');
 }else{assert.equal(initial.samples.length,0);assert.equal(initial.smooth,'native');}
 assert.equal(initial.riseTransform,'none');assert.equal(initial.riseWillChange,'auto');
 assert.equal(initial.tokens['--z-front'],scenario.width<768?'20px':'40px');
 const before=await page.evaluate(()=>window.scrollY);await page.mouse.wheel(0,650);await page.waitForTimeout(900);
 assert((await page.evaluate(()=>window.scrollY))>before);
 await page.screenshot({path:`${dir}/${scenario.name}-scroll.png`,scale:'css'});
 const moving=[];
 for(let i=0;i<5;i++){
  await page.mouse.wheel(0,70);await page.waitForTimeout(40);
  moving.push(await page.locator('#demo-media > div').evaluate(e=>{
   const s=getComputedStyle(e),m=new DOMMatrixReadOnly(s.transform);return {z:m.m43,scale:m.m11,willChange:s.willChange,opacity:s.opacity};
  }));
 }
 if(scenario.reduced||scenario.nojs){assert(moving.every(m=>m.z===0&&m.scale===1));}
 else {const lo=scenario.width<768?-20:-40,hi=scenario.width<768?10:20;assert(moving.every(m=>m.z>=lo-.01&&m.z<=hi+.01&&m.scale>=1&&m.scale<=1.041));assert(moving.some(m=>m.willChange==='transform'));}
 await page.waitForTimeout(1500);assert.equal(await page.locator('#demo-media > div').evaluate(e=>getComputedStyle(e).willChange),'auto');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(scenario.name==='desktop'){
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.depthScroll||'native'),'native');
  assert.equal(await page.locator('#demo-media > div').evaluate(e=>getComputedStyle(e).transform),'none');
  await page.screenshot({path:`${dir}/desktop-live-reduced-toggle.png`,scale:'css'});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.depthScroll),'smooth');
  await page.locator('#demo-late').scrollIntoViewIfNeeded();await page.waitForTimeout(120);await page.screenshot({path:`${dir}/desktop-late-reveal.png`,scale:'css'});
 }
 assert.deepEqual(errors,[]);results.push({scenario,initial,moving,errors});await context.close();
}
// The real Quote route: existing photograph/WebGL remain, no shared pointer tilt or tap transform.
const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();
await page.goto(`${base}/get-a-quote`);await page.locator('.quote-photo img').evaluate(i=>i.decode());await page.waitForTimeout(900);
const photo=page.locator('.quote-photo');const b=await photo.boundingBox();await page.mouse.move(b.x+10,b.y+10);await page.waitForTimeout(120);await photo.click({position:{x:35,y:35}});await page.waitForTimeout(80);
const quote=await photo.evaluate(e=>({transform:getComputedStyle(e).transform,hover:e.hasAttribute('data-photo-hover'),ripple:e.querySelectorAll('.image-feedback-ripple').length,src:e.querySelector('img').getAttribute('src')}));assert.equal(quote.transform,'none');assert.equal(quote.hover,false);assert.equal(quote.ripple,0);
await page.screenshot({path:`${dir}/quote-pointer-disabled.png`,scale:'css'});await context.close();await browser.close();
await writeFile(`${dir}/results.json`,JSON.stringify({results,quote},null,2));console.log('PASS: 6 demo profiles, bounded transforms, expo easing, final-state SSR/reduced motion, live preference toggle, scrolling, will-change cleanup, Quote pointer exclusion.');
