import type { CSSProperties } from "react";
import manifest from "@/lib/photographs.json";

export type PhotoName = keyof typeof manifest;

// Browser-selected local files work on Pages without a runtime image optimizer.
export function Photograph({ name, alt, sizes, className, style, eager = false, loading }: {
  name: PhotoName; alt: string; sizes: string; className?: string;
  style?: CSSProperties; eager?: boolean; loading?: "eager" | "lazy";
}) {
  const photo = manifest[name];
  // Static srcSet variants are compressed at build time by prepare-photographs.mjs.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/media/photos/${name}-${photo.width}.webp`}
    srcSet={photo.widths.map(width => `/media/photos/${name}-${width}.webp ${width}w`).join(", ")}
    sizes={sizes} width={photo.width} height={photo.height} alt={alt}
    className={className} style={style} loading={loading ?? (eager ? "eager" : "lazy")}
    fetchPriority={eager ? "high" : undefined} decoding="async" data-illustrative="true"/>;
}
