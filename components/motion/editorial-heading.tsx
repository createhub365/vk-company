"use client";

import { useRef, useState } from "react";
import { HERO_TUNING } from "@/lib/motion/hero-tuning";
import { RiseIn } from "./primitives";
import dynamic from "next/dynamic";
const EditorialHeadingRuntime = dynamic(() => import("./editorial-heading-runtime"), { ssr: false });
export type HeadingReveal = { lines: string[]; clock: number };

export function EditorialHeading({ children, delay = 0 }: { children: string; delay?: number }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [reveal, setReveal] = useState<HeadingReveal | null>(null);
  return <h2 ref={heading}>{reveal ? reveal.lines.map((line, index) =>
    <RiseIn key={index} as="span" className="editorial-heading-line" rise={HERO_TUNING.headline.rise * .6}
      rotate={HERO_TUNING.headline.rotation} duration={HERO_TUNING.headline.duration}
      delay={delay} stagger={HERO_TUNING.headline.stagger} index={index} timelineStart={reveal.clock}>{line}</RiseIn>
  ) : children}<EditorialHeadingRuntime heading={heading} delay={delay} setReveal={setReveal}>{children}</EditorialHeadingRuntime></h2>;
}
