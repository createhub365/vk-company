import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ServiceProcess } from "@/components/service-process";
import { QuoteBand } from "@/components/quote-band";

export const metadata: Metadata = {
  title: "International courier services",
  description: "Discuss international courier acceptance, documentation and charges with VK AND COMPANY.",
};

export default function InternationalPage() {
  return <>
    <PageHero
      variant="international"
      eyebrow="International courier enquiries"
      title="Across borders, with the details checked first."
      description="International shipment requirements vary by contents, origin and destination. We review each enquiry before confirming what can be arranged."
    />
    <ServiceProcess kind="international"/>
    <QuoteBand/>
  </>;
}
