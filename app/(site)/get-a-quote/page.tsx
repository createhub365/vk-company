import { DepthSection, RiseIn } from "@/components/motion/primitives";
import { FormDepth } from "@/components/motion/utility-depth";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { EnquiryForm } from "@/components/forms/enquiry-form";
export const metadata:Metadata={title:"Request a quote",description:"Share your route and parcel details with VK AND COMPANY for a reviewed courier quotation."};
export default function QuotePage(){return <><PageHero variant="quote" eyebrow="Quotation request" title="Tell us about your shipment." description="Share the route and parcel details below. Our team will review the information before confirming service and charges."/><section className="section"><DepthSection className="shell form-shell"><aside className="side-note"><RiseIn immediateIfInView><p className="eyebrow">Before you begin</p><h2>Details make the difference.</h2><p>Approximate information is fine where requested. Accurate contents, weight and route details help the team assess the shipment.</p><p>Pickup requests are not currently enabled.</p></RiseIn></aside><FormDepth><EnquiryForm/></FormDepth></DepthSection></section></>}
