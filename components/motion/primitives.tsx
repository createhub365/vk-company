"use client";

import dynamic from "next/dynamic";
import { useRef, type CSSProperties, type ReactNode } from "react";

const RiseRuntime = dynamic(() => import("./primitives-runtime").then(module => module.RiseRuntime), { ssr: false });
const ParallaxRuntime = dynamic(() => import("./primitives-runtime").then(module => module.ParallaxRuntime), { ssr: false });
type PresentationStyle = Omit<CSSProperties, "transform" | "translate" | "rotate" | "scale" | "opacity" | "willChange" | "animation" | "transition">;
type Props = { children: ReactNode; className?: string; id?: string; style?: PresentationStyle };
export type RiseOptions = {
  rise?: number; rotate?: number; fromX?: number; fade?: boolean; immediateIfInView?: boolean;
  stagger?: number; index?: number; delay?: number; duration?: number; enabled?: boolean; timelineStart?: number;
};

export function DepthSection({ children, className = "", ...props }: Props) {
  return <div {...props} className={`depth-section ${className}`}>{children}</div>;
}

export function RiseIn({ children, className = "", as: Element = "div", rise, rotate, fromX, fade, immediateIfInView, stagger, index, delay, duration, enabled, timelineStart, ...props }: Props & RiseOptions & { as?: "div" | "span" }) {
  const element = useRef<HTMLElement | null>(null);
  return <Element {...props} ref={node => { element.current = node; }} className={className} data-depth-motion="rise">
    {children}
    <RiseRuntime elementRef={element} options={{ rise, rotate, fromX, fade, immediateIfInView, stagger, index, delay, duration, enabled, timelineStart }}/>
  </Element>;
}

export function ParallaxMedia({ children, className = "", ...props }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  return <div {...props} ref={outer} className={`parallax-media ${className}`}>
    <div ref={inner} data-depth-motion="parallax">{children}</div>
    <ParallaxRuntime outer={outer} inner={inner}/>
  </div>;
}
