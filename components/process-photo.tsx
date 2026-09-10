import Image from "next/image";

const photographs = {
  review: {
    src: "/media/process/review.jpg",
    alt: "A courier and customer reviewing delivery paperwork together on a clipboard",
    width: 1200,
    height: 800,
  },
  dispatch: {
    src: "/media/process/dispatch.jpg",
    alt: "Two delivery workers loading cardboard parcels into the back of a van",
    width: 1200,
    height: 800,
  },
  scan: {
    src: "/media/process/scan.jpg",
    alt: "A handheld barcode scanner reading the label on a cardboard parcel",
    width: 1080,
    height: 570,
  },
  internationalReview: {
    src: "/media/international/shipment-review.jpg",
    alt: "A courier reviewing shipment details with a customer beside packed parcels",
    width: 1600,
    height: 900,
  },
  internationalCargo: {
    src: "/media/international/air-cargo-loading.jpg",
    alt: "Air cargo containers being loaded into a wide-body aircraft at an airport",
    width: 1600,
    height: 1200,
  },
};

export function ProcessPhoto({ action, sizes }: {
  action: keyof typeof photographs;
  sizes: string;
}) {
  const { alt, ...image } = photographs[action];
  return (
    // The existing ripple-only treatment keeps hands, documents and labels in frame.
    <div className="process-photo" data-image-feedback="background">
      <Image {...image} alt={alt} sizes={sizes}/>
    </div>
  );
}
