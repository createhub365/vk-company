import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const links = [
  { text: "Domestic", href: "/services/domestic" },
  { text: "International", href: "/services/international" },
  { text: "About", href: "/about" },
  { text: "Contact", href: "/contact" },
  { text: "Get a quote", href: "/get-a-quote" },
];
// Saved pre-fix export includes the approved caption removal and Stage 6 layout.
const before = JSON.parse(readFileSync("artifacts/submit-tilt-staging/before-layout.json", "utf8"));

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
});
async function focusIsVisible(page: Page) {
  const result = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement, style = getComputedStyle(el), box = el.getBoundingClientRect();
    return { outline: style.outlineStyle, width: parseFloat(style.outlineWidth), keyboard: el.matches(":focus-visible"), z: Number(style.zIndex),
      visible: box.width > 0 && box.height > 0 && box.top >= 0 && box.bottom <= innerHeight,
      topmost: el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)) };
  });
  expect(result).toMatchObject({ outline: "solid", keyboard: true, visible: true, topmost: true });
  expect(result.width).toBeGreaterThanOrEqual(2);
  expect(result.z).toBeGreaterThanOrEqual(100);
}
async function keyboardOpen(page: Page) {
  if (!(await page.getByRole("button", { name: "Open menu" }).isVisible())) await page.setViewportSize({ width: 390, height: 900 });
  await page.locator("header .brand").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await focusIsVisible(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-navigation a").first()).toBeFocused();
}

test("frozen navigation and existing page geometry survive depth projection", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  await page.waitForTimeout(1400);
  expect(await page.locator("#main-navigation a").evaluateAll(es => es.map(e => ({ text: e.textContent, href: e.getAttribute("href") })))).toEqual(links);
  const width = page.viewportSize()!.width;
  const pixel = await page.evaluate(() => 1 / devicePixelRatio);
  const geometry = await page.locator("header,main,footer").evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName, x: r.x, y: r.y, width: r.width, height: r.height }; }));
  for (const [index, rect] of geometry.entries()) for (const key of ["x", "y", "width", "height"] as const)
    expect(Math.abs(rect[key] - before.find((item: { width: number }) => item.width === width).nav[index][key])).toBeLessThanOrEqual(pixel);
  expect(await page.locator(".nav-surface").evaluate(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m43)).toBe(width < 768 ? 30 : 60);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("closed nav has its original keyboard order and unobscured focus rings", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator("header .brand")).toBeFocused();
  await focusIsVisible(page);
  if (await page.getByRole("button", { name: "Open menu" }).isVisible()) {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await focusIsVisible(page);
  } else {
    for (const link of links) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`#main-navigation a[href="${link.href}"]`)).toBeFocused();
      await focusIsVisible(page);
    }
  }
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("main"))).toBe(true);
});

for (const reduced of [false, true]) {
  test(`open menu traps both Tab directions, closes with Escape and restores focus (${reduced ? "reduced" : "motion"})`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
    await page.goto("/");
    await keyboardOpen(page);
    const animation = await page.locator("#main-navigation").evaluate(e => {
      const style = getComputedStyle(e), frames = e.getAnimations().flatMap(a => (a.effect as KeyframeEffect).getKeyframes());
      return { name: style.animationName, duration: style.animationDuration, frames };
    });
    expect(animation.name).toBe(reduced ? "nav-fade-in" : "nav-door-in");
    expect(animation.duration).toBe(reduced ? "0.15s" : "0.38s");
    if (reduced) expect(animation.frames.every(frame => !frame.transform || frame.transform === "none")).toBe(true);
    await page.waitForTimeout(450);
    for (const link of links) {
      await expect(page.locator(`#main-navigation a[href="${link.href}"]`)).toBeFocused();
      await focusIsVisible(page);
      await page.screenshot({ path: `artifacts/submit-tilt-staging/screenshots/stage-4/focus-${testInfo.project.name}-${reduced ? "reduced" : "motion"}-${links.indexOf(link)}.png`, scale: "css" });
      await page.keyboard.press("Tab");
    }
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
    await focusIsVisible(page);
    await page.keyboard.press("Tab");
    await expect(page.locator("#main-navigation a").first()).toBeFocused();
    for (const link of [...links].reverse()) {
      if (link === links.at(-1)) await page.keyboard.press("Shift+Tab"); // first link → trigger → last link
      await page.keyboard.press("Shift+Tab");
      await expect(page.locator(`#main-navigation a[href="${link.href}"]`)).toBeFocused();
      await focusIsVisible(page);
    }
    await page.locator("main a").first().evaluate((e: HTMLAnchorElement) => e.focus());
    await expect(page.locator("#main-navigation a").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator("#main-navigation")).not.toBeVisible();
    await focusIsVisible(page);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("main"))).toBe(true);
  });

  test(`Lenis locks wheel, touch and keyboard without hiding body overflow (${reduced ? "reduced" : "motion"})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
    await page.goto("/");
    await page.evaluate(() => scrollTo({ top: 300, behavior: "instant" }));
    await keyboardOpen(page);
    await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
    const initial = await page.evaluate(() => scrollY);
    await page.mouse.move(250, 740); await page.mouse.wheel(0, 500); await page.waitForTimeout(350);
    for (const key of ["ArrowDown", "PageDown", "End", " "]) await page.keyboard.press(key);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 220, y: 750 }] });
    for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 220, y: 750 - i * 35 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => scrollY)).toBe(initial);
    expect(await page.evaluate(() => [document.body, document.documentElement].every(e => !["hidden", "clip"].includes(getComputedStyle(e).overflow)))).toBe(true);
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
    await page.mouse.wheel(0, 350);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initial + 20);
  });
}

test("scroll state changes only at the 80px boundary; hover uses transform and pseudo glow", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  for (const [position, scrolled] of [[0, false], [80, false], [81, true], [200, true], [80, false]] as const) {
    await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), position);
    await expect(page.locator("header")).toHaveAttribute("data-nav-scrolled", String(scrolled));
    await page.waitForTimeout(220);
    const appearance = await page.locator(".nav-surface").evaluate(e => ({ blur: getComputedStyle(e, "::before").backdropFilter, shadow: getComputedStyle(e, "::after").opacity, duration: getComputedStyle(e, "::after").transitionDuration }));
    expect(parseFloat(appearance.blur.replace("blur(", ""))).toBeCloseTo(scrolled ? 16 : 0, 1);
    expect(Number(appearance.shadow)).toBeCloseTo(scrolled ? 1 : 0, 3);
    expect(appearance.duration).toBe("0.2s");
  }
  if (page.viewportSize()!.width !== 1440) return;
  const link = page.locator('#main-navigation a[href="/about"]');
  await link.hover(); await page.waitForTimeout(260);
  expect(await link.evaluate(e => { const m = new DOMMatrixReadOnly(getComputedStyle(e).transform); return [m.m42, m.m43]; })).toEqual([-1, 8]);
  expect(await link.evaluate(e => getComputedStyle(e, "::after").transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
  const quote = page.locator("#main-navigation .button");
  await quote.hover(); await page.waitForTimeout(260);
  expect(await quote.evaluate(e => getComputedStyle(e).color)).toBe("rgb(255, 255, 255)");
  expect(await quote.evaluate(e => getComputedStyle(e, "::before").opacity)).toBe("1");
  expect(await quote.evaluate(e => Math.round(Math.asin(new DOMMatrixReadOnly(getComputedStyle(e).transform).m23) * 180 / Math.PI))).toBe(-8);
  await page.mouse.down(); await page.waitForTimeout(260);
  expect(await quote.evaluate(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m11)).toBeCloseTo(.97);
  await page.mouse.move(20, 400); await page.mouse.up();
  await page.goto("/get-a-quote");
  await page.locator("#main-navigation .button").hover();
  await page.waitForTimeout(260);
  expect(await page.locator("#main-navigation .button").evaluate(e => getComputedStyle(e).transform)).toBe("none");
});

test("repeat, live reduced motion, resize and navigation release the lock", async ({ page }) => {
  await page.goto("/");
  await page.setViewportSize({ width: 390, height: 900 });
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
  }
  await keyboardOpen(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
  await expect.poll(() => page.locator(".nav-surface, #main-navigation, #main-navigation a").evaluateAll(es => es.every(e => getComputedStyle(e).transform === "none"))).toBe(true);
  await page.waitForTimeout(200);
  expect(await page.locator("#main-navigation").evaluate(e => getComputedStyle(e).willChange)).toBe("auto");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".menu-button")).not.toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
  await page.setViewportSize({ width: 390, height: 900 });
  await keyboardOpen(page);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/services\/domestic$/);
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
});

test("short menus keep every keyboard focus ring inside the scrollable panel", async ({ page }) => {
  await page.goto("/"); await page.setViewportSize({ width: 390, height: 360 });
  await keyboardOpen(page); await page.waitForTimeout(450);
  for (let i = 0; i < 5; i++) {
    await focusIsVisible(page);
    expect(await page.evaluate(() => {
      const p = document.querySelector("#main-navigation")!.getBoundingClientRect(), a = document.activeElement!.getBoundingClientRect();
      return a.top >= p.top + 4 && a.bottom <= p.bottom - 4;
    })).toBe(true);
    await page.keyboard.press("Tab");
  }
});
