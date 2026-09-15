"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cancelFrame, frame } from "framer-motion";
import { clamp } from "@/lib/motion/tokens";
import { processProgress, processStepWeight } from "@/lib/motion/process-progress";
import { useDepthScroll } from "./provider";
import { useMobileDepth, useReducedMotion } from "./use-reduced-motion";
import "@/styles/process-depth.css";

export function ProcessSequence({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<SVGSVGElement>(null);
  const { scrollY } = useDepthScroll();
  const reduced = useReducedMotion();
  const mobile = useMobileDepth();
  useEffect(() => {
    const container = root.current, element = list.current, connector = line.current;
    if (!container || !element || !connector || reduced) return;
    const paths = Array.from(connector.querySelectorAll("line"));
    const steps = Array.from(element.children) as HTMLElement[];
    const css = getComputedStyle(container);
    const activeZ = parseFloat(css.getPropertyValue("--process-active-z"));
    const inactiveZ = parseFloat(css.getPropertyValue("--process-inactive-z"));
    const inactiveOpacity = parseFloat(css.getPropertyValue("--process-inactive-opacity"));
    const restMs = parseFloat(css.getPropertyValue("--d-fast"));
    let progress = 0, last = -1;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const rest = () => steps.forEach(step => step.style.removeProperty("will-change"));
    const render = () => {
      if (progress === last) return;
      last = progress;
      steps.forEach((step, index) => {
        const weight = processStepWeight(progress, index, steps.length);
        step.style.willChange = "transform, opacity";
        step.style.transform = `perspective(var(--perspective)) translateZ(${inactiveZ + (activeZ - inactiveZ) * weight}px)`;
        step.style.opacity = String(inactiveOpacity + (1 - inactiveOpacity) * weight);
        step.style.setProperty("--process-emphasis", String(weight));
      });
      paths.forEach(path => { path.style.strokeDashoffset = String(1 - progress); });
      clearTimeout(timer); timer = setTimeout(rest, restMs);
    };
    const measure = () => {
      if (document.hidden) return;
      // The untransformed wrapper owns all measurements. Transformed step bounds
      // must never feed back into progress or cause active-state flicker.
      const bounds = container.getBoundingClientRect();
      const vertical = getComputedStyle(element).gridTemplateColumns.split(" ").length === 1;
      if (vertical && steps.length > 1) {
        const first = steps[0], final = steps[steps.length - 1];
        const firstCenter = first.offsetTop + first.offsetHeight / 2;
        const lastCenter = final.offsetTop + final.offsetHeight / 2;
        progress = clamp((innerHeight / 2 - bounds.top - firstCenter) / Math.max(1, lastCenter - firstCenter), 0, 1);
      } else {
        progress = processProgress(bounds.top, bounds.height, innerHeight);
      }
      frame.render(render);
    };
    const schedule = () => frame.read(measure);
    const resize = new ResizeObserver(schedule); resize.observe(container);
    const unsubscribe = scrollY.on("change", schedule);
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      unsubscribe(); resize.disconnect(); window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      cancelFrame(measure); cancelFrame(render); clearTimeout(timer); rest();
      steps.forEach(step => { step.style.removeProperty("transform"); step.style.removeProperty("opacity"); step.style.removeProperty("--process-emphasis"); });
      paths.forEach(path => path.style.removeProperty("stroke-dashoffset"));
    };
  }, [scrollY, reduced, mobile]);

  return <div ref={root} className="process-depth">
    <svg ref={line} className="process-connector" aria-hidden="true" focusable="false">
      <line className="process-line-horizontal" x1="0" y1="1" x2="100%" y2="1" pathLength="1"/>
      <line className="process-line-vertical" x1="1" y1="0" x2="1" y2="100%" pathLength="1"/>
    </svg>
    <ol ref={list} className="process-list">{children}</ol>
  </div>;
}
