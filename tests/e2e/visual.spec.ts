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
    ? [["domestic", "/services/domestic"], ["international", "/services/international"], ["quote", "/get-a-quote"], ["about", "/about"], ["contact", "/contact"], ["faq", "/faq"]]
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


});

test("about what-we-do section matches the approved responsive structure", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser project covers the explicit responsive sizes.");
  const paragraphs = [
    "Customers share their shipment details, receive a reviewed offer, arrange a booking and follow genuine shipment updates. Support requests remain connected to the operational team when questions arise.",
    "We do not publish invented coverage, courier partners, guarantees or rate cards. Service facts are confirmed for the route and shipment details provided.",
    "Shipment updates are maintained manually by the team. The application has a defined boundary for approved courier integrations when partners and credentials are supplied.",
  ];

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    const section = page.locator(".about-what-we-do");
    const images = section.locator("img");
    await expect(images).toHaveCount(4);
    for (const image of await images.all()) {
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      expect(await image.evaluate(element => !!element.closest("[data-image-feedback]"))).toBe(true);
    }
    await expect(section.locator(".about-what-row .prose p")).toHaveText(paragraphs);
    await expect(section.getByText("Connecting People & Possibilities", { exact: true })).toBeVisible();
    await expect(section.getByText("Delivered with Purpose", { exact: true })).toBeVisible();
    for (const label of ["Shipment Details", "Route Review", "Booking Support", "Shipment Updates"]) {
      await expect(section.getByText(label, { exact: true })).toBeVisible();
    }

    const visualBox = (await section.locator(".about-what-visual").boundingBox())!;
    const contentBox = (await section.locator(".about-what-content").boundingBox())!;
    if (viewport.width > 900) expect(visualBox.x + visualBox.width).toBeLessThanOrEqual(contentBox.x);
    else expect(visualBox.y + visualBox.height).toBeLessThanOrEqual(contentBox.y);
    if (viewport.width <= 640) {
      for (const row of await section.locator(".about-what-row").all()) {
        const thumbnailBox = (await row.locator(".about-thumbnail").boundingBox())!;
        const copyBox = (await row.locator(".prose").boundingBox())!;
        expect(thumbnailBox.width).toBeLessThanOrEqual(277);
        expect(thumbnailBox.y + thumbnailBox.height).toBeLessThanOrEqual(copyBox.y);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await section.screenshot({ path: `test-results/about-what-we-do-${viewport.width}.png`, caret: "initial" });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.addStyleTag({ content: "html{font-size:200% !important}" });
  const aboutSection = page.locator(".about-what-we-do");
  const overflowing = await aboutSection.evaluate(element => {
    const boundary = element.getBoundingClientRect();
    return Array.from(element.querySelectorAll("*")).flatMap(child => {
      const rect = child.getBoundingClientRect();
      return rect.right > boundary.right + 1 || rect.left < boundary.left - 1
        ? [{ tag: child.tagName, className: child.className, left: rect.left, right: rect.right, boundaryRight: boundary.right }]
        : [];
    });
  });
  expect(overflowing).toEqual([]);
});
