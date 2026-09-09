import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function QuoteBand() {
  return <section className="section"><div className="shell quote-band"><div><p className="eyebrow" style={{ color: "#76c4d0" }}>Start with the shipment details</p><h2>Let’s work out the right next step for your parcel.</h2><p>No instant estimates without an approved rate card. Our team reviews each request before making an offer.</p></div><div className="band-action"><Link href="/get-a-quote" className="button">Request a quote <ArrowUpRight size={18} /></Link></div></div></section>;
}
