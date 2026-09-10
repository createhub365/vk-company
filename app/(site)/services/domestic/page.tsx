import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { QuoteBand } from "@/components/quote-band";
import { ServiceProcess } from "@/components/service-process";

export const metadata: Metadata = { title: "Domestic courier services", description: "Request a reviewed domestic courier quote from VK AND COMPANY." };

export default function DomesticPage() {
  return <>
    <PageHero variant="domestic" eyebrow="Domestic courier enquiries" title="A considered route from one city to the next." description="Tell us where your parcel is going and what it contains. Availability, service options, timing and charges are confirmed for the specific shipment."/>
    <ServiceProcess kind="domestic"/>
    <QuoteBand/>
  </>;
}
