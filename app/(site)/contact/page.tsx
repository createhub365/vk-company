import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SupportForm } from "@/components/forms/support-form";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a courier or delivery support enquiry to VK AND COMPANY.",
};

export default async function ContactPage() {
  const settings = await getPublicBusinessSettings();
  const whatsappDigits = settings.whatsapp?.replace(/\D/g, "");
  return <>
    <PageHero variant="contact" eyebrow="Contact & support" title="How can we help?" description="Send a general question or ask about a shipment. Your message will be saved for the team to review."/>
    <section className="section">
      <div className="shell form-shell">
        <aside className={`side-note ${styles.details}`} aria-label="Company contact details">
          <p className="eyebrow">Contact channels</p>
          <h2>Contact VK AND COMPANY.</h2>
          <p><a className={`text-link ${styles.link}`} href="tel:+919317724056"><Phone size={19} className={styles.icon} aria-hidden="true"/><span className={styles.value}>+91 93177 24056</span></a></p>
          <p><a className={`text-link ${styles.link}`} href="mailto:vkandcompanymohali@gmail.com"><Mail size={19} className={styles.icon} aria-hidden="true"/><span className={styles.value}>vkandcompanymohali@gmail.com</span></a></p>
          {whatsappDigits && <p><a className="text-link" href={`https://wa.me/${whatsappDigits}`} rel="noopener noreferrer">WhatsApp</a></p>}
          {settings.address && <p>{settings.mapUrl ? <a className="text-link" href={settings.mapUrl} rel="noopener noreferrer">{settings.address}</a> : settings.address}</p>}
          {settings.operatingHours && <p>{settings.operatingHours}</p>}
        </aside>
        <SupportForm/>
      </div>
    </section>
  </>;
}
