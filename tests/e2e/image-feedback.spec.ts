import { expect, test, type Locator, type Page } from "@playwright/test";

const routes = ["/", "/services/domestic", "/services/international", "/about", "/contact", "/get-a-quote", "/track", "/faq", "/privacy", "/terms", "/admin/login"];
const countAnimations = (locator: Locator) => locator.evaluate(element => element.getAnimations({ subtree: true }).length);

async function activate(page: Page, locator: Locator, touch: boolean) {
  await locator.scrollIntoViewIfNeeded();
  if (touch) await locator.tap({ position: { x: 20, y: 25 } });
  else await locator.click({ position: { x: 20, y: 25 } });
}

// Only local GETs: this suite cannot submit enquiries, call, or contact providers.
test.beforeEach(async ({ context }) => {
  await context.route("**/*", route => {
    const request = route.request();
    const url = new URL(request.url());
    return ["localhost", "127.0.0.1"].includes(url.hostname) && request.method() === "GET"
      ? route.continue() : route.abort();
  });
});

for (const path of routes) {
  test(`image coverage ${path}`, async ({ page, isMobile }, info) => {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    // Let hydration attach the shared delegated listeners before interaction.
    await page.waitForFunction(() => document.querySelectorAll("img").length > 0);
    const images = page.locator("img");
    expect(await images.count()).toBeGreaterThan(0);
    for (const img of await images.all()) {
      expect(await img.evaluate(element => !!element.closest("[data-image-feedback]"))).toBe(true);
    }
    const surface = page.locator('[data-image-feedback="photo"]').first();
    const target = await surface.count() ? surface : page.locator('[data-image-feedback="logo"]').last();
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await target.hover();
    expect(await countAnimations(target)).toBe(0);
    const bounds = await target.boundingBox();
    const text = page.locator("h1");
    const textBounds = await text.boundingBox();
    await activate(page, target, isMobile);
    await expect.poll(() => countAnimations(target)).toBeGreaterThan(0);
    const duration = await target.evaluate(element => element.getAnimations({ subtree: true })[0].effect?.getTiming().duration);
    expect(duration).toBe(450);
    if (await surface.count()) {
      await page.waitForTimeout(90);
      expect(await surface.locator("img").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(1);
      expect(await target.boundingBox()).toEqual(bounds);
      expect(await text.boundingBox()).toEqual(textBounds);
      const origin = await surface.evaluate(element => {
        const ripple = element.querySelector<HTMLElement>(".image-feedback-ripple")!;
        return [parseFloat(ripple.style.left) + parseFloat(ripple.style.width) / 2, parseFloat(ripple.style.top) + parseFloat(ripple.style.height) / 2];
      });
      expect(Math.abs(origin[0] - 20)).toBeLessThan(1.5);
      expect(Math.abs(origin[1] - 25)).toBeLessThan(1.5);
    }
    // Freeze an already-running effect for a reliable mid-animation visual artifact.
    await target.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 200; }));
    await page.screenshot({ path: info.outputPath("image-feedback-active.png") });
    await target.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.play()));
    await expect.poll(() => countAnimations(target)).toBe(0);
    await expect(page.locator(".image-feedback-layer")).toHaveCount(0);
    for (let index = 0; index < 5; index++) await activate(page, target, isMobile);
    expect(await target.locator(".image-feedback-layer").count()).toBeLessThanOrEqual(1);
    expect(await countAnimations(target)).toBeLessThanOrEqual(2);
    await expect.poll(() => countAnimations(target)).toBe(0);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await activate(page, target, isMobile);
    await expect.poll(() => countAnimations(target)).toBe(1);
    await expect(page.locator(".image-feedback-layer")).toHaveCount(0);
    expect(await target.evaluate(element => getComputedStyle(element.querySelector("img") ?? element).transform)).toBe("none");
    expect(await target.boundingBox()).toEqual(bounds);
    await expect.poll(() => countAnimations(target)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("homepage international aircraft keeps its full aspect ratio during ripple feedback", async ({ page, isMobile }, info) => {
  await page.goto("/");
  const section = page.locator(".international-feature");
  const surface = section.locator(".international-aircraft");
  const image = surface.locator("img");
  await surface.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(img => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(image).toHaveAttribute("src", /homepage-international-cargo/);
  await expect(section.locator("h2")).toHaveText("Clear before it leaves the ground.");
  const frame = await surface.boundingBox();
  const photo = await image.boundingBox();
  const copy = await section.locator(".editorial-copy").boundingBox();
  expect(frame).not.toBeNull();
  expect(photo).toEqual(frame);
  expect(Math.abs(frame!.width / frame!.height - 1.5)).toBeLessThan(.005);
  expect(await image.evaluate(img => getComputedStyle(img).objectFit)).toBe("contain");
  if (isMobile) expect(frame!.y + frame!.height).toBeLessThan(copy!.y);
  else expect(copy!.x + copy!.width).toBeLessThan(frame!.x);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await section.screenshot({ path: info.outputPath("aircraft-rest.png") });

  await activate(page, surface, isMobile);
  await expect.poll(() => countAnimations(surface)).toBe(1);
  expect(await countAnimations(image)).toBe(0);
  // Inspect a real pointer-triggered animation at its midpoint, not just after cleanup.
  await surface.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => {
    animation.pause(); animation.currentTime = 200;
  }));
  expect(await image.evaluate(img => getComputedStyle(img).transform)).toBe("none");
  expect(await image.boundingBox()).toEqual(await surface.boundingBox());
  await section.screenshot({ path: info.outputPath("aircraft-ripple.png") });
  await surface.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.play()));
  await expect.poll(() => countAnimations(surface)).toBe(0);
  await expect(surface.locator(".image-feedback-layer")).toHaveCount(0);

  for (let i = 0; i < 4; i++) await activate(page, surface, isMobile);
  expect(await surface.locator(".image-feedback-layer").count()).toBeLessThanOrEqual(1);
  expect(await countAnimations(image)).toBe(0);
  await expect.poll(() => countAnimations(surface)).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await activate(page, surface, isMobile);
  await expect.poll(() => countAnimations(surface)).toBe(1);
  await expect(surface.locator(".image-feedback-layer")).toHaveCount(0);
  expect(await image.evaluate(img => getComputedStyle(img).transform)).toBe("none");
  await expect.poll(() => countAnimations(surface)).toBe(0);

  const link = section.getByRole("link", { name: "Explore international services" });
  await expect(link).toHaveAttribute("href", "/services/international");
  await link.click();
  await expect(page).toHaveURL(/\/services\/international$/);
  await expect(page.locator("h1")).toBeVisible();
  // The separate service-page photograph is deliberately unchanged.
  await expect(page.locator('.page-hero img')).toHaveAttribute("src", /international-cargo-apron/);
});

test("home pulse-enabled photos animate; hero keeps background, contrast overlay and foreground still", async ({ page, isMobile }, info) => {
  await page.goto("/");
  for (const photo of await page.locator('[data-image-feedback="photo"]').all()) {
    await activate(page, photo, isMobile);
    await expect.poll(() => countAnimations(photo)).toBe(2);
    await expect.poll(() => countAnimations(photo)).toBe(0);
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  const hero = page.locator(".cinematic-hero");
  const background = hero.locator("img");
  const original = await background.boundingBox();
  const overlay = await hero.evaluate(element => getComputedStyle(element, "::before").backgroundImage);
  // Exposed background at the right edge; never a foreground link or text.
  const box = (await hero.boundingBox())!;
  const position = { x: box.width - 4, y: 250 };
  if (isMobile) await hero.tap({ position }); else await hero.click({ position });
  await expect(hero.locator(".image-feedback-layer")).toHaveCount(1);
  expect(await countAnimations(background)).toBe(0);
  expect(await background.boundingBox()).toEqual(original);
  expect(await hero.evaluate(element => getComputedStyle(element, "::before").backgroundImage)).toBe(overlay);
  await hero.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 200; }));
  await page.screenshot({ path: info.outputPath("hero-ripple-active.png") });
  await hero.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.play()));
  await expect(hero.locator(".image-feedback-layer")).toHaveCount(0);
  await page.locator("h1").click();
  await expect(hero.locator(".image-feedback-layer")).toHaveCount(0);
  await hero.getByRole("link", { name: "Track shipment" }).click();
  await expect(page).toHaveURL(/\/track$/);
  await expect(page.locator(".image-feedback-layer")).toHaveCount(0);
});

test("logo pointer and keyboard navigation stays native and accessible", async ({ page, isMobile }) => {
  await page.goto("/about");
  const link = page.getByRole("link", { name: "VK AND COMPANY home", exact: true });
  const logo = link.locator('[data-image-feedback="logo"]');
  await activate(page, logo, isMobile);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/contact");
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(link).toHaveAccessibleName("VK AND COMPANY home");
  await expect(page.locator('[data-image-feedback][tabindex], [data-image-feedback][role="button"], a a, button button')).toHaveCount(0);
  // Same-route keyboard activation visibly highlights the logo without scaling it.
  await link.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => countAnimations(logo)).toBe(1);
  expect(await logo.evaluate(element => getComputedStyle(element).transform)).toBe("none");
});

test("drag, selected text, cancelled touch and scrolling do not activate feedback", async ({ page, isMobile }) => {
  await page.goto("/");
  const photo = page.locator('[data-image-feedback="photo"]').first();
  await photo.scrollIntoViewIfNeeded();
  const box = (await photo.boundingBox())!;
  if (isMobile) {
    const cdp = await page.context().newCDPSession(page);
    const x = box.x + 100, y = box.y + 160;
    const before = await page.evaluate(() => scrollY);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let distance = 20; distance <= 120; distance += 20) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - distance }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(before);
    await expect(photo.locator(".image-feedback-layer")).toHaveCount(0);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: 200 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(box.x + 20, box.y + 30);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + 80, { steps: 8 });
    await page.mouse.up();
  }
  await expect(photo.locator(".image-feedback-layer")).toHaveCount(0);
  await photo.locator("span").evaluate(element => {
    const range = document.createRange(); range.selectNodeContents(element);
    getSelection()?.removeAllRanges(); getSelection()?.addRange(range);
  });
  // A click during selection must not start an effect, even on an image caption.
  await photo.locator("span").dispatchEvent("pointerdown", { isPrimary: true, button: 0, pointerId: 1, clientX: 10, clientY: 10 });
  await photo.locator("span").dispatchEvent("click", { detail: 1, clientX: 10, clientY: 10 });
  await expect(photo.locator(".image-feedback-layer")).toHaveCount(0);
  await page.evaluate(() => getSelection()?.removeAllRanges());
  await activate(page, photo, isMobile);
  await expect(photo.locator(".image-feedback-layer")).toHaveCount(1);
  // Simulates conditional component unmount and checks detached animations cancelled.
  const image = await photo.locator("img").elementHandle();
  await photo.evaluate(element => element.remove());
  await expect.poll(() => image!.evaluate(element => element.getAnimations().length)).toBe(0);
});

test("login background ripples without moving; unavailable routes stay gated", async ({ page, isMobile }) => {
  await page.goto("/admin/login");
  const backdrop = page.locator(".login-backdrop");
  const bounds = await backdrop.boundingBox();
  if (isMobile) await backdrop.tap({ position: { x: 4, y: 100 } });
  else await backdrop.click({ position: { x: 4, y: 100 } });
  await expect(backdrop.locator(".image-feedback-layer")).toHaveCount(1);
  expect(await backdrop.boundingBox()).toEqual(bounds);
  expect(await countAnimations(backdrop.locator("img"))).toBe(0);
  for (const path of ["/admin", "/admin/content", "/admin/enquiries", "/admin/enquiries/test", "/admin/quotes", "/admin/bookings", "/admin/shipments", "/admin/support", "/admin/support/test", "/admin/settings", "/admin/audit"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
  await page.goto(`/quote/${"image-feedback-test-".repeat(3)}`);
  await expect(page.getByText("Quote review is not configured.")).toBeVisible();
  await activate(page, page.locator('.footer-logo [data-image-feedback="logo"]'), isMobile);
  await expect.poll(() => countAnimations(page.locator('.footer-logo [data-image-feedback="logo"]'))).toBe(1);
  await page.goto("/image-feedback-missing-page");
  await expect(page.getByRole("heading", { name: "This page is not available." })).toBeVisible();
});
