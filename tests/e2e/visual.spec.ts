import { expect, test } from "@playwright/test";

test("capture the responsive editorial site with its static delivery visual", async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const widths = testInfo.project.name === "desktop" ? [1440, 1366, 1024, 768] : [390, 360];

  for (const [index, width] of widths.entries()) {
    const height = width === 360 ? 800 : width === 390 ? 844 : width === 768 ? 1024 : width === 1366 ? 768 : 900;
    await page.setViewportSize({ width, height });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Across cities/i })).toBeVisible();

    const truckImage = page.getByRole("img", { name: /courier truck travelling/i });
    await expect(truckImage).toBeVisible();
    await expect(truckImage).toHaveJSProperty("complete", true);
    expect(await truckImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await truckImage.evaluate((image: HTMLImageElement) => image.decode());
    expect(await page.locator("canvas, video, .delivery-truck, .delivery-parcel").count()).toBe(0);

    if (index === 0) {
      await page.screenshot({ path: `test-results/delivery-static-${testInfo.project.name}.png`, fullPage: false, caret: "initial" });
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: `test-results/home-${testInfo.project.name}-${width}.png`, fullPage: true, caret: "initial" });
  }

  await page.setViewportSize(testInfo.project.name === "desktop" ? { width: 1440, height: 900 } : { width: 390, height: 844 });
  const routeShots = testInfo.project.name === "desktop"
    ? [["domestic", "/services/domestic"], ["international", "/services/international"], ["quote", "/get-a-quote"], ["tracking", "/track"], ["about", "/about"], ["contact", "/contact"], ["faq", "/faq"]]
    : [["quote", "/get-a-quote"], ["faq", "/faq"]];
  for (const [slug, route] of routeShots) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator("canvas").count()).toBe(0);
    await page.screenshot({ path: `test-results/${slug}-${testInfo.project.name}.png`, fullPage: false, caret: "initial" });
  }

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const domesticFeature = page.locator("#domestic-services");
  await domesticFeature.scrollIntoViewIfNeeded();
  await expect(domesticFeature.getByRole("img", { name: "Illustrative unbranded delivery truck travelling on a modern intercity road" })).toBeVisible();
  await page.screenshot({ path: `test-results/domestic-feature-${testInfo.project.name}.png`, fullPage: false, caret: "initial" });

  await page.goto("/admin/login", { waitUntil: "domcontentloaded", timeout: 20_000 });
  await expect(page.getByText(/Authentication is not configured/i)).toBeVisible();
  expect(await page.locator("canvas").count()).toBe(0);
  await page.screenshot({ path: `test-results/admin-login-${testInfo.project.name}.png`, fullPage: false, caret: "initial" });
});
