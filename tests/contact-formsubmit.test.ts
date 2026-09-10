// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SupportForm } from "@/components/forms/support-form";

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;
const values = { name: "Customer Name", phone: "+91 9876543210", email: "customer@example.com",
  subject: "Shipment Support", message: "Please explain the shipment route." };
const endpoint = "https://formsubmit.co/ajax/vkandcompanymohali@gmail.com";
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "NOTIFICATION_FROM_EMAIL",
    "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) vi.stubEnv(key, undefined);
  // Every request is intercepted; no network, SMTP or activation is possible.
  fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: "true" }) });
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div"); document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove();
  vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers();
});
async function mount(overrides: Record<string, string | undefined> = {}) {
  await act(async () => root.render(createElement(SupportForm)));
  const form = container.querySelector("form")!;
  for (const [name, value] of Object.entries({ ...values, ...overrides })) {
    const field = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
    // Tampered select values still exercise the existing input validator.
    if (field instanceof HTMLSelectElement && !Array.from(field.options).some(option => option.value === value)) {
      field.add(new Option(value ?? "", value ?? ""));
    }
    field.value = value ?? "";
  }
  return form;
}
async function submit(form: HTMLFormElement) {
  await act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
}
function expectRetained(form: HTMLFormElement) {
  for (const [name, value] of Object.entries(values)) expect((form.elements.namedItem(name) as HTMLInputElement).value).toBe(value);
}

describe("Contact FormSubmit AJAX (credentials unset; mocked requests only)", () => {
  it("uses the fixed AJAX endpoint, subject, Reply-To and all reference-design fields", async () => {
    const form = await mount();
    await submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(endpoint);
    expect(options).toMatchObject({ method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" } });
    expect(JSON.parse(options.body)).toEqual({ ...values, shipmentReference: "",
      _subject: "VK AND COMPANY — New Contact Enquiry", _replyto: values.email, _honey: "" });
    expect(container.querySelector('[role="status"]')?.textContent).toContain("does not confirm inbox delivery");
    expect((form.elements.namedItem("name") as HTMLInputElement).value).toBe("");
  });

  it("does not forward injected recipient, headers, auto-replies or captcha overrides", async () => {
    const form = await mount();
    for (const name of ["recipient", "_subject", "_replyto", "_cc", "_autoresponse", "_captcha", "_webhook"]) {
      const input = document.createElement("input"); input.name = name; input.value = "attacker@example.com"; form.append(input);
    }
    await submit(form);
    expect(fetchMock.mock.calls[0][0]).toBe(endpoint);
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload._replyto).toBe(values.email);
    expect(payload._subject).toBe("VK AND COMPANY — New Contact Enquiry");
    for (const name of ["recipient", "_cc", "_autoresponse", "_captcha", "_webhook"]) expect(payload).not.toHaveProperty(name);
  });

  it("preserves phone-only contact validation and omits empty Reply-To", async () => {
    await submit(await mount({ email: "" }));
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.phone).toBe(values.phone);
    expect(payload).not.toHaveProperty("_replyto");
  });

  it("treats a whitespace-only optional phone as empty when email is valid", async () => {
    const form = await mount({ phone: "   " });
    await submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.phone).toBe("");
    expect(payload.shipmentReference).toBe("");
    expect(payload._replyto).toBe(values.email);
  });

  it.each([{ name: "x" }, { email: "invalid" }, { phone: "", email: "" }, { subject: "x" }, { message: "short" },
    { website: "bot" }, { message: "x".repeat(3001) }, { email: "customer@example.com\r\nBcc: attacker@example.com" }])("validates before requesting", async invalid => {
    await submit(await mount(invalid));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(container.querySelector('[role="status"]')?.textContent).toContain("website" in invalid ? "could not validate" : "Please check");
  });

  it("shows a specific invalid-email error, focuses Email and preserves all inputs", async () => {
    const form = await mount({ email: "invalid" });
    await submit(form);
    const email = form.elements.namedItem("email") as HTMLInputElement;
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(email.getAttribute("aria-describedby")).toContain("contact-email-error");
    expect(container.querySelector("#contact-email-error")?.textContent).toBe("Enter a valid email address, such as name@example.com.");
    expect(document.activeElement).toBe(email);
    expect(email.value).toBe("invalid");
    expect((form.elements.namedItem("message") as HTMLTextAreaElement).value).toBe(values.message);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains Subject and Message minimums and focuses the first invalid visible field", async () => {
    const form = await mount({ subject: "Hi", message: "Hi" });
    await submit(form);
    expect(container.querySelector("#contact-subject-error")?.textContent).toBe("Enter a subject with at least 3 characters.");
    expect(container.querySelector("#contact-message-error")?.textContent).toBe("Enter a message with at least 10 characters.");
    expect(document.activeElement).toBe(form.elements.namedItem("subject"));
    expect((form.elements.namedItem("subject") as HTMLInputElement).value).toBe("Hi");
    expect((form.elements.namedItem("message") as HTMLTextAreaElement).value).toBe("Hi");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears input errors when corrected but keeps a failed provider request separate", async () => {
    const form = await mount({ subject: "Hi" });
    await submit(form);
    (form.elements.namedItem("subject") as HTMLInputElement).value = values.subject;
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ success: true }) });
    await submit(form);
    expect(container.querySelectorAll('[aria-invalid="true"]')).toHaveLength(0);
    expect(container.querySelectorAll(".field-error")).toHaveLength(0);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("could not confirm");
    expectRetained(form);
  });

  it.each([false, "false", undefined])("does not treat HTTP 200 with success=%s as success", async success => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success }) });
    const form = await mount(); await submit(form);
    expectRetained(form);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("could not confirm");
    expect(container.querySelector("button")?.disabled).toBe(false);
  });

  it("retains inputs after HTTP failure even with success=true in the body", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ success: true }) });
    const form = await mount(); await submit(form); expectRetained(form);
  });

  it("retains inputs when FormSubmit reports that activation is needed", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: "false", message: "Please activate this form" }) });
    const form = await mount(); await submit(form); expectRetained(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(["network", "json"])("retains inputs after %s failure without retrying automatically", async failure => {
    if (failure === "network") fetchMock.mockRejectedValue(new Error("offline"));
    else fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new Error("non-JSON response"); } });
    const form = await mount(); await submit(form); expectRetained(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("may have been accepted");
  });

  it("keeps loading state until the response and prevents immediate duplicate clicks", async () => {
    let resolve!: (value: unknown) => void;
    fetchMock.mockReturnValue(new Promise(value => { resolve = value; }));
    const form = await mount();
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(container.querySelector("button")?.disabled).toBe(true); expectRetained(form);
    await act(async () => { resolve({ ok: true, json: async () => ({ success: true }) }); });
    expect(container.querySelector("button")?.disabled).toBe(false);
    expect((form.elements.namedItem("message") as HTMLTextAreaElement).value).toBe("");
  });

  it("aborts a stalled request, retains inputs and releases the loading state", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    const form = await mount(); await submit(form);
    await act(async () => { await vi.advanceTimersByTimeAsync(20_000); });
    expectRetained(form);
    expect(container.querySelector("button")?.disabled).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("limits repeated submissions in the current form session", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ success: false }) });
    const form = await mount();
    for (let i = 0; i < 7; i++) await submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(6); expectRetained(form);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Too many attempts");
  });
});
