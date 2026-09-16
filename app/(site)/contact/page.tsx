import { DepthSection, RiseIn, ParallaxMedia } from "@/components/motion/primitives";
import { FormDepth } from "@/components/motion/utility-depth";
import type { Metadata } from "next";
import { Mail, Phone, Headphones, FileText, Package, Users, MoveDownLeft } from "lucide-react";
import { Photograph } from "@/components/photograph";
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
  return <section className={styles.page}>
      <DepthSection className={styles.layout}>
        <div className={styles.introduction}>
          <h1><RiseIn as="span" style={{ display: "block" }} immediateIfInView>How can we <br/>help?</RiseIn></h1>
          <p className={styles.description}><RiseIn as="span" style={{ display: "block" }} immediateIfInView>Send a general question or ask about a shipment. Your message will be saved for the team to review.</RiseIn></p>
          <p className={styles.tagline}><RiseIn as="span" style={{ display: "block" }} immediateIfInView>Here to Keep <br/>You Moving<MoveDownLeft aria-hidden="true"/></RiseIn></p>
          <ParallaxMedia className={styles.artwork}><div className="service-photo" data-image-feedback="photo" data-photo-frame="" data-photo-motion="scroll"><Photograph name="support" alt="Illustrative Indian courier customer support representative" sizes="(max-width: 900px) calc(100vw - 32px), 50vw" eager/></div></ParallaxMedia>
          <ul className={styles.channels} aria-label="Enquiry topics">
            <li><Headphones aria-hidden="true"/><span>General <br/>Enquiries</span></li>
            <li><FileText aria-hidden="true"/><span>Quote <br/>Requests</span></li>
            <li><Package aria-hidden="true"/><span>Shipment <br/>Support</span></li>
            <li><Users aria-hidden="true"/><span>Partnerships <br/>&amp; Other</span></li>
          </ul>
          <p className={styles.closing}><RiseIn as="span" style={{ display: "block" }} immediateIfInView>From <br/>Your Place to the World</RiseIn></p>
        </div>
        <div className={styles.right}>
        <aside className={styles.details} aria-label="Company contact details">
          <p className="eyebrow">Contact channels</p>
          <h2><RiseIn as="span" style={{ display: "block" }} immediateIfInView>Contact VK AND COMPANY.</RiseIn></h2>
          <p><a className={`text-link ${styles.link}`} href="tel:+919317724056"><Phone size={19} className={styles.icon} aria-hidden="true"/><span className={styles.value}>+91 93177 24056</span></a></p>
          <p><a className={`text-link ${styles.link}`} href="mailto:vkandcompanymohali@gmail.com"><Mail size={19} className={styles.icon} aria-hidden="true"/><span className={styles.value}>vkandcompanymohali@gmail.com</span></a></p>
          {whatsappDigits && <p><a className="text-link" href={`https://wa.me/${whatsappDigits}`} rel="noopener noreferrer">WhatsApp</a></p>}
          {settings.address && <p>{settings.mapUrl ? <a className="text-link" href={settings.mapUrl} rel="noopener noreferrer">{settings.address}</a> : settings.address}</p>}
          {settings.operatingHours && <p>{settings.operatingHours}</p>}
        </aside>
        <div className={styles.formArea}><FormDepth><SupportForm/></FormDepth></div>
        <p className={styles.responseTime}>We usually respond within one business day.</p>
        </div>
      </DepthSection>
    </section>;
}
