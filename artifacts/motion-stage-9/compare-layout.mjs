import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),results=[];const dir='artifacts/motion-stage-9/visual';await mkdir(dir,{recursive:true});
try{
for(const width of [1440,390])for(const [name,route] of [['home','/'],['domestic','/services/domestic'],['international','/services/international'],['contact','/contact'],['quote','/get-a-quote']]){
 const versions={};for(const [version,port] of [['before',3108],['after',3109]]){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:2,reducedMotion:'reduce'});await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());const page=await context.newPage();await page.goto(`http://127.0.0.1:${port}${route}`);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await page.waitForTimeout(500);
 versions[version]=await page.locator('header,main,footer,main h1,main h2,main p,main img,form,input,textarea,select').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:['H1','H2','P'].includes(e.tagName)?e.textContent:'',rect:[r.x,r.y,r.width,r.height]};}));
 await page.screenshot({path:`${dir}/${name}-${width}-${version}.png`,fullPage:true,scale:'css'});await context.close();}
 assert.equal(versions.before.length,versions.after.length);let maxDelta=0;versions.before.forEach((el,i)=>{assert.equal(el.tag,versions.after[i].tag);assert.equal(el.text,versions.after[i].text);el.rect.forEach((v,j)=>maxDelta=Math.max(maxDelta,Math.abs(v-versions.after[i].rect[j])));});assert(maxDelta<.1,`${route} ${width} layout drift ${maxDelta}`);results.push({route,width,maxDeltaPx:maxDelta,elements:versions.after.length});console.log(route,width,'unchanged layout',maxDelta);
}
}finally{await browser.close();await writeFile(`${dir}/layout-comparison.json`,JSON.stringify(results,null,2));}
