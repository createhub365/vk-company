"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cancelFrame, frame, useSpring } from "framer-motion";
import { HERO_TUNING as tuning } from "@/lib/motion/hero-tuning";
import { subscribeSharedPointer } from "@/lib/motion/shared-pointer";
import { clamp, readDepthTokens } from "@/lib/motion/tokens";
import { useDepthScroll } from "./provider";
import { useMobileDepth, usePointerEffects, useReducedMotion } from "./use-reduced-motion";

type Props = { stageRef: RefObject<HTMLDivElement | null>; onEntranceStart: (time: number) => void };
export default function HeroRuntime({ stageRef, onEntranceStart }: Props) {
  const reduced = useReducedMotion();
  const pointerEnabled = usePointerEffects();
  const mobile = useMobileDepth();
  const { scrollY } = useDepthScroll();
  const x = useSpring(0, tuning.spring), y = useSpring(0, tuning.spring);
  const entered = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;
    if (entered.current) return;
    entered.current = true;
    const lines = [...stage.querySelectorAll<HTMLElement>("[data-hero-line]")];
    const easing = readDepthTokens(stage).easing;
    const emphasis = tuning.depth.emphasis * parseFloat(getComputedStyle(stage).getPropertyValue("--hero-depth-factor"));
    const animations: Animation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const clock = Number(document.timeline.currentTime ?? performance.now());
    onEntranceStart(clock);
    // Exactly the two existing typographic lines. The <br> and original <em> stay intact.
    lines.forEach((line, index) => {
      const z = index === 1 ? emphasis : 0;
      const delay = index * tuning.headline.stagger + (index === 1 ? tuning.headline.emphasisDelay : 0);
      const animation = line.animate([
        { transform: `translateY(${tuning.headline.rise}px) rotateX(${tuning.headline.rotation}deg) translateZ(${z}px)`, opacity: 0 },
        { transform: `translateY(0px) rotateX(0deg) translateZ(${z}px)`, opacity: 1 },
      ], { duration: tuning.headline.duration, delay, easing, fill: "backwards" });
      animation.startTime = clock;
      animations.push(animation);
      timers.push(setTimeout(() => { line.style.willChange = "transform, opacity"; }, delay));
      animation.onfinish = () => line.style.removeProperty("will-change");
    });
    return () => { timers.forEach(clearTimeout); animations.forEach(animation => animation.cancel()); lines.forEach(line => line.style.removeProperty("will-change")); };
  }, [reduced, stageRef, onEntranceStart]);

  useEffect(() => {
    const stage = stageRef.current, section = stage?.closest<HTMLElement>(".cinematic-hero");
    if (!stage || !section || reduced) return;
    const planes = ["back", "mid", "front"].map(name => stage.querySelector<HTMLElement>(`[data-hero-plane="${name}"]`)!);
    const weights = [tuning.pointer.backWeight, tuning.pointer.midWeight, tuning.pointer.frontWeight];
    const mobileFactor = mobile ? 0.5 : 1;
    const restDuration = readDepthTokens(stage).rest;
    let progress = 0, lastProgress = -1, lastX = NaN, lastY = NaN;
    let scrollRest: ReturnType<typeof setTimeout> | undefined;
    let pointerRest: ReturnType<typeof setTimeout> | undefined;
    const restPointer = () => planes.forEach(plane => plane.style.removeProperty("will-change"));
    const restScroll = () => stage.style.removeProperty("will-change");
    const render = () => {
      if (progress !== lastProgress) {
        stage.style.willChange = "transform, opacity";
        // No spring, easing, or transition here: one-to-one with the actual scrollbar.
        stage.style.transform = progress === 0 ? "none" : `translateZ(${tuning.depth.scrollEnd * mobileFactor * progress}px)`;
        stage.style.opacity = String(1 + (tuning.depth.opacityEnd - 1) * progress);
        stage.dataset.heroProgress = String(progress);
        lastProgress = progress;
        clearTimeout(scrollRest); scrollRest = setTimeout(restScroll, restDuration);
      }
      const px = pointerEnabled ? clamp(x.get(), -tuning.pointer.limit, tuning.pointer.limit) : 0;
      const py = pointerEnabled ? clamp(y.get(), -tuning.pointer.limit, tuning.pointer.limit) : 0;
      if (px !== lastX || py !== lastY) {
        planes.forEach((plane, i) => {
          if (px || py) plane.style.willChange = "transform";
          plane.style.setProperty("--hero-pointer-x", `${px * weights[i]}px`);
          plane.style.setProperty("--hero-pointer-y", `${py * weights[i]}px`);
        });
        lastX = px; lastY = py;
        clearTimeout(pointerRest); pointerRest = setTimeout(restPointer, restDuration);
      }
    };
    const renderPointer = () => frame.render(render);
    const measure = () => {
      const box = section.getBoundingClientRect();
      const origin = Math.max(0, box.top + window.scrollY);
      progress = clamp((window.scrollY - origin) / box.height, 0, 1);
      if (box.bottom <= 0 || box.top >= innerHeight) { x.set(0); y.set(0); }
      frame.render(render);
    };
    const schedule = () => frame.read(measure);
    const unsubscribeScroll = scrollY.on("change", schedule);
    const unsubscribeX = x.on("change", renderPointer), unsubscribeY = y.on("change", renderPointer);
    const unsubscribePointer = subscribeSharedPointer(point => {
      if (!pointerEnabled || !point || !section.contains(point.target)) { x.set(0); y.set(0); return; }
      const box = section.getBoundingClientRect();
      x.set(clamp((point.x - box.left) / box.width * 2 - 1, -1, 1) * tuning.pointer.limit);
      y.set(clamp((point.y - box.top) / box.height * 2 - 1, -1, 1) * tuning.pointer.limit);
    });
    const resize = new ResizeObserver(schedule); resize.observe(section);
    if (!pointerEnabled) { x.jump(0); y.jump(0); }
    schedule();
    return () => {
      unsubscribeScroll(); unsubscribeX(); unsubscribeY(); unsubscribePointer(); resize.disconnect();
      cancelFrame(measure); cancelFrame(render); clearTimeout(scrollRest); clearTimeout(pointerRest);
      x.stop(); y.stop(); x.jump(0); y.jump(0);
      restPointer(); restScroll();
      stage.style.removeProperty("transform"); stage.style.removeProperty("opacity"); delete stage.dataset.heroProgress;
      planes.forEach(plane => { plane.style.removeProperty("--hero-pointer-x"); plane.style.removeProperty("--hero-pointer-y"); });
    };
  }, [reduced, pointerEnabled, mobile, stageRef, scrollY, x, y]);
  return null;
}
