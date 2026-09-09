import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { QuoteBand } from "@/components/quote-band";
import { ProcessPhoto } from "@/components/process-photo";

export const metadata: Metadata = { title: "Domestic courier services", description: "Request a reviewed domestic courier quote from VK AND COMPANY." };

const photoSizes = "(max-width: 700px) 90vw, 34vw";

export default function DomesticPage() {
  return <>
    <PageHero variant="domestic" eyebrow="Domestic courier enquiries" title="A considered route from one city to the next." description="Tell us where your parcel is going and what it contains. Availability, service options, timing and charges are confirmed for the specific shipment."/>
    <section className="section section-white">
      <div className="shell domestic-process">
        <p className="eyebrow">Domestic process</p>
        <section className="domestic-process-row">
          <div className="prose"><h2>Begin with the real shipment details.</h2><p>Provide the origin and destination, package count, approximate weight, contents and preferred dispatch date. We use those details to assess the available next step.</p></div>
        </section>
        <section className="domestic-process-row">
          <ProcessPhoto action="review" sizes={photoSizes}/>
          <div className="prose"><h2>Review before commitment.</h2><p>A submitted enquiry is not a booking. The team will prepare a quote with relevant service details, estimates, inclusions, exclusions, currency and validity date. Your booking is created only after acceptance.</p></div>
        </section>
        <section className="domestic-process-row">
          <ProcessPhoto action="scan" sizes={photoSizes}/>
          <div className="prose"><h2>Track verified milestones.</h2><p>When a booking becomes a shipment, you may receive a separate public tracking code. It shows customer-safe events entered by the team and does not imply live GPS visibility.</p><Link href="/track" className="text-link">Track a shipment →</Link></div>
        </section>
        <section className="notice"><strong>Coverage and timing:</strong> No universal service area or guaranteed delivery time is claimed. Both must be confirmed for your requested route.</section>
      </div>
    </section>
    <QuoteBand/>
  </>;
}
