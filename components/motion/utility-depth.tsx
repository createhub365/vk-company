"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePointerEffects, useReducedMotion } from "./use-reduced-motion";
import "@/styles/utility-depth.css";

function useReadySurface() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    element.dataset.utilityReady = "";
    return () => { delete element.dataset.utilityReady; };
  }, []);
  return root;
}

export function FaqDepth({ children }: { children: ReactNode }) {
  const root = useReadySurface();
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = root.current;
    if (!element || reduced) return;
    const animations = new Map<HTMLElement, Animation>();
    const cancel = (answer: HTMLElement) => {
      animations.get(answer)?.cancel(); animations.delete(answer);
      answer.style.removeProperty("will-change");
    };
    const toggle = (event: Event) => {
      if (!(event.target instanceof HTMLDetailsElement)) return;
      const answer = event.target.querySelector<HTMLElement>(":scope > p");
      if (!answer) return;
      cancel(answer);
      if (!event.target.open) return;
      const css = getComputedStyle(element);
      answer.style.willChange = "transform, opacity";
      const animation = answer.animate([
        { transform: `perspective(${css.getPropertyValue("--perspective").trim()}) rotateX(${css.getPropertyValue("--faq-hinge").trim()})`, opacity: 0 },
        { transform: "none", opacity: 1 },
      ], { duration: parseFloat(css.getPropertyValue("--d-fast")), easing: css.getPropertyValue("--ease-out-expo").trim() });
      animations.set(answer, animation);
      animation.onfinish = () => cancel(answer);
    };
    // Native details owns expansion, focus and keyboard activation. Only the
    // answer's transform/opacity animates; layout height is never interpolated.
    element.addEventListener("toggle", toggle, true);
    return () => { element.removeEventListener("toggle", toggle, true); for (const answer of animations.keys()) cancel(answer); };
  }, [root, reduced]);
  return <div ref={root} className="faq-list faq-depth">{children}</div>;
}

export function FormDepth({ children }: { children: ReactNode }) {
  const root = useReadySurface();
  const pointer = usePointerEffects();
  return <div ref={root} className="form-depth" data-utility-pointer={pointer}>{children}</div>;
}

export function FooterDepth({ children }: { children: ReactNode }) {
  const root = useReadySurface();
  const pointer = usePointerEffects();
  return <div ref={root} className="shell footer-depth" data-utility-pointer={pointer}>{children}</div>;
}
