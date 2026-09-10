import { expect, test, type Page } from "@playwright/test";

const contactEndpoint = "https://formsubmit.co/ajax/vkandcompanymohali@gmail.com";
async function interceptSubmissions(page: Page, status = 200, body: object = { success: "true" }) {
  const requests: { url: string; data: Record<string, string> }[] = [];
  await page.route("**/*", async route => {
    const request = route.request();
    if (request.method() === "POST") {
      requests.push({ url: request.url(), data: request.postDataJSON() });
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      return;
    }
    const host = new URL(request.url()).hostname;
    if (host !== "localhost" && host !== "127.0.0.1") { await route.abort(); return; }
    await route.continue();
  });
  return requests;
}
async function fillContact(page: Page) {
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Test Customer");
  await page.getByLabel("Email", { exact: true }).fill("customer@example.com");
  await page.getByLabel("Subject", { exact: true }).selectOption("Shipment Support");
  await page.getByLabel("Message", { exact: true }).fill("Please explain the shipment route.");
}

test("blank optional Phone with spaces reaches only the mocked FormSubmit endpoint", async ({ page }) => {
  const requests = await interceptSubmissions(page);
  await fillContact(page);
  await page.getByLabel("Phone", { exact: true }).fill("   ");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("does not confirm inbox delivery");
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({ url: contactEndpoint, data: { phone: "", shipmentReference: "",
    _replyto: "customer@example.com", _subject: "VK AND COMPANY — New Contact Enquiry" } });
});

test("invalid Email gets its own error and focus without any submission request", async ({ page }) => {
  const requests = await interceptSubmissions(page);
  await fillContact(page);
  await page.getByLabel("Email", { exact: true }).fill("invalid-email");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#contact-email-error")).toHaveText("Enter a valid email address, such as name@example.com.");
  await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("invalid-email");
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("Please explain the shipment route.");
  expect(requests).toHaveLength(0);
});

test("Subject and Message minimum errors focus the first invalid field and retain text", async ({ page }) => {
  const requests = await interceptSubmissions(page);
  await fillContact(page);
  await page.getByLabel("Subject", { exact: true }).evaluate((element: HTMLSelectElement) => {
    element.add(new Option("Hi", "Hi")); element.value = "Hi";
  });
  await page.getByLabel("Message", { exact: true }).fill("Hi");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator("#contact-subject-error")).toHaveText("Enter a subject with at least 3 characters.");
  await expect(page.locator("#contact-message-error")).toHaveText("Enter a message with at least 10 characters.");
  await expect(page.getByLabel("Subject", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("Hi");
  expect(requests).toHaveLength(0);
});

test("optional Email stays optional when Phone is valid", async ({ page }) => {
  const requests = await interceptSubmissions(page);
  await fillContact(page);
  await page.getByLabel("Email", { exact: true }).fill("");
  await page.getByLabel("Phone", { exact: true }).fill("+91 9876543210");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("accepted your enquiry for processing");
  expect(requests).toHaveLength(1);
  expect(requests[0].data).not.toHaveProperty("_replyto");
});

test("failed provider request remains separate from field errors and preserves inputs", async ({ page }) => {
  const requests = await interceptSubmissions(page, 503, { success: true });
  await fillContact(page);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("could not confirm your submission");
  await expect(page.locator(".field-error")).toHaveCount(0);
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Test Customer");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("customer@example.com");
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("Please explain the shipment route.");
  expect(requests).toHaveLength(1);
});
