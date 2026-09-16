import { expect, test, type Page, type Locator } from "@playwright/test";

const layer = (page: Page) => page.locator(".image-feedback-layer");
async function activate(target: Locator, touch: boolean) {
  await target.scrollIntoViewIfNeeded();
  if (touch) await target.tap({ position: { x: 40, y: 40 } });
  else await target.click({ position: { x: 40, y: 40 } });
}

test.beforeEach(async ({ context }) => {
  await context.route("**/*", route => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) && ["GET", "HEAD"].includes(route.request().method()) ? route.continue() : route.abort());
});
test('existing Quote WebGL scene stays idle through pointer-disabled taps and offscreen',async({page,isMobile})=>{
  await page.goto('/get-a-quote');const host=page.locator('.quote-media'),frame=page.locator('.quote-photo'),canvas=host.locator('canvas');
  await host.scrollIntoViewIfNeeded();await expect(host).toHaveAttribute('data-bubbles','webgl');
  await expect(canvas).toHaveCount(1);
  expect(await canvas.evaluate(el=>Boolean((el as HTMLCanvasElement).getContext('webgl2')))).toBe(true);
  await page.waitForTimeout(750);
  const idle=await canvas.getAttribute('data-frames');await page.waitForTimeout(180);expect(await canvas.getAttribute('data-frames')).toBe(idle);
  const box=(await frame.boundingBox())!;
  for(let i=0;i<15;i++) {
    if(isMobile) await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    else await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    expect(await layer(page).count()).toBeLessThanOrEqual(1);
  }
  expect(await canvas.getAttribute('data-frames')).toBe(idle);
  expect(await frame.getAttribute('data-photo-hover')).toBeNull();
  expect(await frame.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await expect(layer(page)).toHaveCount(0);await page.waitForTimeout(750);
  const settled=await canvas.getAttribute('data-frames');await page.waitForTimeout(180);expect(await canvas.getAttribute('data-frames')).toBe(settled);
  await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(100);
  const off=await canvas.getAttribute('data-frames');await page.waitForTimeout(180);expect(await canvas.getAttribute('data-frames')).toBe(off);
});

test('reduced motion and lost WebGL leave stationary feedback and essential content',async({page,isMobile})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/get-a-quote');
  const frame=page.locator('.quote-photo');await activate(frame,isMobile);
  expect(await frame.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  expect(await page.locator('canvas').count()).toBe(0);
  await expect(page.locator('.quote-bubble-fallback')).toBeVisible();
  await expect(layer(page)).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(page.locator('.quote-media')).toHaveAttribute('data-bubbles','webgl');
  await page.locator('canvas').evaluate(el=>(el as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(page.locator('.quote-media')).toHaveAttribute('data-bubbles','fallback');
  await expect(page.locator('.quote-bubble-fallback')).toBeVisible();
  await expect(frame.locator('img')).toBeVisible();
  await page.getByLabel('Name',{exact:true}).fill('Local test');
  await expect(page.getByLabel('Name',{exact:true})).toHaveValue('Local test');
});

test('WebGL unavailable from startup and JavaScript disabled preserve the photograph/form',async({page,context})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type.startsWith('webgl'))return null;return Reflect.apply(original,this,[type,...args]);} as typeof original;});
  await page.goto('/get-a-quote');await expect(page.locator('.quote-photo img')).toBeVisible();
  await expect(page.locator('.quote-bubble-fallback')).toBeVisible();
  const noJS=await context.browser()!.newContext({javaScriptEnabled:false,viewport:page.viewportSize()!});
  const staticPage=await noJS.newPage();await staticPage.goto('http://127.0.0.1:3109/get-a-quote');
  await expect(staticPage.locator('.quote-photo img')).toBeVisible();await expect(staticPage.getByLabel('Name',{exact:true})).toBeVisible();
  await noJS.close();
});

