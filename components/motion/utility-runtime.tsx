"use client";

import { useEffect, type RefObject } from "react";
import { usePointerEffects, useReducedMotion } from "./use-reduced-motion";
function activateSurface(element: HTMLDivElement, kind: "faq" | "form" | "footer", pointer: boolean) {
  element.dataset.utilityReady = "";
  if (kind !== "faq") element.dataset.utilityPointer = String(pointer);
  return () => { delete element.dataset.utilityReady; if (kind !== "faq") element.dataset.utilityPointer = "false"; };
}
export default function UtilityRuntime({ root, kind }: { root: RefObject<HTMLDivElement | null>; kind: "faq" | "form" | "footer" }) {
  const reduced = useReducedMotion();
  const pointer = usePointerEffects();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    return activateSurface(element, kind, pointer);
  }, [root, kind, pointer]);
  useEffect(() => {
    const element = root.current;
    if (!element || reduced || kind !== "faq") return;
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
  }, [root, reduced, kind]);
  return null;
}
