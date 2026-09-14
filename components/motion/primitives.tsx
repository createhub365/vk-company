"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cancelFrame, frame } from "framer-motion";
import { clamp, readDepthTokens } from "@/lib/motion/tokens";
import { useDepthScroll } from "./provider";
import { useMobileDepth, useReducedMotion } from "./use-reduced-motion";

type PresentationStyle = Omit<CSSProperties, "transform" | "translate" | "rotate" | "scale" | "opacity" | "willChange" | "animation" | "transition">;
type Props = { children: ReactNode; className?: string; id?: string; style?: PresentationStyle };

export function DepthSection({ children, className = "", ...props }: Props) {
  return <div {...props} className={`depth-section ${className}`}>{children}</div>;
}

export function RiseIn({ children, className = "", rise, rotate, stagger = 0, index = 0, delay = 0, duration, enabled = true, timelineStart, ...props }: Props & {
  rise?: number; rotate?: number; stagger?: number; index?: number; delay?: number; duration?: number; enabled?: boolean; timelineStart?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const entered = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || reduced || !enabled || entered.current) return;
    const tokens = readDepthTokens(element);
    const distance = clamp(rise ?? tokens.rise, 0, tokens.rise);
    const rotation = clamp(rotate ?? tokens.rotation, 0, tokens.rotation);
    // Stagger is in milliseconds; hero sequences can share a document-timeline clock.
    const delayLimit = parseFloat(getComputedStyle(element).getPropertyValue("--d-slow"));
    const startDelay = clamp(delay + stagger * Math.max(0, Number.isFinite(index) ? index : 0), 0, delayLimit);
    const durationMs = duration === undefined ? tokens.duration : clamp(duration, 0, tokens.duration);
    let animation: Animation | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const settle = () => { animation?.cancel(); element.style.removeProperty("will-change"); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      entered.current = true;
      observer.disconnect();
      const frames = [
        { transform: `translateY(${distance}px) rotateX(${rotation}deg)`, opacity: 0 },
        { transform: "none", opacity: 1 },
      ];
      if (timelineStart !== undefined) {
        // Backwards fill is enabled only by a post-hydration sequence. SSR stays final.
        animation = element.animate(frames, { duration: durationMs, delay: startDelay, easing: tokens.easing, fill: "backwards" });
        animation.startTime = timelineStart;
        animation.onfinish = settle;
        timer = setTimeout(() => { element.style.willChange = "transform, opacity"; }, Math.max(0, timelineStart + startDelay - Number(document.timeline.currentTime)));
      } else {
        timer = setTimeout(() => {
          if (!element.isConnected || document.hidden) return;
          element.style.willChange = "transform, opacity";
          animation = element.animate(frames, { duration: durationMs, easing: tokens.easing, fill: "none" });
          animation.onfinish = settle;
        }, startDelay);
      }
    });
    observer.observe(element);
    return () => { observer.disconnect(); clearTimeout(timer); settle(); };
  }, [reduced, rise, rotate, stagger, index, delay, duration, enabled, timelineStart]);
  return <div {...props} ref={ref} className={className} data-depth-motion="rise">{children}</div>;
}

export function ParallaxMedia({ children, className = "", ...props }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useMobileDepth();
  const { scrollY } = useDepthScroll();
  useEffect(() => {
    const viewport = outer.current, element = inner.current;
    if (!viewport || !element || reduced) return;
    let visible = false;
    let last = "";
    let next = "";
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tokens = readDepthTokens(element);
    const rest = () => element.style.removeProperty("will-change");
    const render = () => {
      if (last === next) return;
      element.style.willChange = "transform";
      element.style.transform = next;
      last = next;
      clearTimeout(timer); timer = setTimeout(rest, tokens.rest);
    };
    const measure = () => {
      if (!visible || document.hidden) return;
      // Measure the stationary outer wrapper, never the transformed image plane.
      const bounds = viewport.getBoundingClientRect();
      const progress = clamp((innerHeight - bounds.top) / (innerHeight + bounds.height), 0, 1);
      const eased = tokens.ease(progress);
      const z = tokens.from + (tokens.to - tokens.from) * eased;
      const scale = tokens.scaleFrom + (tokens.scaleTo - tokens.scaleFrom) * eased;
      next = `translateZ(${z}px) scale(${scale})`;
      frame.render(render);
    };
    const schedule = () => frame.read(measure);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); else { cancelFrame(measure); cancelFrame(render); rest(); } });
    observer.observe(viewport);
    const resize = new ResizeObserver(schedule); resize.observe(viewport);
    const unsubscribe = scrollY.on("change", schedule);
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      unsubscribe(); observer.disconnect(); resize.disconnect(); window.removeEventListener("resize", schedule);
      cancelFrame(measure); cancelFrame(render); clearTimeout(timer); rest(); element.style.removeProperty("transform");
    };
  }, [reduced, mobile, scrollY]);
  return <div {...props} ref={outer} className={`parallax-media ${className}`}><div ref={inner} data-depth-motion="parallax">{children}</div></div>;
}
