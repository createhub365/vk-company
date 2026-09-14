"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame, type FrameData } from "framer-motion";
import { useReducedMotion } from "./use-reduced-motion";
import { useDepthScroll } from "./provider";

// Guard against accidental nested providers. Exactly one active Lenis owner.
let owner: Lenis | undefined;
export default function ScrollRuntime() {
  const reduced = useReducedMotion();
  const { scrollY, scrollYProgress } = useDepthScroll();
  useEffect(() => {
    if (reduced || owner) return;
    let lenis: Lenis | undefined;
    const sync = (instance: Lenis) => {
      scrollY.set(instance.animatedScroll);
      scrollYProgress.set(instance.progress);
    };
    const tick = ({ timestamp }: FrameData) => lenis?.raf(timestamp);
    function stop() {
      cancelFrame(tick);
      if (lenis) { lenis.off("scroll", sync); lenis.destroy(); if (owner === lenis) owner = undefined; lenis = undefined; }
      delete document.documentElement.dataset.depthScroll;
    }
    function start() {
      if (document.hidden || lenis || owner) return;
      lenis = new Lenis({ lerp: 0.08, autoRaf: false, syncTouch: false, smoothWheel: true, anchors: false,
        // Preserve native form-control scrolling and browser zoom gestures.
        prevent: node => node.matches("input, textarea, select, [contenteditable='true']"),
        virtualScroll: ({ event }) => !(event instanceof WheelEvent && (event.ctrlKey || event.metaKey)),
      });
      owner = lenis;
      document.documentElement.dataset.depthScroll = "smooth";
      lenis.on("scroll", sync);
      sync(lenis);
      // Motion owns the single shared rAF scheduler; Lenis never creates its own loop.
      frame.update(tick, true);
    }
    const visibility = () => document.hidden ? stop() : start();
    start();
    document.addEventListener("visibilitychange", visibility);
    return () => { document.removeEventListener("visibilitychange", visibility); stop(); };
  }, [reduced, scrollY, scrollYProgress]);
  return null;
}
