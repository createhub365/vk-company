import {chromium} from '@playwright/test';
const browser=await chromium.launch();
for(const width of [1440,390])for(const mode of ['reduced','webgl-failed','no-javascript']){
 const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:mode!=='no-javascript',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
 const page=await context.newPage();await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&r.request().method()==='GET'?r.continue():r.abort());
 if(mode==='webgl-failed')await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:Reflect.apply(original,this,[type,...args]);};});
 await page.goto('http://127.0.0.1:3102/get-a-quote');await page.locator('.quote-photo img').waitFor();await page.screenshot({path:`artifacts/media-depth-fix/${mode}-${width}.png`,scale:'css'});await context.close();
}
await browser.close();
