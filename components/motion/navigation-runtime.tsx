"use client";

import { useEffect, type RefObject } from "react";
import { cancelFrame, frame } from "framer-motion";
import { useDepthScroll } from "./provider";
import { useReducedMotion } from "./use-reduced-motion";

export default function NavigationRuntime({ navigation, open, onScrolledChange }: {
  navigation: RefObject<HTMLElement | null>; open: boolean; onScrolledChange: (scrolled: boolean) => void;
}) {
  const { scrollY } = useDepthScroll();
  const reduced = useReducedMotion();
  useEffect(() => {
    let previous = false;
    const update = (value: number) => {
      const next = value > 80;
      if (next !== previous) { previous = next; onScrolledChange(next); }
    };
    const initialize = () => update(window.scrollY);
    frame.read(initialize);
    const unsubscribe = scrollY.on("change", update);
    return () => { cancelFrame(initialize); unsubscribe(); };
  }, [scrollY, onScrolledChange]);

  useEffect(() => {
    const element = navigation.current;
    if (!element) return;
    const rest = () => element.style.removeProperty("will-change");
    rest();
    if (!open) return;
    const start = (event: AnimationEvent) => {
      if (event.target === element) element.style.willChange = event.animationName === "nav-fade-in" ? "opacity" : "transform, opacity";
    };
    const finish = (event: AnimationEvent) => { if (event.target === element) rest(); };
    element.addEventListener("animationstart", start);
    element.addEventListener("animationend", finish);
    element.addEventListener("animationcancel", finish);
    return () => {
      element.removeEventListener("animationstart", start);
      element.removeEventListener("animationend", finish);
      element.removeEventListener("animationcancel", finish);
      rest();
    };
  }, [navigation, open, reduced]);
  return null;
}
