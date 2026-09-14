import { Photograph } from "./photograph";

const photographs = {
  details: { name: "details", alt: "Illustrative parcel being weighed and measured" },
  review: { name: "process-review", alt: "A courier and customer reviewing delivery paperwork together on a clipboard" },
  dispatch: { name: "process-dispatch", alt: "Two delivery workers loading cardboard parcels into the back of a van" },
  scan: { name: "process-scan", alt: "A handheld barcode scanner reading the label on a cardboard parcel" },
} as const;

export function ProcessPhoto({ action, sizes }: {
  action: keyof typeof photographs; sizes: string;
}) {
  return <div className={`process-photo process-photo-${action}`} data-image-feedback="photo" data-photo-frame="">
    <Photograph {...photographs[action]} sizes={sizes} loading="eager"/>
  </div>;
}
