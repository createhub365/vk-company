import Image, { type StaticImageData } from "next/image";
import styles from "./reference-artwork.module.css";

// Display only the artwork region of the supplied reference, never its page UI.
// Coordinates are in source pixels; the original image is kept unmodified.
export function ReferenceArtwork({ source, region, alt, priority = false }: {
  source: StaticImageData;
  region: readonly [number, number, number, number];
  alt: string;
  priority?: boolean;
}) {
  const [left, top, width, height] = region;
  return <div className={styles.frame} style={{ aspectRatio: `${width} / ${height}` }} data-image-feedback="background">
    <Image src={source} alt={alt} unoptimized preload={priority} draggable={false}
      style={{ width: `${source.width / width * 100}%`, left: `${-left / width * 100}%`, top: `${-top / height * 100}%` }}/>
  </div>;
}
