"use client";

import { useRef, useState } from "react";
import { contactFormSchema, zodErrors } from "@/lib/schemas";

const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/vkandcompanymohali@gmail.com";
const CONTACT_SUBJECT = "VK AND COMPANY — New Contact Enquiry";
const UNCONFIRMED = "We could not confirm your submission. It may have been accepted. Please check with the company before resubmitting.";

function FieldError({ name, errors }: { name: string; errors: Record<string, string> }) {
  return errors[name] ? <span className="field-error" id={`contact-${name}-error`}>{errors[name]}</span> : null;
}

export function SupportForm() {
  const submitting = useRef(false);
  const attempts = useRef<number[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending,setPending]=useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result,setResult]=useState<{ok:boolean;message:string;reference?:string}|null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const parsed = contactFormSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const fields = zodErrors(parsed.error);
      setErrors(fields);
      setResult({ ok: false, message: fields.website || "Please check the highlighted fields." });
      const firstInvalid = Array.from(form.elements).find(element =>
        (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)
        && element.name !== "website" && fields[element.name]);
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }
    setErrors({});
    const now = Date.now();
    attempts.current = attempts.current.filter(time => time > now - 15 * 60_000);
    if (attempts.current.length >= 6) {
      setResult({ ok: false, message: "Too many attempts. Please wait 15 minutes before trying again." });
      return;
    }
    const value = parsed.data;
    // Whitelist fields: never forward customer-supplied FormSubmit settings.
    const payload = {
      name: value.name, email: value.email || "", phone: value.phone || "", message: value.message,
      subject: value.subject, shipmentReference: value.shipmentReference || "",
      _subject: CONTACT_SUBJECT, _honey: value.website,
      ...(value.email ? { _replyto: value.email } : {}),
    };
    submitting.current = true;
    attempts.current.push(now);
    setPending(true); setResult(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const body: unknown = await response.json();
      const success = typeof body === "object" && body !== null && "success" in body
        && (body.success === true || body.success === "true");
      if (!response.ok || !success) {
        setResult({ ok: false, message: UNCONFIRMED });
        return;
      }
      setResult({ ok: true, message: "FormSubmit accepted your enquiry for processing. This does not confirm inbox delivery." });
      formRef.current?.reset();
    } catch {
      setResult({ ok: false, message: UNCONFIRMED });
    } finally {
      clearTimeout(timeout);
      submitting.current = false; setPending(false);
    }
  }
  const fieldProps = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": [name === "email" ? "contact-details-hint" : "", errors[name] ? `contact-${name}-error` : ""].filter(Boolean).join(" ") || undefined,
  });
  return <form className="form-panel" ref={formRef} onSubmit={submit} noValidate>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1}/></label></div>
    <div className="form-grid">
      <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required minLength={2} maxLength={120} {...fieldProps("name")}/><FieldError name="name" errors={errors}/></div>
      <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" minLength={7} maxLength={32} {...fieldProps("phone")}/><FieldError name="phone" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="email">Email</label><input id="email" name="email" type="email" maxLength={254} {...fieldProps("email")}/><small id="contact-details-hint">Provide an email or phone number so the team can respond.</small><FieldError name="email" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="subject">Subject</label><input id="subject" name="subject" required minLength={3} maxLength={160} {...fieldProps("subject")}/><FieldError name="subject" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="shipmentReference">Shipment reference <small>(optional)</small></label><input id="shipmentReference" name="shipmentReference" maxLength={64} {...fieldProps("shipmentReference")}/><FieldError name="shipmentReference" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="message">Message</label><textarea id="message" name="message" required minLength={10} maxLength={3000} {...fieldProps("message")}/><FieldError name="message" errors={errors}/></div>
    </div>
    {result&&<div className={`form-status ${result.ok?"":"error"}`} role="status">{result.message}{result.reference&&<><br/><strong>Reference: {result.reference}</strong></>}</div>}
    <button className="button" disabled={pending}>{pending?"Sending…":"Send message"}</button>
  </form>;
}
