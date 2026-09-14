import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
for(const [route,selector,name] of [['/about','.about-what-we-do','about-section'],['/services/international','section[aria-labelledby="international-process"]','international-section'],['/','.process-flow','process-section']]){
 await page.goto('http://127.0.0.1:3102'+route);
 for(const image of await page.locator(selector+' img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(e=>e.decode());await page.waitForTimeout(150);}
 await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(250);
 await page.locator(selector).screenshot({path:`artifacts/feedback-photo-fix/${name}-sharpness.png`,scale:'css'});
}
await page.goto('http://127.0.0.1:3102/contact');const field=page.getByLabel('Name',{exact:true});await field.fill('Local verification only');await page.screenshot({path:'artifacts/feedback-photo-fix/field-focus.png',scale:'css'});
await browser.close();
