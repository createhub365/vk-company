import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box, CircleCheck, FileText, MapPin, Search } from "lucide-react";
import { FaqList } from "@/components/faq-list";
import { ProcessPhoto } from "@/components/process-photo";

export default function HomePage() {
  return <>
    <section className="cinematic-hero" data-image-feedback="background">
      <Image
        className="cinematic-hero-background"
        src="/media/domestic-courier-road.png"
        fill
        sizes="(max-aspect-ratio: 1744/902) 194vh, 100vw"
        alt="Teal and navy courier truck travelling on an intercity road"
        preload
      />
      <div className="shell cinematic-hero-content">
        <div className="cinematic-copy" data-image-feedback-foreground>
          <p className="eyebrow">Domestic & international courier services</p>
          <h1>Across cities.<br/><em>Across borders.</em></h1>
          <p className="cinematic-support">We keep your parcels moving.</p>
          <p className="lede">Domestic and international courier services from VK AND COMPANY. Share your shipment details and let our team help arrange the next step.</p>
          <div className="hero-actions"><Link className="button button-teal" href="/get-a-quote">Get a quote <ArrowRight size={18}/></Link><Link className="button button-ghost" href="/track">Track shipment</Link></div>
        </div>
      </div>
    </section>

    <section className="editorial-section section-white" id="domestic-services">
      <div className="shell editorial-grid">
        <div className="editorial-image" data-image-feedback="photo"><Image src="/media/domestic-road.png" fill sizes="(max-width: 800px) 100vw, 58vw" alt="Illustrative unbranded delivery truck travelling on a modern intercity road" priority={false}/><span>Illustrative route imagery</span></div>
        <div className="editorial-copy"><p className="section-index">01 / Domestic</p><p className="eyebrow">Courier services between cities</p><h2>Planned around your actual route.</h2><p>Share the origin, destination and parcel details. We review availability and prepare an offer for the specific shipment—without making blanket coverage or timing claims.</p><Link href="/services/domestic" className="text-link">Explore domestic services <ArrowRight size={16}/></Link></div>
      </div>
    </section>

    <section className="editorial-section international-feature">
      <div className="shell editorial-grid editorial-grid-reverse">
        {/* Reuse ripple-only feedback so the full aircraft stays in frame. */}
        <div className="editorial-image international-aircraft" data-image-feedback="background"><Image src="/media/homepage-international-cargo.jpg" width={2400} height={1600} sizes="(max-width: 900px) 100vw, 41vw" alt="Antonov An-124 cargo aircraft above Lviv airport, with nose, tail and both wingtips in frame"/><span>Illustrative international logistics</span></div>
        <div className="editorial-copy"><p className="section-index">02 / International</p><p className="eyebrow">Across borders, details first</p><h2>Clear before it leaves the ground.</h2><p>Acceptance, documentation, availability and charges depend on the route and parcel. Our team confirms what applies before anything is arranged.</p><Link href="/services/international" className="text-link">Explore international services <ArrowRight size={16}/></Link></div>
      </div>
    </section>

    <section className="process-flow">
      <div className="shell"><div className="section-head"><div><p className="eyebrow">How shipping works</p><h2>Four steps.<br/>One clear process.</h2></div><p>Every status follows a real operational action. An enquiry is never presented as a confirmed booking or dispatch.</p></div>
        <ol className="process-list">
          <li><span>01</span><FileText/><h3>Share shipment details</h3><p>Tell us the route, contents, package count and approximate weight.</p></li>
          <li><ProcessPhoto action="review" sizes="(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw"/><span>02</span><CircleCheck/><h3>Receive a reviewed quote</h3><p>Service details, inclusions and exclusions are confirmed for the enquiry.</p></li>
          <li><ProcessPhoto action="dispatch" sizes="(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw"/><span>03</span><Box/><h3>Arrange dispatch</h3><p>An accepted quote becomes a booking ready for coordination.</p></li>
          <li><ProcessPhoto action="scan" sizes="(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw"/><span>04</span><MapPin/><h3>Follow verified updates</h3><p>Use your public code to see customer-safe shipment events.</p></li>
        </ol>
      </div>
    </section>

    <section className="action-entry section-white">
      <div className="shell action-entry-grid">
        <article><span className="action-number">01</span><Box/><p className="eyebrow">Start with the shipment</p><h2>Request a considered quote.</h2><p>Share the details once. Our team reviews each request before confirming service or charges.</p><Link href="/get-a-quote" className="button">Get a quote <ArrowRight size={17}/></Link></article>
        <article><span className="action-number">02</span><Search/><p className="eyebrow">Already booked?</p><h2>View verified tracking.</h2><p>Enter the public tracking code issued for your shipment. No account or invented live location is required.</p><Link href="/track" className="button button-secondary">Track shipment <ArrowRight size={17}/></Link></article>
      </div>
    </section>

    <section className="editorial-section company-feature">
      <div className="shell editorial-grid">
        <div className="editorial-image" data-image-feedback="photo"><Image src="/media/dispatch-workspace.png" fill sizes="(max-width: 800px) 100vw, 58vw" alt="Illustrative modern parcel dispatch workspace"/><span>Illustrative operations environment</span></div>
        <div className="editorial-copy"><p className="section-index">03 / Company</p><p className="eyebrow">About VK AND COMPANY</p><h2>Built around each shipment.</h2><p>Our customer journey is straightforward: share the details, receive a reviewed offer, arrange a booking and follow genuine updates.</p><Link href="/about" className="text-link">More about our process <ArrowRight size={16}/></Link></div>
      </div>
    </section>

    <section className="homepage-faq section-white"><div className="shell"><div className="section-head"><div><p className="eyebrow">Common questions</p><h2>Useful answers,<br/>before you send.</h2></div><Link href="/faq" className="text-link">View all FAQs <ArrowRight size={16}/></Link></div><FaqList limit={4}/></div></section>

    <section className="contact-finale"><div className="shell contact-finale-inner"><div><p className="eyebrow">Contact & support</p><h2>Need help with the next step?</h2><p>Send a secure general or shipment-related enquiry for the team to review.</p></div><Link href="/contact" className="button button-teal">Contact the team <ArrowRight size={17}/></Link></div></section>
  </>;
}
