import { expect, test, type Locator } from "@playwright/test";

const angles = (photo: Locator) => photo.evaluate(e => {
  const value = e.style.transform;
  return [Number(value.match(/rotateX\(([-\d.]+)deg\)/)?.[1] || 0), Number(value.match(/rotateY\(([-\d.]+)deg\)/)?.[1] || 0)];
});
test.beforeEach(async ({ page }) => {
  const siteHost = new URL(test.info().project.use.baseURL || "http://127.0.0.1").hostname;
  await page.route("**/*", route => new URL(route.request().url()).hostname === siteHost && ["GET", "HEAD"].includes(route.request().method()) ? route.continue() : route.abort());
});

for (const width of [768, 1024, 1440]) test.describe(`service tilt ${width}px`, () => {
  test.use({ viewport: { width, height: 900 }, deviceScaleFactor: 2, hasTouch: false, isMobile: false });
  for (const kind of ["domestic", "international"]) test(`${kind}: all three images spring within bounds and leave controls clickable`, async ({ page }, info) => {
    await page.goto(`/services/${kind}`);
    await page.waitForTimeout(500);
    const photos = page.locator("[data-service-tilt]");
    await expect(photos).toHaveCount(3);
    for (let index = 0; index < 3; index++) {
      const photo = photos.nth(index), boundary = page.locator("[data-service-tilt-boundary]").nth(index);
      await boundary.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
      await page.locator("main article").nth(index).evaluate(e => Promise.allSettled(e.getAnimations({ subtree: true }).map(animation => animation.finished)));
      const box = (await boundary.boundingBox())!;
      const prose = await page.locator("main article").nth(index).locator("h3,p").evaluateAll(es => es.map(e => e.getBoundingClientRect().toJSON()));
      await page.mouse.move(box.x + box.width * .85, box.y + box.height * .2);
      await expect.poll(async () => (await angles(photo))[1]).toBeGreaterThan(1);
      const samples: number[][] = [];
      for (let frame = 0; frame < 8; frame++) { samples.push(await angles(photo)); await page.waitForTimeout(70); }
      expect(samples.flat().every(angle => Math.abs(angle) <= 10)).toBe(true);
      for (let frame = 1; frame < samples.length; frame++) expect(samples[frame][1]).toBeGreaterThanOrEqual(samples[frame - 1][1] - .01);
      await expect.poll(async () => (await angles(photo))[1]).toBeCloseTo(7, 0);
      await expect.poll(() => photo.evaluate(e => getComputedStyle(e).willChange)).toBe("auto");
      expect(await page.locator("main article").nth(index).locator("h3,p").evaluateAll(es => es.map(e => e.getBoundingClientRect().toJSON()))).toEqual(prose);
      if (index === 0) await page.screenshot({ path: info.outputPath(`${kind}-${width}-tilted.png`), scale: "css" });

      // Test-only adjacent controls at the media edge, with no elevated z-index.
      // Their native pointer/keyboard behavior must beat the tilted face.
      await boundary.evaluate(e => {
        for (const tag of ["a", "button"]) {
          const control = document.createElement(tag);
          control.textContent = "Test adjacent control";
          control.dataset.tiltTestControl = tag;
          if (control instanceof HTMLAnchorElement) control.href = "#tilt-test-target";
          else control.addEventListener("click", () => control.dataset.clicked = "true");
          Object.assign(control.style, { position: "absolute", left: "calc(100% + 2px)", top: tag === "a" ? "30%" : "60%", width: "20px", height: "20px", overflow: "hidden" });
          // Outside the clipping boundary but adjacent to it in the media column.
          e.parentElement!.append(control);
        }
      });
      for (const tag of ["a", "button"]) {
        const control = page.locator(`[data-tilt-test-control="${tag}"]`);
        expect(await control.evaluate(e => { const b = e.getBoundingClientRect(); return e.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)); })).toBe(true);
        await control.click();
        if (tag === "button") await expect(control).toHaveAttribute("data-clicked", "true");
        else await expect(page).toHaveURL(/#tilt-test-target$/);
      }
      await page.locator("[data-tilt-test-control]").evaluateAll(es => es.forEach(e => e.remove()));
      await page.mouse.move(1, 1);
      await expect.poll(() => photo.evaluate(e => e.style.transform)).toBe("");
      await expect.poll(() => photo.evaluate(e => getComputedStyle(e).willChange)).toBe("auto");
    }
    // Existing native CTA and navigation also work after the last image interaction.
    const quote = page.locator('main a[href="/get-a-quote"]').last();
    await quote.click(); await expect(page).toHaveURL(/\/get-a-quote$/);
    expect(await page.evaluate(() => document.documentElement.dataset.depthScroll || "native")).toBe("native");
    await page.locator('header a[href="/contact"]').evaluate((e: HTMLAnchorElement) => e.focus());
    if (await page.getByRole("button", { name: "Open menu" }).isVisible()) await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator('header a[href="/contact"]').click(); await expect(page).toHaveURL(/\/contact$/);
  });
});

for (const settings of [{ width: 360, touch: false, reduced: false }, { width: 390, touch: true, reduced: false }, { width: 1024, touch: true, reduced: false }, { width: 1440, touch: false, reduced: true }]) {
  test.describe(`tilt disabled ${JSON.stringify(settings)}`, () => {
    test.use({ viewport: { width: settings.width, height: 900 }, hasTouch: settings.touch, isMobile: settings.touch, reducedMotion: settings.reduced ? "reduce" : "no-preference" });
    test("all six service photos stay flat", async ({ page }) => {
      for (const kind of ["domestic", "international"]) {
        await page.goto(`/services/${kind}`);
        for (const photo of await page.locator("[data-service-tilt]").all()) {
          await photo.scrollIntoViewIfNeeded(); await photo.hover({ position: { x: 30, y: 30 } }); await page.waitForTimeout(300);
          expect(await photo.evaluate(e => getComputedStyle(e).transform)).toBe("none");
          expect(await photo.evaluate(e => getComputedStyle(e).willChange)).toBe("auto");
        }
      }
    });
  });
}
