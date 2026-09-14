import { expect, test } from "@playwright/test";

test("homepage keeps its hero content with a static truck image", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Across cities/i })).toBeVisible();
  await expect(page.getByText("We keep your parcels moving.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Get a quote/i }).first()).toBeVisible();
  const truckImage = page.getByRole("img", { name: /courier truck at an Indian/i });
  await expect(truckImage).toBeVisible();
  await expect(truckImage).toHaveJSProperty("complete", true);
  expect(await truckImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: /Replay delivery animation/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Pause delivery animation/i })).toHaveCount(0);
  expect(await page.locator("canvas, video, .delivery-truck, .delivery-parcel").count()).toBe(0);
});

test("quote form explains that enquiries do not confirm bookings", async ({ page }) => {
  await page.goto("/get-a-quote");
  await expect(page.getByRole("heading", { name: /Tell us about your shipment/i })).toBeVisible();
  await expect(page.getByText(/does not confirm a quote/i)).toBeVisible();
});

test("mobile navigation is keyboard and touch accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("nav").getByRole("link", { name: "Domestic", exact: true })).toBeVisible();
});

test("all public routes preserve direct navigation without duplicate renderers", async ({ page }) => {
  for (const route of ["/services/domestic", "/services/international", "/get-a-quote", "/about", "/contact", "/faq", "/privacy", "/terms"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    if (route === "/get-a-quote") expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1);
    else expect(await page.locator("canvas").count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("history, resize and repeated route changes preserve one static hero visual", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cinematic-hero-background")).toHaveCount(1);
  await page.goto("/services/domestic");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/services\/domestic/);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.goto("/contact");
  await page.goto("/");
  await expect(page.locator(".cinematic-hero-background")).toHaveCount(1);
  await expect(page.getByRole("img", { name: /courier truck at an Indian/i })).toBeVisible();
  expect(await page.locator("canvas").count()).toBe(0);
});

test("increased text size keeps key actions available", async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({ content: "html{font-size:125% !important}" });
  await expect(page.getByRole("link", { name: /Get a quote/i }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("quote fields keep their values through resize and menu changes", async ({ page }) => {
  await page.goto("/get-a-quote");
  const dimensions = page.getByLabel(/Dimensions \(when known\)/);
  await dimensions.fill("120 × 40 × 25");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  await expect(dimensions).toHaveValue("120 × 40 × 25");
});

test("tracking offers company contact without a lookup", async ({ page }) => {
  await page.goto("/track");
  await expect(page.getByRole("heading", { name: "Shipment update enquiry" })).toBeVisible();
  await expect(page.locator('a[href="tel:+919317724056"]')).toBeVisible();
  await expect(page.getByText(/Online shipment lookup is unavailable/)).toBeVisible();
  await expect(page.locator("form")).toHaveCount(0);
  expect((await page.request.get("/api/track?code=VKC-TEST")).status()).toBe(404);
});

test("all four shipping steps show equally sized, eagerly loaded photographs", async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const images = page.locator(".process-list .process-photo img");
    await expect(images).toHaveCount(4);
    for (const image of await images.all()) {
      await expect(image).toHaveAttribute("loading", "eager");
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    const sizes = await images.evaluateAll(images => images.map(image => ({ width: image.clientWidth, height: image.clientHeight })));
    for (const size of sizes) {
      expect(size).toEqual(sizes[0]);
      expect(Math.abs(size.width / size.height - 1.5)).toBeLessThan(.01);
    }
  }
});
