import { expect, test, type Page, type Locator } from "@playwright/test";

const routes = ["/", "/services/domestic", "/services/international", "/about", "/contact", "/get-a-quote", "/faq", "/privacy", "/terms", "/track"];
const layer = (page: Page) => page.locator(".image-feedback-layer");
declare global { interface Window { photoTestPoint?: { x: number; y: number }; } }
async function activate(target: Locator, touch: boolean) {
  await expect(target.page().locator("html")).toHaveAttribute("data-photo-feedback-ready", "true");
  await target.scrollIntoViewIfNeeded();
  if (touch) await target.tap({ position: { x: 40, y: 40 } });
  else await target.click({ position: { x: 40, y: 40 } });
}

test.beforeEach(async ({ context }) => {
  await context.route("**/*", route => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) && ["GET", "HEAD"].includes(route.request().method()) ? route.continue() : route.abort());
  await context.addInitScript(() => document.addEventListener("click", event => { window.photoTestPoint = { x: event.clientX, y: event.clientY }; }, true));
});

for (const path of routes) test(`edge-to-edge photos and bounded taps ${path}`, async ({ page, isMobile }, info) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  const response = await page.goto(path);
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  for (const frame of await page.locator('[data-photo-frame]').all()) {
    await frame.scrollIntoViewIfNeeded();
    await expect(page.locator("html")).toHaveAttribute("data-photo-feedback-ready", "true");
    await frame.locator('img').evaluate((el: HTMLImageElement) => el.decode());
    await frame.evaluate(async el => {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      await Promise.allSettled(el.closest('section')!.getAnimations({ subtree: true }).map(animation => animation.finished));
    });
    if (await frame.evaluate(el => Boolean(el.closest('.process-depth')))) {
      // The process now changes projected scale on scroll. Settle the shared
      // scroll update before measuring the resting tap target and heading.
      await frame.evaluate(async el => {
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      await expect.poll(() => frame.evaluate(el => getComputedStyle(el.closest('li')!).willChange)).toBe('auto');
    }
    await frame.evaluate(async el => {
      const section = el.closest('.editorial-motion');
      if (!section) return;
      // Wait for the intentional scroll entrance before testing tap isolation.
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      await Promise.allSettled(section.getAnimations({ subtree: true }).map(animation => animation.finished));
    });
    const fit = await frame.evaluate(el => {
      const img = el.querySelector('img')!;
      return { width: el.clientWidth, height: el.clientHeight, imageWidth: img.clientWidth, imageHeight: img.clientHeight, ratio: img.naturalWidth / img.naturalHeight, padding: getComputedStyle(el).padding, processCard: Boolean(el.closest(".process-list")) };
    });
    expect(fit.padding).toBe('0px');
    expect(Math.abs(fit.width-fit.imageWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(fit.height-fit.imageHeight)).toBeLessThanOrEqual(1);
    expect(Math.abs(fit.imageWidth/fit.imageHeight-(fit.processCard ? 1.5 : fit.ratio))).toBeLessThan(.015);
    // The homepage hero now intentionally recedes with scroll. Photo taps must
    // leave their own section heading stationary, including during hero hydration.
    const heading = path === '/' ? frame.locator('xpath=ancestor::section[1]').locator('h1,h2,h3').first() : page.locator('h1');
    const headingBox = await heading.boundingBox();
    await activate(frame,isMobile);
    if (path === "/get-a-quote") {
      await expect(layer(page)).toHaveCount(0);
      expect(await frame.evaluate(el=>getComputedStyle(el).transform)).toBe("none");
      expect(await heading.boundingBox()).toEqual(headingBox);
      continue;
    }
    await expect(layer(page)).toHaveCount(1);
    // The locator's 40px offset is local to a projected/tilted target, not a
    // viewport distance. Check against the actual click point at the start of
    // feedback instead of comparing it with an obsolete unprojected offset.
    await frame.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 0; }));
    const ripple = (await layer(page).boundingBox())!;
    const point = (await page.evaluate(() => window.photoTestPoint))!;
    expect(Math.abs(ripple.x + ripple.width / 2 - point.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(ripple.y + ripple.height / 2 - point.y)).toBeLessThanOrEqual(1);
    const feedback=await layer(page).evaluate(el=>({left:parseFloat((el as HTMLElement).style.left),top:parseFloat((el as HTMLElement).style.top),opacity:Number(getComputedStyle(el).opacity),position:getComputedStyle(el).position}));
    expect(feedback.opacity).toBeGreaterThan(.1);expect(feedback.position).toBe('absolute');
    expect(await frame.locator('img').evaluate(el=>el.getAnimations().length)).toBe(0);
    expect(await heading.boundingBox()).toEqual(headingBox);
    await frame.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => animation.play()));
    await page.screenshot({path:info.outputPath(`tap-${await frame.getAttribute('class')}.png`),scale:'css'});
    await expect(layer(page)).toHaveCount(0);
    expect(await frame.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  }
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('hover tilts only the coherent frame and settles on leave',async({page,isMobile})=>{
  test.skip(isMobile,'Touch has tap feedback without hover');
  await page.goto('/services/domestic');const frame=page.locator('[data-service-tilt]').first();
  await frame.scrollIntoViewIfNeeded();await page.waitForTimeout(900);
  const b=(await frame.boundingBox())!, heading=await page.locator('h1').boundingBox();
  await page.mouse.move(b.x+b.width*.95,b.y+b.height*.1);
  await expect(frame).toHaveAttribute('data-photo-hover','');
  await expect.poll(()=>frame.evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
  expect(await frame.locator('img').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  expect(await frame.evaluate(el=>getComputedStyle(el,'::after').backgroundImage)).toContain('radial-gradient');
  expect(await page.locator('h1').boundingBox()).toEqual(heading);
  await page.mouse.move(1,200);
  await expect.poll(()=>frame.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
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
  const staticPage=await noJS.newPage();await staticPage.goto(new URL("/get-a-quote", page.url()).href);
  await expect(staticPage.locator('.quote-photo img')).toBeVisible();await expect(staticPage.getByLabel('Name',{exact:true})).toBeVisible();
  await noJS.close();
});

test('native keyboard links, forms and menus remain unaffected',async({page,isMobile})=>{
  await page.goto('/about');
  // Public photos are currently unlinked: exercise a native linked-photo fixture.
  await page.locator('.about-thumbnail').first().evaluate(el=>{const a=document.createElement('a');a.href='/faq';el.replaceWith(a);a.append(el);});
  const link=page.getByRole('link',{name:'Illustrative parcel being weighed and measured'});
  await link.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/faq$/);
  const faq=page.locator('summary').first();await faq.focus();await page.keyboard.press('Enter');await expect(faq.locator('..')).toHaveAttribute('open','');
  await expect(layer(page)).toHaveCount(0);
  const logo=page.getByRole('link',{name:'VK AND COMPANY home',exact:true});await logo.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/$/);
  expect(await logo.locator('img').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await page.goto('/contact');const input=page.getByLabel('Name',{exact:true});await input.fill('Local test');await expect(input).toHaveValue('Local test');await expect(layer(page)).toHaveCount(0);
  if(isMobile){const menu=page.getByRole('button',{name:'Open menu'});await menu.click();await expect(page.getByRole('button',{name:'Close menu'})).toHaveAttribute('aria-expanded','true');}
});

test('scroll, swipe, pinch, drag and selection do not create tap effects',async({page,isMobile})=>{
  await page.goto('/');const target=page.locator('#domestic-services .editorial-image');await target.scrollIntoViewIfNeeded();
  const b=(await target.boundingBox())!;
  if(isMobile){
    const cdp=await page.context().newCDPSession(page);const x=b.x+100,y=b.y+150;const before=await page.evaluate(()=>scrollY);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let d=20;d<=120;d+=20)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-d}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(()=>page.evaluate(()=>scrollY)).not.toBe(before);await expect(layer(page)).toHaveCount(0);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:300},{x:200,y:300}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:70,y:300},{x:230,y:300}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(layer(page)).toHaveCount(0);await cdp.detach();
  }else{await page.mouse.move(b.x+30,b.y+40);await page.mouse.down();await page.mouse.move(b.x+130,b.y+100,{steps:8});await page.mouse.up();await expect(layer(page)).toHaveCount(0);await page.mouse.wheel(0,150);await expect(layer(page)).toHaveCount(0);}
  await page.locator('h1').evaluate(el=>{const r=document.createRange();r.selectNodeContents(el);getSelection()?.removeAllRanges();getSelection()?.addRange(r);});
  await target.dispatchEvent('pointerdown',{isPrimary:true,pointerId:1,button:0,clientX:25,clientY:25});
  await target.dispatchEvent('click',{detail:1,clientX:25,clientY:25});await expect(layer(page)).toHaveCount(0);
  await page.evaluate(()=>getSelection()?.removeAllRanges());
  await page.goto('/');const hero=page.locator('.cinematic-hero-background');await page.mouse.move(300,300);await page.mouse.click(300,300);expect(await hero.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  expect(await page.locator('canvas').count()).toBe(0);
});
