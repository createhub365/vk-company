import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const before = JSON.parse(readFileSync("artifacts/motion-stage-5/before/layout.json", "utf8"));
const sections = ["#domestic-services", ".international-feature"];
const headings = ["Planned around your actual route.", "Clear before it leaves the ground."];
type Entry = { className: string; text: string; heading: string | null; section: string; frames: Keyframe[]; timing: { duration: number; delay: number }; };
declare global { interface Window { editorialEntries: Entry[]; } }
async function instrument(page: Page) {
  await page.addInitScript(() => {
    window.editorialEntries = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.closest(".editorial-motion")) window.editorialEntries.push({ className: this.className, text: this.textContent ?? "", heading: this.closest("h2")?.textContent ?? null, section: this.closest<HTMLElement>(".editorial-motion")!.dataset.editorialLead!, frames: frames as Keyframe[], timing: options as Entry["timing"] });
      return animate.call(this, frames, options);
    };
  });
}
test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
  await instrument(page);
});

test("original section geometry, image fitting and alternating desktop order remain", async ({ page }) => {
  await page.goto("/"); await page.waitForTimeout(1400);
  const layout = await page.locator("header,main > section,footer").evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; }));
  const baseline = before.find((r: { width: number }) => r.width === page.viewportSize()!.width).layout;
  expect(layout).toHaveLength(baseline.length);
  for (const [index, row] of layout.entries()) for (const key of ["x", "y", "width", "height"] as const) expect(Math.abs(row[key] - baseline[index][key])).toBeLessThan(1);
  for (const [index, selector] of sections.entries()) {
    const section = page.locator(selector); await section.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
    await expect(section.locator("h2")).toHaveText(headings[index]);
    expect(await section.locator("h2").textContent()).toBe(headings[index]);
    await expect(section.locator(":scope > .depth-section")).toHaveCount(1);
    await expect(section.locator(".parallax-media")).toHaveCount(1);
    const fit = await section.locator(".editorial-image").evaluate(e => {
      const image = e.querySelector("img")!;
      return { width: e.clientWidth, height: e.clientHeight, imageWidth: image.clientWidth, imageHeight: image.clientHeight,
        natural: image.naturalWidth, objectFit: getComputedStyle(image).objectFit, padding: getComputedStyle(e).padding };
    });
    expect(fit.natural).toBeGreaterThan(0); expect(fit.padding).toBe("0px");
    expect(Math.abs(fit.width - fit.imageWidth)).toBeLessThanOrEqual(1); expect(Math.abs(fit.height - fit.imageHeight)).toBeLessThanOrEqual(1);
    expect(fit.objectFit).toBe("contain");
    if (page.viewportSize()!.width > 900) {
      const media = await section.locator(".editorial-media").boundingBox(), text = await section.locator(".editorial-copy").boundingBox();
      expect(media!.x < text!.x).toBe(index === 0);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("opposite-side text, per-line headings and grouped prose use the bounded timings", async ({ page }, info) => {
  await page.goto("/"); await page.waitForTimeout(500);
  for (const [index, selector] of sections.entries()) {
    await page.locator(`${selector} .editorial-copy`).evaluate(e => scrollTo({ top: e.getBoundingClientRect().top + scrollY - 200, behavior: "instant" }));
    await page.waitForTimeout(200);
    const headingText = await page.locator(`${selector} h2`).textContent();
    expect(headingText).toBe(headings[index]);
    await page.screenshot({ path: `artifacts/motion-stage-9/extra/screenshots/entrance-${info.project.name}-${index}.png`, scale: "css" });
    await page.waitForTimeout(1200);
  }
  const entries = await page.evaluate(() => window.editorialEntries);
  const sectionOrder = (a: Entry, b: Entry) => Number(a.section === "text") - Number(b.section === "text");
  const columns = entries.filter(e => e.className === "editorial-text-enter").sort(sectionOrder);
  expect(columns.map(e => e.frames[0].transform)).toEqual(["translateX(12px) translateY(0px) rotateX(0deg)", "translateX(-12px) translateY(0px) rotateX(0deg)"]);
  expect(columns.map(e => e.timing.delay)).toEqual([90, 0]);
  const images = entries.filter(e => e.className === "editorial-image-enter").sort(sectionOrder);
  expect(images.map(e => e.timing.delay)).toEqual([0, 90]);
  const prose = entries.filter(e => e.className === "editorial-prose");
  expect(prose).toHaveLength(2);
  expect(prose.every(e => e.timing.duration === 400 && e.frames[0].transform === "translateY(16px) rotateX(0deg)")).toBe(true);
  const lines = entries.filter(e => e.className === "editorial-heading-line");
  expect(lines.length).toBeGreaterThanOrEqual(2);
  expect(lines.every(e => e.frames[0].transform === "translateY(14.399999999999999px) rotateX(8deg)" || e.frames[0].transform === "translateY(14.4px) rotateX(8deg)")).toBe(true);
  // IntersectionObserver callback delivery order is not the visual line order;
  // the shared timeline and per-line delays define the actual entrance sequence.
  for (const heading of headings) expect(lines.filter(e => e.heading === heading).sort((a, b) => a.timing.delay - b.timing.delay).map(e => e.text).join("")).toBe(heading);
  expect(await page.locator(".editorial-motion .editorial-text-plane").evaluateAll(es => es.map(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m43))).toEqual(Array(2).fill(page.viewportSize()!.width < 768 ? 6 : 12));
  await page.locator("#domestic-services").scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.editorialEntries.length)).toBe(entries.length);
});

test("parallax reverses with scroll; hovering and tapping never rotate a photograph", async ({ page }) => {
  await page.goto("/"); await page.waitForTimeout(500);
  for (const selector of sections) {
    const values: { z: number; scale: number }[] = [];
    for (const progress of [.1, .5, .9, .5, .1]) {
      await page.locator(`${selector} .editorial-media`).evaluate((e, progress) => { const r = e.getBoundingClientRect(); scrollTo({ top: r.top + scrollY - innerHeight + (innerHeight + r.height) * progress, behavior: "instant" }); }, progress);
      await page.waitForTimeout(200);
      values.push(await page.locator(`${selector} [data-depth-motion="parallax"]`).evaluate(e => { const m = new DOMMatrixReadOnly(getComputedStyle(e).transform); return { z: m.m43, scale: m.m11 }; }));
    }
    expect(values[0].z).toBeLessThan(values[1].z); expect(values[1].z).toBeLessThan(values[2].z);
    expect(values[0].scale).toBeGreaterThan(values[1].scale); expect(values[1].scale).toBeGreaterThan(values[2].scale);
    const factor = page.viewportSize()!.width < 768 ? .5 : 1;
    expect(values.every(v => v.z >= -40 * factor && v.z <= 20 * factor && v.scale >= 1 && v.scale <= 1.04)).toBe(true);
    expect(values[1].z).toBeCloseTo(values[3].z, 2); expect(values[0].z).toBeCloseTo(values[4].z, 2);
    const frame = page.locator(`${selector} [data-photo-frame]`); await frame.scrollIntoViewIfNeeded(); await page.waitForTimeout(1300);
    await frame.hover({ position: { x: 70, y: 50 } }); await page.waitForTimeout(200);
    expect(await frame.evaluate(e => getComputedStyle(e).transform)).toBe("none");
    await frame.click({ position: { x: 70, y: 50 } });
    await expect(frame.locator(".image-feedback-layer")).toHaveCount(1);
    const matrix = await frame.evaluate(e => { const m = new DOMMatrixReadOnly(getComputedStyle(e).transform); return [m.m12, m.m13, m.m21, m.m23, m.m31, m.m32]; });
    expect(matrix.every(v => v === 0)).toBe(true);
    expect(await frame.locator("img").evaluate(e => getComputedStyle(e).transform)).toBe("none");
    await expect(frame.locator(".image-feedback-layer")).toHaveCount(0);
    await page.waitForTimeout(300);
    expect(await page.locator(`${selector} [data-depth-motion]`).evaluateAll(es => es.every(e => getComputedStyle(e).willChange === "auto"))).toBe(true);
  }
});

test("a paragraph in view before hydration stays immediately visible and never reveals", async ({ page }, info) => {
  for (const [index, selector] of sections.entries()) {
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/_next/**/*.js", async route => { await gate; await route.continue(); });
    await page.goto("/", { waitUntil: "commit" });
    const paragraph = page.locator(`${selector} .editorial-prose p`);
    await expect(paragraph).toBeAttached();
    await paragraph.evaluate(e => scrollTo({ top: e.getBoundingClientRect().top + scrollY - 200, behavior: "instant" }));
    await page.waitForTimeout(200);
    await expect(paragraph).toBeVisible();
    expect(await paragraph.locator("..").evaluate(e => getComputedStyle(e).opacity)).toBe("1");
    release(); await page.waitForTimeout(1400);
    const text = await paragraph.textContent();
    expect(await page.evaluate(text => window.editorialEntries.filter(e => e.className === "editorial-prose" && e.text === text), text)).toEqual([]);
    expect(await paragraph.locator("..").evaluate(e => ({ opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform }))).toEqual({ opacity: "1", transform: "none" });
    await page.screenshot({ path: `artifacts/motion-stage-9/extra/screenshots/initial-prose-${info.project.name}-${index}.png`, scale: "css" });
    await page.unroute("**/_next/**/*.js");
  }
});

test("reduced motion, no JavaScript, resize and native text links remain usable", async ({ page, browser }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/");
  for (const [index, selector] of sections.entries()) {
    await page.locator(selector).scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    expect(await page.locator(`${selector} [data-depth-motion], ${selector} .editorial-text-plane`).evaluateAll(es => es.every(e => getComputedStyle(e).transform === "none" && getComputedStyle(e).opacity === "1"))).toBe(true);
    await page.screenshot({ path: `artifacts/motion-stage-9/extra/screenshots/reduced-${info.project.name}-${index}.png`, scale: "css" });
  }
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize()! });
  const staticPage = await context.newPage(); await staticPage.goto("http://127.0.0.1:3109/");
  for (const [index, selector] of sections.entries()) { await staticPage.locator(selector).scrollIntoViewIfNeeded(); await expect(staticPage.locator(`${selector} .editorial-prose p`)).toBeVisible(); expect(await staticPage.locator(`${selector} h2`).textContent()).toBe(headings[index]); }
  await context.close();
  await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/"); await page.waitForTimeout(300);
  await page.locator("#domestic-services").scrollIntoViewIfNeeded(); await page.waitForTimeout(120);
  await page.setViewportSize({ width: 360, height: 900 }); await page.waitForTimeout(200);
  expect(await page.locator("#domestic-services h2").textContent()).toBe(headings[0]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const link = page.locator('#domestic-services a[href="/services/domestic"]'); await link.focus(); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/services\/domestic$/);
});
