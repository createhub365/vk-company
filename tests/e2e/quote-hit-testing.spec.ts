import { expect, test, type Page } from "@playwright/test";

const values = {
  name: "TEST ONLY Customer", phone: "+91 9876543210", email: "customer@example.com",
  originCountry: "India", originCity: "Mohali", originPostalCode: "140301",
  destinationCountry: "Canada", destinationCity: "Toronto", destinationPostalCode: "M5V 2T6",
  contentsDescription: "Printed documents", packageCount: "2", approximateWeight: "1.5",
};

async function assertSubmitOnTop(page: Page) {
  const button = page.getByRole("button", { name: "Send quote request", exact: true });
  await button.scrollIntoViewIfNeeded();
  await expect.poll(() => button.evaluate(element => {
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return !!hit && (hit === element || element.contains(hit));
  })).toBe(true);
  // Keep the ordinary actionability checks: no force, dispatchEvent or bypass.
  await button.click();
}

for (const width of [360, 390, 768, 1024, 1440]) {
  test.describe(`Quote submit hit testing at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, deviceScaleFactor: 2, isMobile: width < 768, hasTouch: width < 768 });
    for (const validation of [false, true]) test(`clickable ${validation ? "after repeated validation errors" : "without validation errors"}`, async ({ page }) => {
      const requests: string[] = [];
      const siteHost = new URL(test.info().project.use.baseURL || "http://127.0.0.1").hostname;
      let accepted = false;
      await page.route("**/*", route => {
        const request = route.request();
        if (request.method() === "POST") {
          requests.push(request.url());
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: accepted ? "true" : "false" }) });
        }
        return new URL(request.url()).hostname === siteHost && ["GET", "HEAD"].includes(request.method()) ? route.continue() : route.abort();
      });
      await page.goto("/get-a-quote");
      await expect(page.locator(".form-depth")).toHaveAttribute("data-utility-ready", "");
      for (const [name, value] of Object.entries(values)) await page.locator(`[name="${name}"]`).fill(value);
      if (validation) {
        await page.locator('[name="email"]').fill("invalid");
        await assertSubmitOnTop(page);
        await expect(page.locator("#email-error")).toBeVisible();
        await page.locator('[name="email"]').fill(values.email);
        await page.locator('[name="packageCount"]').fill("0");
        await assertSubmitOnTop(page);
        await expect(page.locator("#packageCount-error")).toBeVisible();
        await page.locator('[name="packageCount"]').fill(values.packageCount);
        expect(requests).toHaveLength(0);
      }
      // Rejected responses retain values and change the form's height too.
      for (let attempt = 0; attempt < 3; attempt++) {
        await assertSubmitOnTop(page);
        await expect(page.getByRole("status")).toContainText("did not accept");
        expect(requests).toHaveLength(attempt + 1);
      }
      accepted = true;
      await assertSubmitOnTop(page);
      await expect(page.getByRole("status")).toContainText("accepted your quote request");
      expect(requests).toEqual(Array(4).fill("https://formsubmit.co/ajax/vkandcompanymohali@gmail.com"));
      await expect(page.locator('[name="name"]')).toHaveValue("");
      expect(await page.locator("form").evaluate(e => getComputedStyle(e).pointerEvents)).toBe("auto");
    });
  });
}
