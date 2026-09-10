import { expect, test, type Page } from "@playwright/test";

const endpoint = "https://formsubmit.co/ajax/vkandcompanymohali@gmail.com";
const fields = { name: "TEST ONLY Customer", phone: "+91 9876543210", email: "customer@example.com",
  originCountry: "India", originCity: "Mohali", originPostalCode: "140301",
  destinationCountry: "Canada", destinationCity: "Toronto", destinationPostalCode: "M5V 2T6",
  contentsDescription: "Printed documents & samples", packageCount: "2", approximateWeight: "1.5",
  dimensions: "30 × 20 × 10", preferredDispatchDate: "2026-10-01", instructions: "TEST ONLY\nHandle <carefully> & keep dry" };
type Mode = "accepted" | "rejected" | "malformed" | "network" | "timeout" | "contradictory";
async function setup(page: Page, initial: Mode = "accepted") {
  const requests: { url: string; data: Record<string, string> }[] = [];
  const state = { mode: initial };
  await page.route("**/*", async route => {
    const request = route.request();
    if (request.method() === "POST") {
      requests.push({ url: request.url(), data: request.postDataJSON() });
      if (state.mode === "timeout") return; // Held locally until browser aborts.
      if (state.mode === "network") return route.abort("failed");
      return route.fulfill({ status: state.mode === "contradictory" ? 503 : 200,
        contentType: state.mode === "malformed" ? "text/html" : "application/json",
        body: state.mode === "malformed" ? "<html>Upstream error</html>" : JSON.stringify({ success: state.mode === "rejected" ? "false" : "true" }) });
    }
    if (!["localhost", "127.0.0.1"].includes(new URL(request.url()).hostname)) return route.abort();
    return route.continue();
  });
  await page.goto("/get-a-quote");
  for (const [name, value] of Object.entries(fields)) await page.locator(`[name="${name}"]`).fill(value);
  await page.getByLabel("Weight unit").selectOption("lb");
  await page.getByLabel("Dimension unit").selectOption("in");
  return { requests, state };
}
async function retained(page: Page) {
  for (const [name, value] of Object.entries(fields)) await expect(page.locator(`[name="${name}"]`)).toHaveValue(value);
  await expect(page.getByLabel("Weight unit")).toHaveValue("lb");
  await expect(page.getByLabel("Dimension unit")).toHaveValue("in");
}
const submit = (page: Page) => page.getByRole("button", { name: "Send quote request", exact: true }).click();

test("Quote goes only to FormSubmit with every detail and validated Reply-To", async ({ page }) => {
  const { requests } = await setup(page);
  await page.locator("form").evaluate(form => {
    for (const name of ["_cc", "_autoresponse", "_captcha", "_subject", "_replyto", "recipient"]) {
      const input = document.createElement("input"); input.name = name; input.value = "attacker@example.com"; input.type = "hidden"; form.append(input);
    }
  });
  await submit(page);
  await expect(page.getByRole("status")).toContainText("does not confirm inbox delivery, an approved quotation, or a booking");
  expect(requests).toEqual([{ url: endpoint, data: {
    name: fields.name, email: fields.email, Phone: fields.phone, "Enquiry type": "Quote Request",
    "Origin country": fields.originCountry, "Origin city": fields.originCity, "Origin postal code": fields.originPostalCode,
    "Destination country": fields.destinationCountry, "Destination city": fields.destinationCity, "Destination postal code": fields.destinationPostalCode,
    Contents: fields.contentsDescription, "Package count": "2", "Approximate weight": "1.5", "Weight unit": "lb",
    Dimensions: fields.dimensions, "Dimension unit": "in", "Preferred dispatch date": fields.preferredDispatchDate,
    Instructions: fields.instructions, "Pickup requested": "false", _subject: "VK AND COMPANY — New Quote Request", _honey: "", _replyto: fields.email,
  } }]);
  await expect(page.locator('[name="name"]')).toHaveValue("");
});

test("invalid inputs and honeypot never reach a network request", async ({ page }) => {
  const { requests } = await setup(page);
  await page.locator('[name="email"]').fill("invalid");
  await submit(page);
  await expect(page.locator('[name="email"]')).toBeFocused();
  await expect(page.locator("#email-error")).toBeVisible();
  await page.locator('[name="email"]').fill(fields.email);
  await page.locator('[name="packageCount"]').fill("0");
  await submit(page);
  await expect(page.locator('[name="packageCount"]')).toBeFocused();
  await page.locator('[name="packageCount"]').fill("2");
  await page.locator('[name="website"]').evaluate((element: HTMLInputElement) => { element.value = "bot"; });
  await submit(page);
  await expect(page.getByRole("status")).toContainText("could not validate");
  expect(requests).toHaveLength(0);
});

test("empty optional fields omit Reply-To without dropping units or false", async ({ page }) => {
  const { requests } = await setup(page);
  for (const name of ["email", "dimensions", "preferredDispatchDate", "instructions"]) await page.locator(`[name="${name}"]`).fill("");
  await submit(page);
  await expect(page.getByRole("status")).toContainText("accepted your quote request");
  expect(requests).toHaveLength(1);
  expect(requests[0].url).toBe(endpoint);
  expect(requests[0].data).toMatchObject({ "Pickup requested": "false", "Dimension unit": "in", "Weight unit": "lb" });
  for (const key of ["email", "_replyto", "Dimensions", "Preferred dispatch date", "Instructions"]) expect(requests[0].data).not.toHaveProperty(key);
});

for (const mode of ["rejected", "malformed", "network", "timeout", "contradictory"] as const) {
  test(`${mode}: preserves values, releases loading and never retries automatically`, async ({ page }, info) => {
    const { requests, state } = await setup(page, mode);
    if (mode === "timeout") await page.clock.install();
    await submit(page);
    if (mode === "timeout") {
      await expect.poll(() => requests.length).toBe(1);
      await expect(page.getByRole("button", { name: "Submitting…" })).toBeDisabled();
      // Even programmatic duplicate submits cannot bypass the in-flight guard.
      await page.locator("form").evaluate(form => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
      await page.clock.fastForward(20_100);
    }
    await expect(page.getByRole("status")).toContainText(mode === "rejected" ? "did not accept" : "may have been accepted");
    await retained(page);
    await expect(page.getByRole("button", { name: "Send quote request", exact: true })).toBeEnabled();
    expect(requests.map(request => request.url)).toEqual([endpoint]);
    await page.screenshot({ path: info.outputPath(`${mode}.png`), fullPage: true });
    if (mode === "rejected") {
      state.mode = "accepted";
      await submit(page);
      await expect(page.getByRole("status")).toContainText("accepted your quote request");
      expect(requests).toHaveLength(2);
    }
  });
}

test("session attempt limit remains eight attempts per fifteen minutes", async ({ page }) => {
  const { requests } = await setup(page, "rejected");
  for (let attempt = 0; attempt < 8; attempt++) {
    await submit(page);
    await expect.poll(() => requests.length).toBe(attempt + 1);
    await expect(page.getByRole("status")).toContainText("did not accept");
  }
  await submit(page);
  await expect(page.getByRole("status")).toContainText("wait 15 minutes");
  expect(requests).toHaveLength(8);
  await retained(page);
});
