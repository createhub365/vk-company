import { DepthSection, RiseIn } from "@/components/motion/primitives";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function QuoteBand() {
  return <section className="section"><DepthSection className="shell quote-band"><RiseIn immediateIfInView><p className="eyebrow" style={{ color: "#76c4d0" }}>Start with the shipment details</p><h2>Let’s work out the right next step for your parcel.</h2><p>No instant estimates without an approved rate card. Our team reviews each request before making an offer.</p></RiseIn><div className="band-action"><Link prefetch={false} href="/get-a-quote" className="button">Request a quote <ArrowUpRight size={18} /></Link></div></DepthSection></section>;
}
