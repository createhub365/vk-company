import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.route("**/*", route => {
    const request = route.request();
    return ["localhost", "127.0.0.1"].includes(new URL(request.url()).hostname) && request.method() === "GET"
      ? route.continue() : route.abort();
  });
});

for (const width of [1440, 390, 360]) {
  for (const kind of ["domestic", "international"] as const) {
    test(`${kind} supplied design at ${width}px`, async ({ page, isMobile }, info) => {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await page.goto(`/services/${kind}`);
      const section = page.locator(`section[aria-labelledby="${kind}-process"]`);
      const rows = section.locator("article");
      await expect(rows).toHaveCount(3);
      await expect(rows.locator("h3")).toHaveText(kind === "domestic" ? ["Begin with the real shipment details.", "Review before commitment.", "We move it with care."] : ["Route and contents review.", "Documentation is shipment-specific.", "Clear quotation boundaries."]);
      for (const row of await rows.all()) {
        const frame = row.locator("[data-image-feedback]");
        const img = frame.locator("img");
        await frame.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth === 1554)).toBe(true);
        const bounds = (await frame.boundingBox())!;
        const text = (await row.locator("h3").boundingBox())!;
        if (width < 641) expect(bounds.y + bounds.height).toBeLessThanOrEqual(text.y);
        else expect(bounds.x + bounds.width).toBeLessThanOrEqual(text.x);
        if (isMobile) await frame.tap({ position: { x: 40, y: 40 } });
        else await frame.click({ position: { x: 40, y: 40 } });
        await expect.poll(() => frame.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(1);
        await frame.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 200; }));
        expect(await img.evaluate(element => getComputedStyle(element).transform)).toBe("none");
        expect(await frame.boundingBox()).toEqual(bounds);
        expect(await row.locator("h3").boundingBox()).toEqual(text);
        await frame.screenshot({ path: info.outputPath(`row-${await row.locator("h3").textContent()}-active.png`) });
        await frame.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.play()));
        await expect(frame.locator(".image-feedback-layer")).toHaveCount(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      // Omit the fixed header only from the tall section artifact, where it
      // otherwise appears midway through the stitched capture.
      await section.screenshot({ path: `test-results/${kind}-approved-${width}-${info.project.name}.png`, style: "header, nextjs-portal { visibility: hidden; }" });
      const quoteLink = page.getByRole("main").getByRole("link", { name: "Request a quote", exact: true });
      await expect(quoteLink).toHaveAttribute("href", "/get-a-quote");
      await quoteLink.click();
      await expect(page).toHaveURL(/\/get-a-quote$/);
    });
  }

  test(`Contact supplied design at ${width}px`, async ({ page, isMobile }, info) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto("/contact");
    const frame = page.locator('main [data-image-feedback="background"]');
    const img = frame.locator("img");
    await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth === 1536)).toBe(true);
    await expect(page.locator("h1")).toHaveText("How can we help?");
    await expect(page.getByRole("list", { name: "Enquiry topics" }).locator("li")).toHaveCount(4);
    const details = page.getByRole("complementary", { name: "Company contact details" });
    await expect(details.locator('a[href="mailto:vkandcompanymohali@gmail.com"]')).toBeVisible();
    await expect(details.locator('a[href="tel:+919317724056"]')).toBeVisible();
    await expect(page.getByLabel("Subject", { exact: true })).toHaveValue("General Enquiry");
    await expect(page.getByLabel("Subject", { exact: true }).locator("option")).toHaveCount(4);
    await expect(page.locator('input[name="shipmentReference"]')).toHaveCount(0);
    for (const label of ["Name", "Email", "Phone", "Message"]) await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    const frameBounds = (await frame.boundingBox())!;
    const formBounds = (await page.locator("form").boundingBox())!;
    if (width === 1440) expect(frameBounds.x + frameBounds.width).toBeLessThanOrEqual(formBounds.x);
    else expect(frameBounds.y + frameBounds.height).toBeLessThanOrEqual(formBounds.y);
    await frame.scrollIntoViewIfNeeded();
    if (isMobile) await frame.tap({ position: { x: 80, y: 80 } });
    else await frame.click({ position: { x: 80, y: 80 } });
    await expect.poll(() => frame.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(1);
    await frame.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 200; }));
    await frame.screenshot({ path: info.outputPath("contact-artwork-active.png") });
    await frame.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.play()));
    await expect(frame.locator(".image-feedback-layer")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("main > section").screenshot({ path: `test-results/contact-approved-${width}-${info.project.name}.png` });
  });
}
