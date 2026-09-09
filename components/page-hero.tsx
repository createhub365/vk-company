import Image from "next/image";
import type { SceneVariant } from "@/components/three/scene-types";

const imagery: Partial<Record<SceneVariant, { src: string; alt: string }>> = {
  domestic: { src: "/media/domestic-road.png", alt: "Illustrative delivery truck travelling on an intercity road" },
  international: { src: "/media/international-cargo-apron.png", alt: "Illustrative cargo aircraft at an international logistics apron" },
  about: { src: "/media/dispatch-workspace.png", alt: "Illustrative parcel dispatch workspace" },
};

export function PageHero({ eyebrow, title, description, variant = "legal" }: { eyebrow: string; title: string; description: string; variant?: SceneVariant }) {
  const image = imagery[variant];
  return <section className={`page-hero page-hero-${variant}`}><div className="shell page-hero-grid"><div className="page-hero-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></div>{image ? <div className="page-hero-image" data-image-feedback="photo"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 50vw"/><span>Illustrative courier environment</span></div> : <div className="page-hero-marker" aria-hidden="true"><span>VKC</span><i/></div>}</div></section>;
}
