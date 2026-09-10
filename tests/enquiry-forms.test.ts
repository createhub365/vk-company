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
      for (const [name, value] of Object.entries({ phone: "+91 9876543210", originCountry: "India", originCity: "Mohali", originPostalCode: "140301", destinationCountry: "India", destinationCity: "Delhi", destinationPostalCode: "110001", contentsDescription: "Printed documents", approximateWeight: "1.5" })) {
        (form.elements.namedItem(name) as HTMLInputElement).value = value;
      }
      return form;
    }
    async function submit(form: HTMLFormElement) {
      await act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    }
    it.each([false, "false", undefined])("retains inputs on provider success=%s", async success => {
      fetchMock.mockResolvedValue({ status: 200, json: async () => ({ success }) });
      const form = await mount();
      await submit(form);
      expect((form.elements.namedItem("name") as HTMLInputElement).value).toBe("Customer Kept");
      expect((form.elements.namedItem("email") as HTMLInputElement).value).toBe("customer@example.com");
      expect(container.querySelector('[role="status"]')?.textContent).toContain(success === undefined ? "may have been accepted" : "did not accept");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      await submit(form);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      for (const [url, options] of fetchMock.mock.calls) {
        expect(url).toBe("https://formsubmit.co/ajax/vkandcompanymohali@gmail.com");
        expect(JSON.parse(options.body)).not.toHaveProperty("idempotencyKey");
      }
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
      await act(async () => { resolve({ status: 200, json: async () => ({ success: "true" }) }); });
      expect((form.elements.namedItem("name") as HTMLInputElement).value).toBe("");
      expect(container.querySelector("button")?.disabled).toBe(false);
    });
  });
}
