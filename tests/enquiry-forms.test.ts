// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EnquiryForm } from "@/components/forms/enquiry-form";

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

for (const [label, component] of [["quote", EnquiryForm]] as const) {
  describe(`${label} form retry behavior`, () => {
    async function mount() {
      await act(async () => root.render(createElement(component)));
      const form = container.querySelector("form")!;
      (form.elements.namedItem("name") as HTMLInputElement).value = "Customer Kept";
      (form.elements.namedItem("email") as HTMLInputElement).value = "customer@example.com";
      return form;
    }
    async function submit(form: HTMLFormElement) {
      await act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    }
    it.each(["not_configured", "rejected", "uncertain"])("retains inputs and submission key on %s", async status => {
      fetchMock.mockResolvedValue({ ok: false, json: async () => ({ ok: false, notificationStatus: status, message: "Email sending could not be confirmed." }) });
      const form = await mount();
      await submit(form);
      expect((form.elements.namedItem("name") as HTMLInputElement).value).toBe("Customer Kept");
      expect((form.elements.namedItem("email") as HTMLInputElement).value).toBe("customer@example.com");
      expect(container.querySelector('[role="status"]')?.textContent).toContain("could not be confirmed");
      await submit(form);
      const keys = fetchMock.mock.calls.map(call => JSON.parse(call[1].body).idempotencyKey);
      expect(keys[0]).toBe(keys[1]);
    });
    it("retains inputs and gives an uncertain-status message after a lost response", async () => {
      fetchMock.mockRejectedValue(new Error("connection lost"));
      const form = await mount();
      await submit(form);
      expect((form.elements.namedItem("name") as HTMLInputElement).value).toBe("Customer Kept");
      expect(container.querySelector('[role="status"]')?.textContent).toContain("may have been accepted");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    it("blocks duplicate clicks immediately and clears inputs only after accepted success", async () => {
      let resolve!: (value: unknown) => void;
      fetchMock.mockReturnValue(new Promise(value => { resolve = value; }));
      const form = await mount();
      await act(async () => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(container.querySelector("button")?.disabled).toBe(true);
      expect((form.elements.namedItem("name") as HTMLInputElement).value).toBe("Customer Kept");
      await act(async () => { resolve({ ok: true, json: async () => ({ ok: true, notificationStatus: "accepted", message: "Sending server accepted." }) }); });
      expect((form.elements.namedItem("name") as HTMLInputElement).value).toBe("");
      expect(container.querySelector("button")?.disabled).toBe(false);
    });
  });
}
