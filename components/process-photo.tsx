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
