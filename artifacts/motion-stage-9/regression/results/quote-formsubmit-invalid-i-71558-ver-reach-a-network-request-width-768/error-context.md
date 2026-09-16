# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quote-formsubmit.spec.ts >> invalid inputs and honeypot never reach a network request
- Location: artifacts/motion-stage-9/regression/quote-formsubmit.spec.ts:59:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Send quote request', exact: true })
    - locator resolved to <button type="submit" class="button">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 100ms
    81 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <form novalidate="" class="form-panel">…</form> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "VK AND COMPANY home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "VK AND COMPANY" [ref=e7]
        - generic [ref=e8]: VK AND COMPANY
      - button "Open menu" [ref=e9] [cursor=pointer]
  - main [ref=e11]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - paragraph [ref=e15]: Quotation request
        - heading "Tell us about your shipment." [level=1] [ref=e16]
        - paragraph [ref=e17]: Share the route and parcel details below. Our team will review the information before confirming service and charges.
      - img "Illustrative Indian courier measuring a parcel on a weighing scale beside shipping paperwork; not actual company staff or premises" [ref=e20]
    - generic [ref=e22]:
      - complementary [ref=e23]:
        - generic [ref=e24]:
          - paragraph [ref=e25]: Before you begin
          - heading "Details make the difference." [level=2] [ref=e26]
          - paragraph [ref=e27]: Approximate information is fine where requested. Accurate contents, weight and route details help the team assess the shipment.
          - paragraph [ref=e28]: Pickup requests are not currently enabled.
      - generic [ref=e30]:
        - generic [ref=e32]:
          - text: Website
          - textbox [ref=e33]
        - group "Your details" [ref=e34]:
          - generic [ref=e36]:
            - generic [ref=e37]:
              - generic [ref=e38]: Name
              - textbox "Name" [ref=e39]: TEST ONLY Customer
            - generic [ref=e40]:
              - generic [ref=e41]: Phone number
              - textbox "Phone number" [ref=e42]:
                - /placeholder: Include country code
                - text: +91 9876543210
            - generic [ref=e43]:
              - generic [ref=e44]: Email (optional)
              - textbox "Email (optional)" [invalid] [ref=e45]: customer@example.com
              - generic [ref=e46]: Invalid email address
        - group "Route" [ref=e47]:
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: Origin country
              - textbox "Origin country" [ref=e52]: India
            - generic [ref=e53]:
              - generic [ref=e54]: Origin city
              - textbox "Origin city" [ref=e55]: Mohali
            - generic [ref=e56]:
              - generic [ref=e57]: Origin postal code
              - textbox "Origin postal code" [ref=e58]: "140301"
            - generic [ref=e59]:
              - generic [ref=e60]: Destination country
              - textbox "Destination country" [ref=e61]: Canada
            - generic [ref=e62]:
              - generic [ref=e63]: Destination city
              - textbox "Destination city" [ref=e64]: Toronto
            - generic [ref=e65]:
              - generic [ref=e66]: Destination postal code
              - textbox "Destination postal code" [ref=e67]: M5V 2T6
        - group "Shipment" [ref=e68]:
          - generic [ref=e70]:
            - generic [ref=e71]:
              - generic [ref=e72]: Contents description
              - textbox "Contents description" [ref=e73]: Printed documents & samples
              - generic [ref=e74]: Be clear about the actual contents; acceptance is confirmed after review.
            - generic [ref=e75]:
              - generic [ref=e76]: Number of packages
              - spinbutton "Number of packages" [active] [ref=e77]: "0"
            - generic [ref=e78]:
              - generic [ref=e79]: Approximate weight
              - generic [ref=e80]:
                - spinbutton "Approximate weight" [ref=e81]: "1.5"
                - combobox "Weight unit" [ref=e82]:
                  - option "kg"
                  - option "lb" [selected]
            - generic [ref=e83]:
              - generic [ref=e84]: Dimensions (when known)
              - textbox "Dimensions (when known)" [ref=e85]:
                - /placeholder: L × W × H
                - text: 30 × 20 × 10
            - generic [ref=e86]:
              - generic [ref=e87]: Dimension unit
              - combobox "Dimension unit" [ref=e88]:
                - option "centimetres"
                - option "inches" [selected]
            - generic [ref=e89]:
              - generic [ref=e90]: Preferred dispatch date (not guaranteed)
              - textbox "Preferred dispatch date (not guaranteed)" [ref=e91]: 2026-10-01
            - generic [ref=e92]:
              - generic [ref=e93]: Additional instructions
              - textbox "Additional instructions" [ref=e94]: TEST ONLY Handle <carefully> & keep dry
        - paragraph [ref=e95]: Submitting this form creates an enquiry. It does not confirm a quote, booking, pickup or dispatch.
        - status [ref=e96]: Please correct the highlighted fields.
        - button "Send quote request" [ref=e97] [cursor=pointer]
  - contentinfo [ref=e101]:
    - generic [ref=e102]:
      - generic [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e105]:
            - img "VK AND COMPANY" [ref=e107]
            - generic [ref=e108]: VK AND COMPANY
          - paragraph [ref=e109]: Domestic and international courier services, arranged around the details of each shipment.
        - generic [ref=e110]:
          - heading "Services" [level=3] [ref=e111]
          - link "Domestic courier" [ref=e112] [cursor=pointer]:
            - /url: /services/domestic
          - link "International courier" [ref=e113] [cursor=pointer]:
            - /url: /services/international
          - link "Request a quote" [ref=e114] [cursor=pointer]:
            - /url: /get-a-quote
        - generic [ref=e115]:
          - heading "Company" [level=3] [ref=e116]
          - link "About" [ref=e117] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e118] [cursor=pointer]:
            - /url: /contact
          - link "FAQs" [ref=e119] [cursor=pointer]:
            - /url: /faq
          - link "Privacy" [ref=e120] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e121] [cursor=pointer]:
            - /url: /terms
          - link "Email us" [ref=e122] [cursor=pointer]:
            - /url: mailto:vkandcompanymohali@gmail.com
      - generic [ref=e123]:
        - generic [ref=e124]: © 2026 VK AND COMPANY
        - generic [ref=e125]: Courier information is confirmed for each shipment.
  - alert [ref=e126]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | 
  3   | const endpoint = "https://formsubmit.co/ajax/vkandcompanymohali@gmail.com";
  4   | const fields = { name: "TEST ONLY Customer", phone: "+91 9876543210", email: "customer@example.com",
  5   |   originCountry: "India", originCity: "Mohali", originPostalCode: "140301",
  6   |   destinationCountry: "Canada", destinationCity: "Toronto", destinationPostalCode: "M5V 2T6",
  7   |   contentsDescription: "Printed documents & samples", packageCount: "2", approximateWeight: "1.5",
  8   |   dimensions: "30 × 20 × 10", preferredDispatchDate: "2026-10-01", instructions: "TEST ONLY\nHandle <carefully> & keep dry" };
  9   | type Mode = "accepted" | "rejected" | "malformed" | "network" | "timeout" | "contradictory";
  10  | async function setup(page: Page, initial: Mode = "accepted") {
  11  |   const requests: { url: string; data: Record<string, string> }[] = [];
  12  |   const state = { mode: initial };
  13  |   await page.route("**/*", async route => {
  14  |     const request = route.request();
  15  |     if (request.method() === "POST") {
  16  |       requests.push({ url: request.url(), data: request.postDataJSON() });
  17  |       if (state.mode === "timeout") return; // Held locally until browser aborts.
  18  |       if (state.mode === "network") return route.abort("failed");
  19  |       return route.fulfill({ status: state.mode === "contradictory" ? 503 : 200,
  20  |         contentType: state.mode === "malformed" ? "text/html" : "application/json",
  21  |         body: state.mode === "malformed" ? "<html>Upstream error</html>" : JSON.stringify({ success: state.mode === "rejected" ? "false" : "true" }) });
  22  |     }
  23  |     if (!["localhost", "127.0.0.1"].includes(new URL(request.url()).hostname)) return route.abort();
  24  |     return route.continue();
  25  |   });
  26  |   await page.goto("/get-a-quote");
  27  |   for (const [name, value] of Object.entries(fields)) await page.locator(`[name="${name}"]`).fill(value);
  28  |   await page.getByLabel("Weight unit").selectOption("lb");
  29  |   await page.getByLabel("Dimension unit").selectOption("in");
  30  |   return { requests, state };
  31  | }
  32  | async function retained(page: Page) {
  33  |   for (const [name, value] of Object.entries(fields)) await expect(page.locator(`[name="${name}"]`)).toHaveValue(value);
  34  |   await expect(page.getByLabel("Weight unit")).toHaveValue("lb");
  35  |   await expect(page.getByLabel("Dimension unit")).toHaveValue("in");
  36  | }
> 37  | const submit = (page: Page) => page.getByRole("button", { name: "Send quote request", exact: true }).click();
      |                                                                                                      ^ Error: locator.click: Test timeout of 45000ms exceeded.
  38  | 
  39  | test("Quote goes only to FormSubmit with every detail and validated Reply-To", async ({ page }) => {
  40  |   const { requests } = await setup(page);
  41  |   await page.locator("form").evaluate(form => {
  42  |     for (const name of ["_cc", "_autoresponse", "_captcha", "_subject", "_replyto", "recipient"]) {
  43  |       const input = document.createElement("input"); input.name = name; input.value = "attacker@example.com"; input.type = "hidden"; form.append(input);
  44  |     }
  45  |   });
  46  |   await submit(page);
  47  |   await expect(page.getByRole("status")).toContainText("does not confirm inbox delivery, an approved quotation, or a booking");
  48  |   expect(requests).toEqual([{ url: endpoint, data: {
  49  |     name: fields.name, email: fields.email, Phone: fields.phone, "Enquiry type": "Quote Request",
  50  |     "Origin country": fields.originCountry, "Origin city": fields.originCity, "Origin postal code": fields.originPostalCode,
  51  |     "Destination country": fields.destinationCountry, "Destination city": fields.destinationCity, "Destination postal code": fields.destinationPostalCode,
  52  |     Contents: fields.contentsDescription, "Package count": "2", "Approximate weight": "1.5", "Weight unit": "lb",
  53  |     Dimensions: fields.dimensions, "Dimension unit": "in", "Preferred dispatch date": fields.preferredDispatchDate,
  54  |     Instructions: fields.instructions, "Pickup requested": "false", _subject: "VK AND COMPANY — New Quote Request", _honey: "", _replyto: fields.email,
  55  |   } }]);
  56  |   await expect(page.locator('[name="name"]')).toHaveValue("");
  57  | });
  58  | 
  59  | test("invalid inputs and honeypot never reach a network request", async ({ page }) => {
  60  |   const { requests } = await setup(page);
  61  |   await page.locator('[name="email"]').fill("invalid");
  62  |   await submit(page);
  63  |   await expect(page.locator('[name="email"]')).toBeFocused();
  64  |   await expect(page.locator("#email-error")).toBeVisible();
  65  |   await page.locator('[name="email"]').fill(fields.email);
  66  |   await page.locator('[name="packageCount"]').fill("0");
  67  |   await submit(page);
  68  |   await expect(page.locator('[name="packageCount"]')).toBeFocused();
  69  |   await page.locator('[name="packageCount"]').fill("2");
  70  |   await page.locator('[name="website"]').evaluate((element: HTMLInputElement) => { element.value = "bot"; });
  71  |   await submit(page);
  72  |   await expect(page.getByRole("status")).toContainText("could not validate");
  73  |   expect(requests).toHaveLength(0);
  74  | });
  75  | 
  76  | test("empty optional fields omit Reply-To without dropping units or false", async ({ page }) => {
  77  |   const { requests } = await setup(page);
  78  |   for (const name of ["email", "dimensions", "preferredDispatchDate", "instructions"]) await page.locator(`[name="${name}"]`).fill("");
  79  |   await submit(page);
  80  |   await expect(page.getByRole("status")).toContainText("accepted your quote request");
  81  |   expect(requests).toHaveLength(1);
  82  |   expect(requests[0].url).toBe(endpoint);
  83  |   expect(requests[0].data).toMatchObject({ "Pickup requested": "false", "Dimension unit": "in", "Weight unit": "lb" });
  84  |   for (const key of ["email", "_replyto", "Dimensions", "Preferred dispatch date", "Instructions"]) expect(requests[0].data).not.toHaveProperty(key);
  85  | });
  86  | 
  87  | for (const mode of ["rejected", "malformed", "network", "timeout", "contradictory"] as const) {
  88  |   test(`${mode}: preserves values, releases loading and never retries automatically`, async ({ page }, info) => {
  89  |     const { requests, state } = await setup(page, mode);
  90  |     if (mode === "timeout") await page.clock.install();
  91  |     await submit(page);
  92  |     if (mode === "timeout") {
  93  |       await expect.poll(() => requests.length).toBe(1);
  94  |       await expect(page.getByRole("button", { name: "Submitting…" })).toBeDisabled();
  95  |       // Even programmatic duplicate submits cannot bypass the in-flight guard.
  96  |       await page.locator("form").evaluate(form => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  97  |       await page.clock.fastForward(20_100);
  98  |     }
  99  |     await expect(page.getByRole("status")).toContainText(mode === "rejected" ? "did not accept" : "may have been accepted");
  100 |     await retained(page);
  101 |     await expect(page.getByRole("button", { name: "Send quote request", exact: true })).toBeEnabled();
  102 |     expect(requests.map(request => request.url)).toEqual([endpoint]);
  103 |     await page.screenshot({ path: info.outputPath(`${mode}.png`), fullPage: true });
  104 |     if (mode === "rejected") {
  105 |       state.mode = "accepted";
  106 |       await submit(page);
  107 |       await expect(page.getByRole("status")).toContainText("accepted your quote request");
  108 |       expect(requests).toHaveLength(2);
  109 |     }
  110 |   });
  111 | }
  112 | 
  113 | test("session attempt limit remains eight attempts per fifteen minutes", async ({ page }) => {
  114 |   const { requests } = await setup(page, "rejected");
  115 |   for (let attempt = 0; attempt < 8; attempt++) {
  116 |     await submit(page);
  117 |     await expect.poll(() => requests.length).toBe(attempt + 1);
  118 |     await expect(page.getByRole("status")).toContainText("did not accept");
  119 |   }
  120 |   await submit(page);
  121 |   await expect(page.getByRole("status")).toContainText("wait 15 minutes");
  122 |   expect(requests).toHaveLength(8);
  123 |   await retained(page);
  124 | });
  125 | 
```