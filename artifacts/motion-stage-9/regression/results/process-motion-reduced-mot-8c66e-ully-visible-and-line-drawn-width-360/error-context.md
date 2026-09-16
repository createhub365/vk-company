# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: process-motion.spec.ts >> reduced motion and JavaScript failure keep every step fully visible and line drawn
- Location: artifacts/motion-stage-9/regression/process-motion.spec.ts:79:1

# Error details

```
Error: locator.evaluateAll: Target page, context or browser has been closed
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | async function ready(page: Page) {
  4  |   await page.goto("/");
  5  |   await expect(page.locator(".process-list > li").first()).toHaveAttribute("style", /translateZ/);
> 6  |   await page.locator(".process-list img").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
     |                                           ^ Error: locator.evaluateAll: Target page, context or browser has been closed
  7  | }
  8  | async function seek(page: Page, progress: number) {
  9  |   await page.locator(".process-depth").evaluate((root, p) => {
  10 |     const list = root.querySelector("ol")!, steps = Array.from(list.children) as HTMLElement[];
  11 |     const rect = root.getBoundingClientRect(), absolute = rect.top + scrollY;
  12 |     const vertical = getComputedStyle(list).gridTemplateColumns.split(" ").length === 1;
  13 |     const first = steps[0], last = steps[3];
  14 |     const firstCenter = first.offsetTop + first.offsetHeight / 2, lastCenter = last.offsetTop + last.offsetHeight / 2;
  15 |     const target = vertical ? absolute + firstCenter + p * (lastCenter - firstCenter) - innerHeight / 2
  16 |       : absolute - innerHeight * .75 + p * (rect.height + innerHeight * .5);
  17 |     window.scrollTo({ top: target, behavior: "instant" });
  18 |   }, progress);
  19 |   await expect.poll(async () => parseFloat(await page.locator(".process-connector .process-line-horizontal").evaluate(p => getComputedStyle(p).strokeDashoffset))).toBeCloseTo(1 - progress, 2);
  20 | }
  21 | async function state(page: Page) {
  22 |   return page.locator(".process-list > li").evaluateAll(steps => steps.map(step => {
  23 |     const css = getComputedStyle(step), matrix = new DOMMatrix(css.transform);
  24 |     return { z: matrix.m43, opacity: Number(css.opacity), glow: Number(getComputedStyle(step.querySelector("span")!, "::before").opacity), willChange: css.willChange };
  25 |   }));
  26 | }
  27 | test.beforeEach(async ({ page }) => {
  28 |   await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
  29 | });
  30 | 
  31 | test("same ordered list, four decoded equal photo frames, horizontal desktop and vertical mobile", async ({ page }) => {
  32 |   const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  33 |   await ready(page); await seek(page, .5);
  34 |   await expect(page.locator(".process-list h3")).toHaveText(["Share shipment details", "Receive a reviewed quote", "Arrange dispatch", "Follow verified updates"]);
  35 |   const geometry = await page.locator(".process-list > li").evaluateAll(steps => steps.map(step => {
  36 |     const item = step as HTMLElement, photo = step.querySelector<HTMLElement>(".process-photo")!, image = photo.querySelector("img")!;
  37 |     return { x: item.offsetLeft, y: item.offsetTop, width: photo.clientWidth, height: photo.clientHeight, decoded: image.complete && image.naturalWidth > 0, fit: getComputedStyle(image).objectFit };
  38 |   }));
  39 |   for (const item of geometry) { expect(item.decoded).toBe(true); expect(item.fit).toBe("cover"); expect(Math.abs(item.width / item.height - 1.5)).toBeLessThan(.02); expect(item.width).toBe(geometry[0].width); }
  40 |   if (page.viewportSize()!.width >= 768) expect(new Set(geometry.map(s => s.y)).size).toBe(1);
  41 |   else { expect(new Set(geometry.map(s => s.x)).size).toBe(1); expect(geometry[3].y).toBeGreaterThan(geometry[0].y); }
  42 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  43 |   expect(errors).toEqual([]);
  44 |   await page.screenshot({ path: `artifacts/motion-stage-9/regression/screenshots/process-${page.viewportSize()!.width}.png`, scale: "css" });
  45 | });
  46 | 
  47 | test("continuous scroll drives exact depth, opacity, number glow and line, reversible without a timer", async ({ page }) => {
  48 |   await ready(page);
  49 |   const mobile = page.viewportSize()!.width < 768, active = mobile ? 30 : 60, inactive = mobile ? -15 : -30;
  50 |   for (const p of [0, 1 / 3, .4, 2 / 3, 1, .4, 0]) {
  51 |     await seek(page, p);
  52 |     const values = await state(page);
  53 |     values.forEach((value, index) => {
  54 |       const weight = Math.max(0, 1 - Math.abs(p * 3 - index));
  55 |       expect(value.z).toBeCloseTo(inactive + (active - inactive) * weight, 0);
  56 |       expect(value.opacity).toBeCloseTo(.55 + .45 * weight, 2);
  57 |       expect(value.glow).toBeCloseTo(weight, 2);
  58 |     });
  59 |   }
  60 |   const resting = await state(page); await page.waitForTimeout(350);
  61 |   const after = await state(page);
  62 |   expect(after.map(({ z, opacity }) => ({ z, opacity }))).toEqual(resting.map(({ z, opacity }) => ({ z, opacity })));
  63 |   expect(after.every(s => s.willChange === "auto")).toBe(true);
  64 |   expect(await page.locator(".process-list").evaluate(e => e.getAnimations({ subtree: true }).filter(a => a.playState === "running").length)).toBe(0);
  65 | });
  66 | 
  67 | test("tall viewport settles on a stable middle blend and survives resize", async ({ page }) => {
  68 |   await page.setViewportSize({ width: 1440, height: 2000 }); await ready(page); await seek(page, .5);
  69 |   const bounds = await page.locator(".process-depth").boundingBox();
  70 |   expect(bounds!.y).toBeGreaterThan(0); expect(bounds!.y + bounds!.height).toBeLessThan(2000);
  71 |   const first = await state(page); await page.waitForTimeout(400); expect(await state(page)).toEqual(first.map(v => ({ ...v, willChange: "auto" })));
  72 |   expect(first[1].z).toBeCloseTo(15, 0); expect(first[2].z).toBeCloseTo(15, 0);
  73 |   await page.screenshot({ path: `artifacts/motion-stage-9/regression/screenshots/tall-${test.info().project.name}.png`, scale: "css" });
  74 |   await page.setViewportSize({ width: 390, height: 900 }); await seek(page, 2 / 3);
  75 |   expect((await state(page))[2].z).toBeCloseTo(30, 0);
  76 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  77 | });
  78 | 
  79 | test("reduced motion and JavaScript failure keep every step fully visible and line drawn", async ({ page, browser }) => {
  80 |   await ready(page); await seek(page, .4); await page.emulateMedia({ reducedMotion: "reduce" });
  81 |   const assertFinal = async (target: Page) => {
  82 |     await expect.poll(async () => (await state(target)).every(s => s.z === 0 && s.opacity === 1 && s.willChange === "auto")).toBe(true);
  83 |     expect(await target.locator(".process-connector .process-line-horizontal").evaluate(p => getComputedStyle(p).strokeDashoffset)).toBe("0px");
  84 |   };
  85 |   await assertFinal(page);
  86 |   await page.mouse.wheel(0, 120); await page.waitForTimeout(100); await assertFinal(page);
  87 |   await page.screenshot({ path: `artifacts/motion-stage-9/regression/screenshots/reduced-${page.viewportSize()!.width}.png`, scale: "css" });
  88 |   const context = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize()! });
  89 |   const staticPage = await context.newPage(); await staticPage.goto("http://127.0.0.1:3109/"); await assertFinal(staticPage);
  90 |   await expect(staticPage.locator(".process-list li")).toHaveCount(4); await context.close();
  91 |   await page.emulateMedia({ reducedMotion: "no-preference" }); await seek(page, 1 / 3);
  92 |   expect((await state(page))[1].opacity).toBeCloseTo(1, 2);
  93 | });
  94 | 
```