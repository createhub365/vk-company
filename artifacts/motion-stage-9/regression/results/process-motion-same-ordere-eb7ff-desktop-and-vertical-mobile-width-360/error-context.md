# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: process-motion.spec.ts >> same ordered list, four decoded equal photo frames, horizontal desktop and vertical mobile
- Location: artifacts/motion-stage-9/regression/process-motion.spec.ts:31:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.evaluateAll: Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "VK AND COMPANY home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "VK AND COMPANY" [ref=e7]
        - generic [ref=e8]: VK AND COMPANY
      - button "Open menu" [ref=e9] [cursor=pointer]
  - main [ref=e11]:
    - generic [ref=e14]:
      - generic:
        - img "Illustrative navy and teal courier truck at an Indian delivery forecourt"
      - generic [ref=e16]:
        - paragraph [ref=e17]: Domestic & international courier services
        - heading "Across cities. Across borders." [level=1] [ref=e18]:
          - generic [ref=e19]: Across cities.
          - emphasis [ref=e20]: Across borders.
        - paragraph [ref=e22]: We keep your parcels moving.
        - paragraph [ref=e23]: Domestic and international courier services from VK AND COMPANY. Share your shipment details and let our team help arrange the next step.
        - link "Get a quote" [ref=e26] [cursor=pointer]:
          - /url: /get-a-quote
    - generic [ref=e30]:
      - img "Illustrative delivery truck travelling on an intercity road" [ref=e35]
      - generic [ref=e37]:
        - paragraph [ref=e38]: 01 / Domestic
        - paragraph [ref=e39]: Courier services between cities
        - heading "Planned around your actual route." [level=2] [ref=e40]
        - paragraph [ref=e42]: Share the origin, destination and parcel details. We review availability and prepare an offer for the specific shipment—without making blanket coverage or timing claims.
        - link "Explore domestic services" [ref=e43] [cursor=pointer]:
          - /url: /services/domestic
    - generic [ref=e47]:
      - img "Antonov An-124 cargo aircraft above Lviv airport, with nose, tail and both wingtips in frame" [ref=e52]
      - generic [ref=e54]:
        - paragraph [ref=e55]: 02 / International
        - paragraph [ref=e56]: Across borders, details first
        - heading "Clear before it leaves the ground." [level=2] [ref=e57]
        - paragraph [ref=e59]: Acceptance, documentation, availability and charges depend on the route and parcel. Our team confirms what applies before anything is arranged.
        - link "Explore international services" [ref=e60] [cursor=pointer]:
          - /url: /services/international
    - generic [ref=e64]:
      - generic [ref=e65]:
        - generic [ref=e66]:
          - paragraph [ref=e67]: How shipping works
          - heading "Four steps. One clear process." [level=2] [ref=e68]: Four steps.One clear process.
        - paragraph [ref=e69]: Every status follows a real operational action. An enquiry is never presented as a confirmed booking or dispatch.
      - list [ref=e71]:
        - listitem [ref=e72]:
          - img "Illustrative parcel being weighed and measured" [ref=e74]
          - generic [ref=e75]: "01"
          - heading "Share shipment details" [level=3] [ref=e79]
          - paragraph [ref=e80]: Tell us the route, contents, package count and approximate weight.
        - listitem [ref=e81]:
          - img "A courier and customer reviewing delivery paperwork together on a clipboard" [ref=e83]
          - generic [ref=e84]: "02"
          - heading "Receive a reviewed quote" [level=3] [ref=e88]
          - paragraph [ref=e89]: Service details, inclusions and exclusions are confirmed for the enquiry.
        - listitem [ref=e90]:
          - img "Two delivery workers loading cardboard parcels into the back of a van" [ref=e92]
          - generic [ref=e93]: "03"
          - heading "Arrange dispatch" [level=3] [ref=e97]
          - paragraph [ref=e98]: An accepted quote becomes a booking ready for coordination.
        - listitem [ref=e99]:
          - img "A handheld barcode scanner reading the label on a cardboard parcel" [ref=e101]
          - generic [ref=e102]: "04"
          - heading "Follow verified updates" [level=3] [ref=e106]
          - paragraph [ref=e107]: Contact the team for customer-safe shipment updates.
    - article [ref=e110]:
      - generic [ref=e111]: "01"
      - paragraph [ref=e115]: Start with the shipment
      - heading "Request a considered quote." [level=2] [ref=e116]
      - paragraph [ref=e117]: Share the details once. Our team reviews each request before confirming service or charges.
      - link "Get a quote" [ref=e118] [cursor=pointer]:
        - /url: /get-a-quote
    - generic [ref=e122]:
      - img "Illustrative modern parcel dispatch workspace" [ref=e124]
      - generic [ref=e125]:
        - paragraph [ref=e126]: 03 / Company
        - paragraph [ref=e127]: About VK AND COMPANY
        - heading "Built around each shipment." [level=2] [ref=e128]
        - paragraph [ref=e129]: "Our customer journey is straightforward: share the details, receive a reviewed offer, arrange a booking and follow genuine updates."
        - link "More about our process" [ref=e130] [cursor=pointer]:
          - /url: /about
    - generic [ref=e134]:
      - generic [ref=e135]:
        - generic [ref=e136]:
          - paragraph [ref=e137]: Common questions
          - heading "Useful answers, before you send." [level=2] [ref=e138]: Useful answers,before you send.
        - link "View all FAQs" [ref=e139] [cursor=pointer]:
          - /url: /faq
      - generic [ref=e142]:
        - group [ref=e143]:
          - generic "How do I request a courier quote? +" [ref=e144] [cursor=pointer]
        - group [ref=e145]:
          - generic "Does submitting the form confirm my booking? +" [ref=e146] [cursor=pointer]
        - group [ref=e147]:
          - generic "Can all international parcels be accepted? +" [ref=e148] [cursor=pointer]
        - group [ref=e149]:
          - generic "Is pickup automatically scheduled? +" [ref=e150] [cursor=pointer]
    - generic [ref=e152]:
      - generic [ref=e153]:
        - paragraph [ref=e154]: Contact & support
        - heading "Need help with the next step?" [level=2] [ref=e155]
        - paragraph [ref=e156]: Send a secure general or shipment-related enquiry for the team to review.
      - link "Contact the team" [ref=e157] [cursor=pointer]:
        - /url: /contact
  - contentinfo [ref=e160]:
    - generic [ref=e161]:
      - generic [ref=e162]:
        - generic [ref=e163]:
          - generic [ref=e164]:
            - img "VK AND COMPANY" [ref=e166]
            - generic [ref=e167]: VK AND COMPANY
          - paragraph [ref=e168]: Domestic and international courier services, arranged around the details of each shipment.
        - generic [ref=e169]:
          - heading "Services" [level=3] [ref=e170]
          - link "Domestic courier" [ref=e171] [cursor=pointer]:
            - /url: /services/domestic
          - link "International courier" [ref=e172] [cursor=pointer]:
            - /url: /services/international
          - link "Request a quote" [ref=e173] [cursor=pointer]:
            - /url: /get-a-quote
        - generic [ref=e174]:
          - heading "Company" [level=3] [ref=e175]
          - link "About" [ref=e176] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e177] [cursor=pointer]:
            - /url: /contact
          - link "FAQs" [ref=e178] [cursor=pointer]:
            - /url: /faq
          - link "Privacy" [ref=e179] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e180] [cursor=pointer]:
            - /url: /terms
          - link "Email us" [ref=e181] [cursor=pointer]:
            - /url: mailto:vkandcompanymohali@gmail.com
      - generic [ref=e182]:
        - generic [ref=e183]: © 2026 VK AND COMPANY
        - generic [ref=e184]: Courier information is confirmed for each shipment.
  - alert [ref=e185]
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | async function ready(page: Page) {
  4  |   await page.goto("/");
  5  |   await expect(page.locator(".process-list > li").first()).toHaveAttribute("style", /translateZ/);
> 6  |   await page.locator(".process-list img").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
     |                                           ^ Error: locator.evaluateAll: Test timeout of 45000ms exceeded.
  7  | }
  8  | async function seek(page: Page, progress: number) {
  9  |   await page.locator(".process-depth").evaluate((root, p) => {
  10 |     const list = root.querySelector("ol")!, steps = Array.from(list.children) as HTMLElement[];
  11 |     const rect = root.getBoundingClientRect(), absolute = rect.top + scrollY;
  12 |     const vertical = getComputedStyle(list).gridTemplateColumns.split(" ").length === 1;
  13 |     const first = steps[0], last = steps[3];
  14 |     const firstCenter = first.offsetTop + first.offsetHeight / 2, lastCenter = last.offsetTop + last.offsetHeight / 2;
  15 |     const target = vertical ? absolute + firstCenter + p * (lastCenter - firstCenter) - innerHeight / 2
  16 |       : absolute - innerHeight * .75 + p * (rect.height + innerHeight * .5);
  17 |     window.scrollTo({ top: target, behavior: "instant" });
  18 |   }, progress);
  19 |   await expect.poll(async () => parseFloat(await page.locator(".process-connector .process-line-horizontal").evaluate(p => getComputedStyle(p).strokeDashoffset))).toBeCloseTo(1 - progress, 2);
  20 | }
  21 | async function state(page: Page) {
  22 |   return page.locator(".process-list > li").evaluateAll(steps => steps.map(step => {
  23 |     const css = getComputedStyle(step), matrix = new DOMMatrix(css.transform);
  24 |     return { z: matrix.m43, opacity: Number(css.opacity), glow: Number(getComputedStyle(step.querySelector("span")!, "::before").opacity), willChange: css.willChange };
  25 |   }));
  26 | }
  27 | test.beforeEach(async ({ page }) => {
  28 |   await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" && route.request().method() === "GET" ? route.continue() : route.abort());
  29 | });
  30 | 
  31 | test("same ordered list, four decoded equal photo frames, horizontal desktop and vertical mobile", async ({ page }) => {
  32 |   const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  33 |   await ready(page); await seek(page, .5);
  34 |   await expect(page.locator(".process-list h3")).toHaveText(["Share shipment details", "Receive a reviewed quote", "Arrange dispatch", "Follow verified updates"]);
  35 |   const geometry = await page.locator(".process-list > li").evaluateAll(steps => steps.map(step => {
  36 |     const item = step as HTMLElement, photo = step.querySelector<HTMLElement>(".process-photo")!, image = photo.querySelector("img")!;
  37 |     return { x: item.offsetLeft, y: item.offsetTop, width: photo.clientWidth, height: photo.clientHeight, decoded: image.complete && image.naturalWidth > 0, fit: getComputedStyle(image).objectFit };
  38 |   }));
  39 |   for (const item of geometry) { expect(item.decoded).toBe(true); expect(item.fit).toBe("cover"); expect(Math.abs(item.width / item.height - 1.5)).toBeLessThan(.02); expect(item.width).toBe(geometry[0].width); }
  40 |   if (page.viewportSize()!.width >= 768) expect(new Set(geometry.map(s => s.y)).size).toBe(1);
  41 |   else { expect(new Set(geometry.map(s => s.x)).size).toBe(1); expect(geometry[3].y).toBeGreaterThan(geometry[0].y); }
  42 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  43 |   expect(errors).toEqual([]);
  44 |   await page.screenshot({ path: `artifacts/motion-stage-9/regression/screenshots/process-${page.viewportSize()!.width}.png`, scale: "css" });
  45 | });
  46 | 
  47 | test("continuous scroll drives exact depth, opacity, number glow and line, reversible without a timer", async ({ page }) => {
  48 |   await ready(page);
  49 |   const mobile = page.viewportSize()!.width < 768, active = mobile ? 30 : 60, inactive = mobile ? -15 : -30;
  50 |   for (const p of [0, 1 / 3, .4, 2 / 3, 1, .4, 0]) {
  51 |     await seek(page, p);
  52 |     const values = await state(page);
  53 |     values.forEach((value, index) => {
  54 |       const weight = Math.max(0, 1 - Math.abs(p * 3 - index));
  55 |       expect(value.z).toBeCloseTo(inactive + (active - inactive) * weight, 0);
  56 |       expect(value.opacity).toBeCloseTo(.55 + .45 * weight, 2);
  57 |       expect(value.glow).toBeCloseTo(weight, 2);
  58 |     });
  59 |   }
  60 |   const resting = await state(page); await page.waitForTimeout(350);
  61 |   const after = await state(page);
  62 |   expect(after.map(({ z, opacity }) => ({ z, opacity }))).toEqual(resting.map(({ z, opacity }) => ({ z, opacity })));
  63 |   expect(after.every(s => s.willChange === "auto")).toBe(true);
  64 |   expect(await page.locator(".process-list").evaluate(e => e.getAnimations({ subtree: true }).filter(a => a.playState === "running").length)).toBe(0);
  65 | });
  66 | 
  67 | test("tall viewport settles on a stable middle blend and survives resize", async ({ page }) => {
  68 |   await page.setViewportSize({ width: 1440, height: 2000 }); await ready(page); await seek(page, .5);
  69 |   const bounds = await page.locator(".process-depth").boundingBox();
  70 |   expect(bounds!.y).toBeGreaterThan(0); expect(bounds!.y + bounds!.height).toBeLessThan(2000);
  71 |   const first = await state(page); await page.waitForTimeout(400); expect(await state(page)).toEqual(first.map(v => ({ ...v, willChange: "auto" })));
  72 |   expect(first[1].z).toBeCloseTo(15, 0); expect(first[2].z).toBeCloseTo(15, 0);
  73 |   await page.screenshot({ path: `artifacts/motion-stage-9/regression/screenshots/tall-${test.info().project.name}.png`, scale: "css" });
  74 |   await page.setViewportSize({ width: 390, height: 900 }); await seek(page, 2 / 3);
  75 |   expect((await state(page))[2].z).toBeCloseTo(30, 0);
  76 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  77 | });
  78 | 
  79 | test("reduced motion and JavaScript failure keep every step fully visible and line drawn", async ({ page, browser }) => {
  80 |   await ready(page); await seek(page, .4); await page.emulateMedia({ reducedMotion: "reduce" });
  81 |   const assertFinal = async (target: Page) => {
  82 |     await expect.poll(async () => (await state(target)).every(s => s.z === 0 && s.opacity === 1 && s.willChange === "auto")).toBe(true);
  83 |     expect(await target.locator(".process-connector .process-line-horizontal").evaluate(p => getComputedStyle(p).strokeDashoffset)).toBe("0px");
  84 |   };
  85 |   await assertFinal(page);
  86 |   await page.mouse.wheel(0, 120); await page.waitForTimeout(100); await assertFinal(page);
  87 |   await page.screenshot({ path: `artifacts/motion-stage-9/regression/screenshots/reduced-${page.viewportSize()!.width}.png`, scale: "css" });
  88 |   const context = await browser.newContext({ javaScriptEnabled: false, viewport: page.viewportSize()! });
  89 |   const staticPage = await context.newPage(); await staticPage.goto("http://127.0.0.1:3109/"); await assertFinal(staticPage);
  90 |   await expect(staticPage.locator(".process-list li")).toHaveCount(4); await context.close();
  91 |   await page.emulateMedia({ reducedMotion: "no-preference" }); await seek(page, 1 / 3);
  92 |   expect((await state(page))[1].opacity).toBeCloseTo(1, 2);
  93 | });
  94 | 
```