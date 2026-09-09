"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

type Result = { ok: boolean; message: string; reference?: string; fields?: Record<string,string>; notificationStatus?: string };

function FieldError({ name, errors }: { name: string; errors: Record<string,string> }) {
  return errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
}

export function EnquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const key = useRef(crypto.randomUUID());
  const submitting = useRef(false);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true); setResult(null);
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(form.entries());
    payload.idempotencyKey = key.current;
    payload.pickupRequested = false;
    try {
      const response = await fetch("/api/enquiries", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(payload) });
      const body = await response.json() as Result;
      setResult(body);
      if (response.ok && body.ok && body.notificationStatus === "accepted") { formRef.current?.reset(); key.current = crypto.randomUUID(); }
    } catch { setResult({ ok:false, message:"We could not confirm sending. Your email may have been accepted. Please check with the company before resubmitting." }); }
    finally { submitting.current = false; setPending(false); }
  }
  const errors = result?.fields || {};
  const fieldProps = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });
  return <form className="form-panel" ref={formRef} onSubmit={submit} noValidate>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <fieldset className="form-section"><legend>Your details</legend><div className="form-grid">
      <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required {...fieldProps("name")}/><FieldError name="name" errors={errors}/></div>
      <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Include country code" required {...fieldProps("phone")}/><FieldError name="phone" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="email">Email <small>(optional)</small></label><input id="email" name="email" type="email" autoComplete="email" {...fieldProps("email")}/><FieldError name="email" errors={errors}/></div>
    </div></fieldset>
    <fieldset className="form-section"><legend>Route</legend><div className="form-grid">
      <div className="field"><label htmlFor="originCountry">Origin country</label><input id="originCountry" name="originCountry" autoComplete="country-name" required {...fieldProps("originCountry")}/><FieldError name="originCountry" errors={errors}/></div>
      <div className="field"><label htmlFor="originCity">Origin city</label><input id="originCity" name="originCity" autoComplete="address-level2" required {...fieldProps("originCity")}/><FieldError name="originCity" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="originPostalCode">Origin postal code</label><input id="originPostalCode" name="originPostalCode" autoComplete="postal-code" required {...fieldProps("originPostalCode")}/><FieldError name="originPostalCode" errors={errors}/></div>
      <div className="field"><label htmlFor="destinationCountry">Destination country</label><input id="destinationCountry" name="destinationCountry" required {...fieldProps("destinationCountry")}/><FieldError name="destinationCountry" errors={errors}/></div>
      <div className="field"><label htmlFor="destinationCity">Destination city</label><input id="destinationCity" name="destinationCity" required {...fieldProps("destinationCity")}/><FieldError name="destinationCity" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="destinationPostalCode">Destination postal code</label><input id="destinationPostalCode" name="destinationPostalCode" required {...fieldProps("destinationPostalCode")}/><FieldError name="destinationPostalCode" errors={errors}/></div>
    </div></fieldset>
    <fieldset className="form-section"><legend>Shipment</legend><div className="form-grid">
      <div className="field field-full"><label htmlFor="contentsDescription">Contents description</label><textarea id="contentsDescription" name="contentsDescription" required {...fieldProps("contentsDescription")}/><small>Be clear about the actual contents; acceptance is confirmed after review.</small><FieldError name="contentsDescription" errors={errors}/></div>
      <div className="field"><label htmlFor="packageCount">Number of packages</label><input id="packageCount" name="packageCount" type="number" min="1" defaultValue="1" required {...fieldProps("packageCount")}/><FieldError name="packageCount" errors={errors}/></div>
      <div className="field"><label htmlFor="approximateWeight">Approximate weight</label><div style={{display:"grid",gridTemplateColumns:"1fr 85px",gap:8}}><input id="approximateWeight" name="approximateWeight" type="number" min="0.001" step="0.001" required {...fieldProps("approximateWeight")}/><select name="weightUnit" aria-label="Weight unit"><option value="kg">kg</option><option value="lb">lb</option></select></div><FieldError name="approximateWeight" errors={errors}/></div>
      <div className="field"><label htmlFor="dimensions">Dimensions <small>(when known)</small></label><input id="dimensions" name="dimensions" placeholder="L × W × H" {...fieldProps("dimensions")}/><FieldError name="dimensions" errors={errors}/></div>
      <div className="field"><label htmlFor="dimensionUnit">Dimension unit</label><select id="dimensionUnit" name="dimensionUnit"><option value="cm">centimetres</option><option value="in">inches</option></select></div>
      <div className="field field-full"><label htmlFor="preferredDispatchDate">Preferred dispatch date <small>(not guaranteed)</small></label><input id="preferredDispatchDate" name="preferredDispatchDate" type="date" {...fieldProps("preferredDispatchDate")}/><FieldError name="preferredDispatchDate" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="instructions">Additional instructions</label><textarea id="instructions" name="instructions" {...fieldProps("instructions")}/><FieldError name="instructions" errors={errors}/></div>
    </div></fieldset>
    <p className="notice">Submitting this form creates an enquiry. It does not confirm a quote, booking, pickup or dispatch.</p>
    {result && <div className={`form-status ${result.ok ? "" : "error"}`} role="status">{result.message}{result.reference && <><br/><strong>Reference: {result.reference}</strong></>}</div>}
    <button className="button" type="submit" disabled={pending}>{pending ? "Submitting…" : <>Send quote request <Send size={17}/></>}</button>
  </form>;
}
