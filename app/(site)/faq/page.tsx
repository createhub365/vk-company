import { DepthSection, RiseIn } from "@/components/motion/primitives";
import type { Metadata } from "next";import { PageHero } from "@/components/page-hero";import { FaqList } from "@/components/faq-list";import { QuoteBand } from "@/components/quote-band";
export const metadata:Metadata={title:"Frequently asked questions",description:"Answers about courier enquiries, quotations and booking with VK AND COMPANY."};
export default function FaqPage(){return <><PageHero variant="faq" eyebrow="Frequently asked questions" title="Answers before you send." description="Useful guidance about our enquiry-led courier workflow."/><section className="section section-white"><DepthSection className="shell"><RiseIn immediateIfInView><FaqList/></RiseIn></DepthSection></section><QuoteBand/></>}
