import artwork from "@/public/media/international/image.png";
import { ReferenceArtwork } from "./reference-artwork";
import styles from "./service-process.module.css";

const processes = {
  domestic: [
    { title: "Begin with the real shipment details.", text: "Provide the origin and destination, package count, approximate weight, contents and preferred dispatch date. We use those details to assess the available next step.", region: [38, 144, 392, 248], alt: "Illustration of a domestic shipment quotation form on a laptop beside a parcel" },
    { title: "Review before commitment.", text: "A submitted enquiry is not a booking. The team will prepare a quote with relevant service details, estimates, inclusions, exclusions, currency and validity date. Your booking is created only after acceptance.", region: [38, 432, 392, 254], alt: "Illustration of a courier and customer reviewing paperwork at a doorstep" },
    { title: "We move it with care.", text: "Once confirmed, your shipment is handed over to our operational team and moves through our domestic network. You can reach out for updates whenever required.", region: [38, 724, 392, 254], alt: "Illustration of a VK AND COMPANY delivery truck travelling through a city" },
  ],
  international: [
    { title: "Route and contents review.", text: "Share accurate origin, destination, contents, package count, weight and dimensions where known. This supports an initial acceptance and availability review.", region: [814, 144, 392, 248], alt: "Illustration of aircraft cargo loading with a world map and the words From India to the World" },
    { title: "Documentation is shipment-specific.", text: "Required documentation and restrictions depend on the route and parcel. The team will explain confirmed requirements for your shipment; this website does not substitute generic claims for that review.", region: [814, 432, 392, 254], alt: "Illustrative export-document checklist beside a passport and globe; actual requirements depend on the shipment" },
    { title: "Clear quotation boundaries.", text: "Charges, estimates, inclusions and exclusions appear in the quote for the reviewed route. Times, routes and partner handling are subject to change based on operational factors and destination requirements.", region: [814, 724, 392, 254], alt: "Illustration of a cargo ship, aircraft and delivery truck at an international port" },
  ],
} as const;

export function ServiceProcess({ kind }: { kind: keyof typeof processes }) {
  return <section className={styles.section} aria-labelledby={`${kind}-process`}>
    <div className={styles.inner}>
      <h2 className="eyebrow" id={`${kind}-process`}>{kind} process</h2>
      <div className={styles.rows}>
        {processes[kind].map(row => <article key={row.title} className={styles.row}>
          <div className={styles.image}><ReferenceArtwork source={artwork} region={row.region} alt={row.alt}/></div>
          <div className={styles.copy}><h3>{row.title}</h3><p>{row.text}</p></div>
        </article>)}
      </div>
    </div>
  </section>;
}
