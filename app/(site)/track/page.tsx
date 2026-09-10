import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = { title: "Shipment update enquiry" };

export default function ShipmentUpdatePage() {
  return <>
    <PageHero eyebrow="Shipment support" title="Shipment update enquiry" description="Contact the company for an update on your shipment. Please include your shipment reference so the team can help."/>
    <section className="section"><div className="shell"><div className="form-panel">
      <h2>Ask about your shipment.</h2>
      <p className="lede">Online shipment lookup is unavailable. Contact VK AND COMPANY by phone or email, or use the Contact form. Include your shipment reference in your message.</p>
      <p><a className="text-link" href="tel:+919317724056"><Phone size={19} aria-hidden="true"/> +91 93177 24056</a></p>
      <p><a className="text-link" style={{ overflowWrap: "anywhere" }} href="mailto:vkandcompanymohali@gmail.com"><Mail size={19} aria-hidden="true"/> vkandcompanymohali@gmail.com</a></p>
      <Link className="button" href="/contact">Contact the team</Link>
    </div></div></section>
  </>;
}
