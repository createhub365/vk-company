import type { Metadata } from "next";
import { Photograph } from "@/components/photograph";
import { CalendarCheck, FileText, PackageCheck, Route } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { QuoteBand } from "@/components/quote-band";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about VK AND COMPANY's enquiry-led domestic and international courier service.",
};

const services = [
  { label: "Shipment Details", Icon: FileText },
  { label: "Route Review", Icon: Route },
  { label: "Booking Support", Icon: CalendarCheck },
  { label: "Shipment Updates", Icon: PackageCheck },
];

export default function AboutPage() {
  return <>
    <PageHero variant="about" eyebrow="About VK AND COMPANY" title="Courier arrangements built around each shipment." description="VK AND COMPANY provides domestic and international courier services through a clear enquiry, quotation and booking process."/>
    <section className="section section-white about-what-we-do">
      <div className="shell about-what-grid">
        <div className="about-what-visual">
          <p className="eyebrow">What we do</p>
          <p className="about-what-tagline">Connecting People &amp; Possibilities</p>
          <div className="about-network-image" data-image-feedback="photo" data-photo-frame="">
            <Photograph name="dispatch" sizes="(max-width: 900px) 100vw, 40vw" alt="Illustrative courier team loading parcels for dispatch"/>
          </div>
          <ul className="about-service-strip" aria-label="Service process">
            {services.map(({ label, Icon }) => <li key={label}><Icon aria-hidden="true"/><span>{label}</span></li>)}
          </ul>
        </div>

        <div className="about-what-content">
          <section className="about-what-row">
            <div className="about-thumbnail" data-image-feedback="photo" data-photo-frame="">
              <Photograph name="details" sizes="277px" alt="Illustrative parcel being weighed and measured"/>
            </div>
            <div className="prose"><h2>A straightforward customer journey.</h2><p>Customers share their shipment details, receive a reviewed offer, arrange a booking and follow genuine shipment updates. Support requests remain connected to the operational team when questions arise.</p></div>
          </section>
          <section className="about-what-row">
            <div className="about-thumbnail" data-image-feedback="photo" data-photo-frame="">
              <Photograph name="review" sizes="277px" alt="Illustrative courier and customer reviewing shipment details"/>
            </div>
            <div className="prose"><h2>Careful about what is confirmed.</h2><p>We do not publish invented coverage, courier partners, guarantees or rate cards. Service facts are confirmed for the route and shipment details provided.</p></div>
          </section>
          <section className="about-what-row">
            <div className="about-thumbnail" data-image-feedback="photo" data-photo-frame="">
              <Photograph name="support" sizes="277px" alt="Illustrative customer support representative wearing a headset"/>
            </div>
            <div className="prose"><h2>Prepared to connect.</h2><p>Shipment updates are maintained manually by the team. The application has a defined boundary for approved courier integrations when partners and credentials are supplied.</p></div>
          </section>
          <p className="about-purpose"><span aria-hidden="true"/>Delivered with Purpose</p>
        </div>
      </div>
    </section>
    <QuoteBand/>
  </>;
}
