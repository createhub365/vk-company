import { ProcessSequence } from "@/components/motion/process-sequence";
import { HeroMotion, HeroFollow } from "@/components/motion/hero";
import { DepthSection, ParallaxMedia, RiseIn } from "@/components/motion/primitives";
import { EditorialHeading } from "@/components/motion/editorial-heading";
import "@/styles/editorial-depth.css";
import { Photograph } from "@/components/photograph";
import Link from "next/link";
import { ArrowRight, Box, CircleCheck, FileText, MapPin } from "lucide-react";
import { FaqList } from "@/components/faq-list";
import { ProcessPhoto } from "@/components/process-photo";

export default function HomePage() {
  return <>
    <section className="cinematic-hero hero-motion" data-image-feedback="background">
      <HeroMotion image={<Photograph
        className="cinematic-hero-background"
        name="selected-home-hero"
        sizes="100vw"
        alt="Illustrative navy and teal courier truck at an Indian delivery forecourt"
        eager
      />}>
      <div className="shell cinematic-hero-content">
        <div className="cinematic-copy" data-image-feedback-foreground data-hero-plane="front" data-depth-motion="hero-plane">
          <p className="eyebrow">Domestic & international courier services</p>
          <h1><span className="hero-line" data-hero-line="cities" data-depth-motion="hero-line">Across cities.</span><br/><em className="hero-line hero-line-borders" data-hero-line="borders" data-depth-motion="hero-line">Across borders.</em></h1>
          <HeroFollow kind="support"><p className="cinematic-support">We keep your parcels moving.</p></HeroFollow>
          <p className="lede">Domestic and international courier services from VK AND COMPANY. Share your shipment details and let our team help arrange the next step.</p>
          <HeroFollow kind="cta"><div className="hero-actions"><Link className="button button-teal" href="/get-a-quote">Get a quote <ArrowRight size={18}/></Link></div></HeroFollow>
        </div>
      </div>
      </HeroMotion>
    </section>

    <section className="editorial-section section-white editorial-motion" id="domestic-services" data-editorial-lead="image">
      <DepthSection className="shell editorial-grid">
        <ParallaxMedia className="editorial-media"><RiseIn className="editorial-image-enter" rise={0} rotate={0} duration={400} immediateIfInView>
          <div className="editorial-image" data-image-feedback="photo" data-photo-frame="" data-photo-motion="scroll"><Photograph name="selected-domestic" sizes="(max-width: 800px) 100vw, 58vw" alt="Illustrative delivery truck travelling on an intercity road"/><span>Illustrative route imagery</span></div>
        </RiseIn></ParallaxMedia>
        <div className="editorial-copy editorial-text-plane"><RiseIn className="editorial-text-enter" fromX={12} rise={0} rotate={0} fade={false} duration={400} delay={90} immediateIfInView>
          <p className="section-index">01 / Domestic</p><p className="eyebrow">Courier services between cities</p><EditorialHeading delay={90}>Planned around your actual route.</EditorialHeading>
          <RiseIn className="editorial-prose" rise={16} rotate={0} duration={400} delay={90} immediateIfInView><p>Share the origin, destination and parcel details. We review availability and prepare an offer for the specific shipment—without making blanket coverage or timing claims.</p></RiseIn>
          <Link href="/services/domestic" className="text-link">Explore domestic services <ArrowRight size={16}/></Link>
        </RiseIn></div>
      </DepthSection>
    </section>

    <section className="editorial-section international-feature editorial-motion" data-editorial-lead="text">
      <DepthSection className="shell editorial-grid editorial-grid-reverse">
        {/* The complete aircraft and its frame move together. */}
        <ParallaxMedia className="editorial-media"><RiseIn className="editorial-image-enter" rise={0} rotate={0} duration={400} delay={90} immediateIfInView>
          <div className="editorial-image international-aircraft" data-image-feedback="photo" data-photo-frame="" data-photo-motion="scroll"><Photograph name="existing-aircraft" sizes="(max-width: 900px) 100vw, 41vw" alt="Antonov An-124 cargo aircraft above Lviv airport, with nose, tail and both wingtips in frame"/><span>Illustrative international logistics</span></div>
        </RiseIn></ParallaxMedia>
        <div className="editorial-copy editorial-text-plane"><RiseIn className="editorial-text-enter" fromX={-12} rise={0} rotate={0} fade={false} duration={400} immediateIfInView>
          <p className="section-index">02 / International</p><p className="eyebrow">Across borders, details first</p><EditorialHeading>Clear before it leaves the ground.</EditorialHeading>
          <RiseIn className="editorial-prose" rise={16} rotate={0} duration={400} immediateIfInView><p>Acceptance, documentation, availability and charges depend on the route and parcel. Our team confirms what applies before anything is arranged.</p></RiseIn>
          <Link href="/services/international" className="text-link">Explore international services <ArrowRight size={16}/></Link>
        </RiseIn></div>
      </DepthSection>
    </section>

    <section className="process-flow">
      <div className="shell"><div className="section-head"><div><p className="eyebrow">How shipping works</p><h2>Four steps.<br/>One clear process.</h2></div><p>Every status follows a real operational action. An enquiry is never presented as a confirmed booking or dispatch.</p></div>
        <ProcessSequence>
          <li><ProcessPhoto action="details" sizes="(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw"/><span>01</span><FileText/><h3>Share shipment details</h3><p>Tell us the route, contents, package count and approximate weight.</p></li>
          <li><ProcessPhoto action="review" sizes="(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw"/><span>02</span><CircleCheck/><h3>Receive a reviewed quote</h3><p>Service details, inclusions and exclusions are confirmed for the enquiry.</p></li>
          <li><ProcessPhoto action="dispatch" sizes="(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw"/><span>03</span><Box/><h3>Arrange dispatch</h3><p>An accepted quote becomes a booking ready for coordination.</p></li>
          <li><ProcessPhoto action="scan" sizes="(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw"/><span>04</span><MapPin/><h3>Follow verified updates</h3><p>Contact the team for customer-safe shipment updates.</p></li>
        </ProcessSequence>
      </div>
    </section>

    <section className="action-entry section-white">
      <div className="shell action-entry-grid">
        <article><span className="action-number">01</span><Box/><p className="eyebrow">Start with the shipment</p><h2>Request a considered quote.</h2><p>Share the details once. Our team reviews each request before confirming service or charges.</p><Link href="/get-a-quote" className="button">Get a quote <ArrowRight size={17}/></Link></article>
      </div>
    </section>

    <section className="editorial-section company-feature">
      <div className="shell editorial-grid">
        <div className="editorial-image" data-image-feedback="photo" data-photo-frame=""><Photograph name="workspace" sizes="(max-width: 800px) 100vw, 58vw" alt="Illustrative modern parcel dispatch workspace"/><span>Illustrative operations environment</span></div>
        <div className="editorial-copy"><p className="section-index">03 / Company</p><p className="eyebrow">About VK AND COMPANY</p><h2>Built around each shipment.</h2><p>Our customer journey is straightforward: share the details, receive a reviewed offer, arrange a booking and follow genuine updates.</p><Link href="/about" className="text-link">More about our process <ArrowRight size={16}/></Link></div>
      </div>
    </section>

    <section className="homepage-faq section-white"><div className="shell"><div className="section-head"><div><p className="eyebrow">Common questions</p><h2>Useful answers,<br/>before you send.</h2></div><Link href="/faq" className="text-link">View all FAQs <ArrowRight size={16}/></Link></div><FaqList limit={4}/></div></section>

    <section className="contact-finale"><div className="shell contact-finale-inner"><div><p className="eyebrow">Contact & support</p><h2>Need help with the next step?</h2><p>Send a secure general or shipment-related enquiry for the team to review.</p></div><Link href="/contact" className="button button-teal">Contact the team <ArrowRight size={17}/></Link></div></section>
  </>;
}
