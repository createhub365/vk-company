"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame, type FrameData } from "framer-motion";
import { useReducedMotion } from "./use-reduced-motion";
import { useDepthScroll } from "./provider";
import { isScrollLocked, subscribeScrollLock } from "@/lib/motion/scroll-lock";

// Guard against accidental nested providers. Exactly one active Lenis owner.
let owner: Lenis | undefined;
export default function ScrollRuntime() {
  const reduced = useReducedMotion();
  const { scrollY, scrollYProgress } = useDepthScroll();
  useEffect(() => {
    if (owner) return;
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
      if (document.hidden || lenis || owner || (reduced && !isScrollLocked())) return;
      lenis = new Lenis({ lerp: 0.08, autoRaf: false, syncTouch: false, smoothWheel: !reduced, anchors: false,
        // Preserve native form-control scrolling and browser zoom gestures.
        prevent: node => !isScrollLocked() && node.matches("input, textarea, select, [contenteditable='true']"),
        virtualScroll: ({ event }) => !(event instanceof WheelEvent && (event.ctrlKey || event.metaKey))
          && !(typeof TouchEvent !== "undefined" && event instanceof TouchEvent && event.touches.length > 1),
      });
      owner = lenis;
      if (!reduced) document.documentElement.dataset.depthScroll = "smooth";
      lenis.on("scroll", sync);
      sync(lenis);
      // Motion owns the single shared rAF scheduler; Lenis never creates its own loop.
      if (isScrollLocked()) lenis.stop();
      else if (!reduced) frame.update(tick, true);
    }
    function updateLock() {
      if (isScrollLocked()) {
        start();
        lenis?.stop();
        cancelFrame(tick);
      } else if (reduced) stop();
      else {
        start();
        lenis?.start();
        if (lenis) frame.update(tick, true);
      }
    }
    const visibility = () => document.hidden ? stop() : start();
    start();
    const unsubscribeLock = subscribeScrollLock(updateLock);
    document.addEventListener("visibilitychange", visibility);
    return () => { unsubscribeLock(); document.removeEventListener("visibilitychange", visibility); stop(); };
  }, [reduced, scrollY, scrollYProgress]);
  return null;
}
