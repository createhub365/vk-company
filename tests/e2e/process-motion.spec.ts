import { expect, test, type Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator(".process-list > li").first()).toHaveAttribute("style", /translateZ/);
  // Below-fold photos are deliberately lazy. Decode after each enters view;
  // awaiting offscreen decode on mobile would deadlock the test itself.
  for (const image of await page.locator(".process-list img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element: HTMLImageElement) => element.decode());
  }
}
async function seek(page: Page, progress: number) {
  await page.locator(".process-depth").evaluate((root, p) => {
    const list = root.querySelector("ol")!, steps = Array.from(list.children) as HTMLElement[];
    const rect = root.getBoundingClientRect(), absolute = rect.top + scrollY;
    const vertical = getComputedStyle(list).gridTemplateColumns.split(" ").length === 1;
    const first = steps[0], last = steps[3];
    const firstCenter = first.offsetTop + first.offsetHeight / 2, lastCenter = last.offsetTop + last.offsetHeight / 2;
    const target = vertical ? absolute + firstCenter + p * (lastCenter - firstCenter) - innerHeight / 2
      : absolute - innerHeight * .75 + p * (rect.height + innerHeight * .5);
    window.scrollTo({ top: target, behavior: "instant" });
  }, progress);
  await expect.poll(async () => parseFloat(await page.locator(".process-connector .process-line-horizontal").evaluate(p => getComputedStyle(p).strokeDashoffset))).toBeCloseTo(1 - progress, 2);
}
async function state(page: Page) {
  return page.locator(".process-list > li").evaluateAll(steps => steps.map(step => {
    const css = getComputedStyle(step), matrix = new DOMMatrix(css.transform);
    return { z: matrix.m43, opacity: Number(css.opacity), glow: Number(getComputedStyle(step.querySelector("span")!, "::before").opacity), willChange: css.willChange };
  }));
}
test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
});

test("same ordered list, four decoded equal photo frames, horizontal desktop and vertical mobile", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await ready(page); await seek(page, .5);
  await expect(page.locator(".process-list h3")).toHaveText(["Share shipment details", "Receive a reviewed quote", "Arrange dispatch", "Follow verified updates"]);
  const geometry = await page.locator(".process-list > li").evaluateAll(steps => steps.map(step => {
    const item = step as HTMLElement, photo = step.querySelector<HTMLElement>(".process-photo")!, image = photo.querySelector("img")!;
    return { x: item.offsetLeft, y: item.offsetTop, width: photo.clientWidth, height: photo.clientHeight, decoded: image.complete && image.naturalWidth > 0, fit: getComputedStyle(image).objectFit };
  }));
  for (const item of geometry) { expect(item.decoded).toBe(true); expect(item.fit).toBe("cover"); expect(Math.abs(item.width / item.height - 1.5)).toBeLessThan(.02); expect(item.width).toBe(geometry[0].width); }
  if (page.viewportSize()!.width >= 768) expect(new Set(geometry.map(s => s.y)).size).toBe(1);
  else { expect(new Set(geometry.map(s => s.x)).size).toBe(1); expect(geometry[3].y).toBeGreaterThan(geometry[0].y); }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `artifacts/submit-tilt-staging/screenshots/stage-6/process-${page.viewportSize()!.width}.png`, scale: "css" });
});

test("continuous scroll drives exact depth, opacity, number glow and line, reversible without a timer", async ({ page }) => {
  await ready(page);
  const mobile = page.viewportSize()!.width < 768, active = mobile ? 30 : 60, inactive = mobile ? -15 : -30;
  for (const p of [0, 1 / 3, .4, 2 / 3, 1, .4, 0]) {
    await seek(page, p);
    const values = await state(page);
    values.forEach((value, index) => {
      const weight = Math.max(0, 1 - Math.abs(p * 3 - index));
      expect(value.z).toBeCloseTo(inactive + (active - inactive) * weight, 0);
      expect(value.opacity).toBeCloseTo(.55 + .45 * weight, 2);
      expect(value.glow).toBeCloseTo(weight, 2);
    });
  }
  const resting = await state(page); await page.waitForTimeout(350);
  const after = await state(page);
  expect(after.map(({ z, opacity }) => ({ z, opacity }))).toEqual(resting.map(({ z, opacity }) => ({ z, opacity })));
  expect(after.every(s => s.willChange === "auto")).toBe(true);
  expect(await page.locator(".process-list").evaluate(e => e.getAnimations({ subtree: true }).filter(a => a.playState === "running").length)).toBe(0);
});

test("tall viewport settles on a stable middle blend and survives resize", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 2000 }); await ready(page); await seek(page, .5);
  const bounds = await page.locator(".process-depth").boundingBox();
  expect(bounds!.y).toBeGreaterThan(0); expect(bounds!.y + bounds!.height).toBeLessThan(2000);
  const first = await state(page); await page.waitForTimeout(400); expect(await state(page)).toEqual(first.map(v => ({ ...v, willChange: "auto" })));
  expect(first[1].z).toBeCloseTo(15, 0); expect(first[2].z).toBeCloseTo(15, 0);
  await page.screenshot({ path: `artifacts/submit-tilt-staging/screenshots/stage-6/tall-${test.info().project.name}.png`, scale: "css" });
  await page.setViewportSize({ width: 390, height: 900 }); await seek(page, 2 / 3);
  expect((await state(page))[2].z).toBeCloseTo(30, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("reduced motion and JavaScript failure keep every step fully visible and line drawn", async ({ page, browser }) => {
  await ready(page); await seek(page, .4); await page.emulateMedia({ reducedMotion: "reduce" });
  const assertFinal = async (target: Page) => {
    await expect.poll(async () => (await state(target)).every(s => s.z === 0 && s.opacity === 1 && s.willChange === "auto")).toBe(true);
    expect(await target.locator(".process-connector .process-line-horizontal").evaluate(p => getComputedStyle(p).strokeDashoffset)).toBe("0px");
  };
  await assertFinal(page);
  await page.mouse.wheel(0, 120); await page.waitForTimeout(100); await assertFinal(page);
  await page.screenshot({ path: `artifacts/submit-tilt-staging/screenshots/stage-6/reduced-${page.viewportSize()!.width}.png`, scale: "css" });
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize()! });
  const staticPage = await context.newPage(); await staticPage.goto(new URL("/", page.url()).href); await assertFinal(staticPage);
  await expect(staticPage.locator(".process-list li")).toHaveCount(4); await context.close();
  await page.emulateMedia({ reducedMotion: "no-preference" }); await seek(page, 1 / 3);
  expect((await state(page))[1].opacity).toBeCloseTo(1, 2);
});
