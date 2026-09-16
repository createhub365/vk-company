import { DepthSection, RiseIn, ParallaxMedia } from "@/components/motion/primitives";
import { Photograph, type PhotoName } from "./photograph";
import { QuoteMedia } from "./quote-media";
import type { SceneVariant } from "@/components/three/scene-types";

const imagery: Partial<Record<SceneVariant, { name: PhotoName; alt: string }>> = {
  domestic: { name: "selected-domestic", alt: "Illustrative delivery truck travelling on an intercity road" },
  international: { name: "selected-international", alt: "Illustrative cargo aircraft at an international logistics apron" },
  about: { name: "workspace", alt: "Illustrative parcel dispatch workspace" },
};

export function PageHero({ eyebrow, title, description, variant = "legal" }: { eyebrow: string; title: string; description: string; variant?: SceneVariant }) {
  const image = imagery[variant];
  return <section className={`page-hero page-hero-${variant}`}><DepthSection className="shell page-hero-grid"><RiseIn className="page-hero-copy" immediateIfInView><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></RiseIn>{variant === "quote" ? <QuoteMedia/> : image ? <ParallaxMedia><div className="page-hero-image" data-image-feedback="photo" data-photo-frame="" data-photo-motion="scroll"><Photograph name={image.name} alt={image.alt}  sizes="(max-width: 900px) 100vw, 50vw" eager/></div></ParallaxMedia> : <div className="page-hero-marker" aria-hidden="true"><span>VKC</span><i aria-hidden="true"/></div>}</DepthSection></section>;
}
