import { DepthSection, RiseIn, ParallaxMedia } from "@/components/motion/primitives";
import { Photograph } from "./photograph";
import styles from "./service-process.module.css";

const processes = {
  domestic: [
    { title: "Begin with the real shipment details.", text: "Provide the origin and destination, package count, approximate weight, contents and preferred dispatch date. We use those details to assess the available next step.", photo: "selected-domestic-1", alt: "Illustration of a domestic shipment quotation form on a laptop beside a parcel" },
    { title: "Review before commitment.", text: "A submitted enquiry is not a booking. The team will prepare a quote with relevant service details, estimates, inclusions, exclusions, currency and validity date. Your booking is created only after acceptance.", photo: "selected-domestic-2", alt: "Illustration of a courier and customer reviewing paperwork at a doorstep" },
    { title: "We move it with care.", text: "Once confirmed, your shipment is handed over to our operational team and moves through our domestic network. You can reach out for updates whenever required.", photo: "selected-domestic-3", alt: "Illustration of a VK AND COMPANY delivery truck travelling through a city" },
  ],
  international: [
    { title: "Route and contents review.", text: "Share accurate origin, destination, contents, package count, weight and dimensions where known. This supports an initial acceptance and availability review.", photo: "selected-international-1", alt: "Illustration of aircraft cargo loading with a world map and the words From India to the World" },
    { title: "Documentation is shipment-specific.", text: "Required documentation and restrictions depend on the route and parcel. The team will explain confirmed requirements for your shipment; this website does not substitute generic claims for that review.", photo: "selected-international-2", alt: "Illustrative export-document checklist beside a passport and globe; actual requirements depend on the shipment" },
    { title: "Clear quotation boundaries.", text: "Charges, estimates, inclusions and exclusions appear in the quote for the reviewed route. Times, routes and partner handling are subject to change based on operational factors and destination requirements.", photo: "selected-international-3", alt: "Illustration of a cargo ship, aircraft and delivery truck at an international port" },
  ],
} as const;

export function ServiceProcess({ kind }: { kind: keyof typeof processes }) {
  return <section className={styles.section} aria-labelledby={`${kind}-process`}>
    <DepthSection className={styles.inner}>
      <h2 className="eyebrow" id={`${kind}-process`}><RiseIn as="span" style={{ display: "block" }} immediateIfInView>{kind} process</RiseIn></h2>
      <div className={styles.rows}>
        {processes[kind].map(row => <article key={row.title} className={styles.row}>
          <ParallaxMedia className={styles.media}><div className={styles.image} data-service-tilt-boundary=""><div className="service-photo" data-image-feedback="photo" data-photo-frame="" data-photo-motion="scroll" data-service-tilt=""><Photograph name={row.photo} alt={row.alt} sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1236px) 52vw, 625px"/></div></div></ParallaxMedia>
          <RiseIn className={styles.copy} immediateIfInView><h3>{row.title}</h3><p>{row.text}</p></RiseIn>
        </article>)}
      </div>
    </DepthSection>
  </section>;
}
