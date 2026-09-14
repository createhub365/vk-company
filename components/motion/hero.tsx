"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DepthSection, RiseIn } from "./primitives";
import { HERO_TUNING } from "@/lib/motion/hero-tuning";
import "@/styles/hero.css";

const HeroRuntime = dynamic(() => import("./hero-runtime"), { ssr: false });
const EntranceClock = createContext<number | null>(null);

export function HeroMotion({ image, children }: { image: ReactNode; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const style = {
    "--hero-back-scale": HERO_TUNING.depth.backScale,
    "--hero-emphasis-base": `${HERO_TUNING.depth.emphasis}px`,
    "--hero-mid-overscan": `${HERO_TUNING.pointer.limit}px`,
  } as CSSProperties;
  return <EntranceClock.Provider value={startedAt}>
    <DepthSection className="hero-depth" style={style}>
      <div className="hero-stage" ref={stage} data-depth-motion="hero-stage">
        <div className="hero-back" data-hero-plane="back" data-depth-motion="hero-plane" aria-hidden="true"/>
        <div className="hero-mid" data-hero-plane="mid" data-depth-motion="hero-plane">{image}</div>
        {children}
      </div>
      <HeroRuntime stageRef={stage} onEntranceStart={setStartedAt}/>
    </DepthSection>
  </EntranceClock.Provider>;
}

export function HeroFollow({ children, kind }: { children: ReactNode; kind: "support" | "cta" }) {
  const startedAt = useContext(EntranceClock);
  const afterHeadline = HERO_TUNING.headline.duration + HERO_TUNING.headline.stagger + HERO_TUNING.headline.emphasisDelay;
  return <RiseIn className={`hero-follow hero-follow-${kind}`} enabled={startedAt !== null} timelineStart={startedAt ?? undefined}
    rise={HERO_TUNING.follow.rise} rotate={HERO_TUNING.follow.rotation}
    duration={HERO_TUNING.follow.duration} delay={afterHeadline + (kind === "cta" ? HERO_TUNING.follow.ctaDelay : 0)}>
    {children}
  </RiseIn>;
}
