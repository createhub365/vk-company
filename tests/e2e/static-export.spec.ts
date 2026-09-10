import { expect, test } from "@playwright/test";

const routes = ["/", "/about", "/contact", "/get-a-quote", "/services/domestic", "/services/international", "/track", "/faq", "/privacy", "/terms"];

test("exported URLs refresh, load assets and link only to public destinations", async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
  for (const path of routes) {
    expect((await page.goto(path))?.status()).toBe(200);
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    for (const img of await page.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      expect(await img.getAttribute("src")).not.toContain("/_next/image");
    }
    expect(await page.locator('a[href^="/admin"], a[href^="/api/"], a[href^="/quote/"]').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`${path.replaceAll("/", "-") || "home"}.png`) });
  }
  expect(errors).toEqual([]);
  await page.goto("/track");
  await page.getByRole("link", { name: "Contact the team" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole("heading", { name: "How can we help?" })).toBeVisible();
});

test("retired routes and private paths are real 404s; Pages headers are preserved", async ({ request, page }) => {
  for (const path of ["/admin", "/admin/login", "/admin/enquiries/test", "/api/enquiries", "/api/support", "/api/admin/quotes", "/quote/test-token", "/archive/server-features/manifest.json", "/.env.local", "/supabase/seed.sql", "/missing-page"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(await response.text()).toContain("This page is not available.");
  }
  const response = await request.get("/contact");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  await page.goto("/missing-page");
  await page.getByRole("link", { name: "Return home" }).click();
  await expect(page.getByRole("heading", { name: /Across cities/ })).toBeVisible();
});
