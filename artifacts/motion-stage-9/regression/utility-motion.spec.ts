import { expect, test, type Page } from "@playwright/test";

const notice = "Submitting this form creates an enquiry. It does not confirm a quote, booking, pickup or dispatch.";
async function matrix(page: Page, selector: string) {
  return page.locator(selector).evaluate(e => { const s = getComputedStyle(e), m = new DOMMatrix(s.transform); return { z:m.m43, scale:m.m11, rotation:m.m23, transform:s.transform, opacity:s.opacity, outline:s.outlineStyle, outlineWidth:s.outlineWidth }; });
}
test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
});

test("native FAQ keyboard, answer hinge, rapid toggles and cleanup", async ({ page }) => {
  await page.goto("/faq"); const list=page.locator(".faq-depth"), details=list.locator("details").first(), summary=details.locator("summary"), answer=details.locator("p");
  await expect(list).toHaveAttribute("data-utility-ready", "");
  await answer.evaluate(e => {
    const animate = e.animate;
    e.animate = function(frames, options) {
      e.dataset.testFrames = JSON.stringify({frames, duration: typeof options === "object" ? options.duration : options});
      return animate.call(this, frames, options);
    };
  });
  await summary.focus(); await page.keyboard.press("Enter"); await expect(details).toHaveAttribute("open", "");
  // Native toggle is delivered asynchronously; retain its actual keyframes
  // instead of racing a single sample against a 240ms animation's lifetime.
  await expect(answer).toHaveAttribute("data-test-frames", /rotateX/);
  const frames = JSON.parse((await answer.getAttribute("data-test-frames"))!);
  expect(frames.duration).toBe(240); expect(frames.frames[0].transform).toContain("rotateX(-6deg)");
  expect(await details.evaluate(e => getComputedStyle(e).transform)).toBe("none");
  await page.screenshot({ path:`artifacts/motion-stage-9/regression/screenshots/faq-${page.viewportSize()!.width}.png`, scale:"css" });
  await expect.poll(() => answer.evaluate(e => getComputedStyle(e).willChange)).toBe("auto");
  for(let i=0;i<5;i++) { await page.keyboard.press("Space"); await page.keyboard.press("Enter"); }
  await expect(summary).toBeFocused(); await expect(details).toHaveAttribute("open", "");
  await page.waitForTimeout(300); expect(await answer.evaluate(e => e.getAnimations().length)).toBe(0);
  await page.keyboard.press("Tab"); await expect(list.locator("summary").nth(1)).toBeFocused();
  expect((await matrix(page,".faq-depth details:nth-child(2) summary")).outline).not.toBe("none");
});

for(const route of ["/contact","/get-a-quote"]) test(`form depth, keyboard focus, values, notice and press ${route}`, async ({ page }) => {
  await page.goto(route); const mobile=page.viewportSize()!.width<768;
  await expect(page.locator(".form-depth")).toHaveAttribute("data-utility-ready", "");
  if(route==="/get-a-quote") { await expect(page.locator("form .notice")).toHaveText(notice); expect((await matrix(page,"form .notice")).opacity).toBe("1"); }
  expect((await matrix(page,".form-panel")).z).toBeCloseTo(mobile?15:30,1);
  await page.locator('input[name="name"]').fill("Motion review"); await page.waitForTimeout(280);
  const input=await matrix(page,'input[name="name"]'); expect(input.z).toBeCloseTo(mobile?6:12,1); expect(input.outline).not.toBe("none");
  await page.keyboard.press("Tab"); await expect(page.locator('input[name="phone"]')).toBeFocused();
  await expect(page.locator('input[name="name"]')).toHaveValue("Motion review");
  const label = await page.locator('label[for="phone"]').evaluate(e => {const m=new DOMMatrix(getComputedStyle(e).transform);return m.m42;});
  // Wait for the shared expo transition to reach the existing label's raised state.
  expect(label).toBeLessThanOrEqual(0);
  await expect.poll(() => page.locator('label[for="phone"]').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m42)).toBeCloseTo(-2,1);
  const button=page.locator("form .button"); await button.scrollIntoViewIfNeeded();
  if(!mobile) {
    await button.hover(); await page.waitForTimeout(280);
    expect((await matrix(page,"form .button")).rotation).toBeCloseTo(route==="/get-a-quote"?0:-Math.sin(8*Math.PI/180),2);
    const box=(await button.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(280);
    expect((await matrix(page,"form .button")).scale).toBeCloseTo(.97,2);
    // Release outside the submit button: never create an enquiry.
    await page.mouse.move(0,0);await page.mouse.up();
  }
  await page.screenshot({path:`artifacts/motion-stage-9/regression/screenshots/${route.slice(1)}-${page.viewportSize()!.width}.png`,scale:"css"});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(route==="/get-a-quote") expect(await page.locator("form .notice").evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
});

test("footer depth and native keyboard links", async ({ page }) => {
  await page.goto("/faq");const footer=page.locator(".footer-depth"); await expect(footer).toHaveAttribute("data-utility-ready", "");
  expect((await matrix(page,".footer-depth")).z).toBeCloseTo(page.viewportSize()!.width<768?-10:-20,1);
  const links=footer.locator(".footer-col a"); await links.first().focus();
  for(let i=0;i<await links.count();i++) {
    await expect(links.nth(i)).toBeFocused();
    expect(await links.nth(i).evaluate(e=>getComputedStyle(e).outlineStyle)).not.toBe("none");
    if(i+1<await links.count())await page.keyboard.press("Tab");
  }
  await footer.screenshot({path:`artifacts/motion-stage-9/regression/screenshots/footer-${page.viewportSize()!.width}.png`,scale:"css"});
  await links.first().focus(); await page.keyboard.press("Enter"); await expect(page).toHaveURL(/\/services\/domestic$/);
});

test("reduced motion and no-JS preserve final readable content and native details", async ({ page, browser }) => {
  await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/faq");
  const summary=page.locator(".faq-depth summary").first();await summary.focus();await page.keyboard.press("Enter");
  expect((await matrix(page,".faq-depth details:first-child")).transform).toBe("none");
  expect((await matrix(page,".faq-depth details:first-child p")).transform).toBe("none");
  expect(await page.locator(".faq-depth").evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
  for(const route of ["/contact","/get-a-quote"]){
    await page.goto(route);await page.locator('input[name="name"]').focus();
    for(const selector of ['.form-panel','input[name="name"]','.footer-depth'])expect((await matrix(page,selector)).transform).toBe("none");
  }
  const context=await browser.newContext({javaScriptEnabled:false,viewport:page.viewportSize()!});const staticPage=await context.newPage();
  await staticPage.goto('http://127.0.0.1:3109/faq');await staticPage.locator('.faq-depth summary').first().click();
  await expect(staticPage.locator('.faq-depth details').first()).toHaveAttribute('open','');
  await staticPage.goto('http://127.0.0.1:3109/get-a-quote');await expect(staticPage.locator('form .notice')).toHaveText(notice);
  expect((await matrix(staticPage,'.form-panel')).transform).toBe('none');expect((await matrix(staticPage,'.footer-depth')).transform).toBe('none');
  await context.close();
});
