"use client";

import { useEffect, useRef, type RefObject, type Dispatch, type SetStateAction } from "react";
import { HERO_TUNING } from "@/lib/motion/hero-tuning";
import { useReducedMotion } from "./use-reduced-motion";
import type { HeadingReveal } from "./editorial-heading";

// Find the existing visual lines without inserting hard breaks or changing a byte
// of the heading. No duplicate measuring copy or character spans are rendered.
function renderedLines(element: HTMLHeadingElement, text: string) {
  const node = element.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return [text];
  const range = document.createRange();
  const starts = [0];
  let top: number | undefined;
  for (const word of text.matchAll(/\S+/gu)) {
    range.setStart(node, word.index);
    range.setEnd(node, word.index + word[0].length);
    const bounds = range.getBoundingClientRect();
    if (top !== undefined && Math.abs(bounds.top - top) > 1) starts.push(word.index);
    top = bounds.top;
  }
  return starts.map((start, index) => text.slice(start, starts[index + 1]));
}

export default function EditorialHeadingRuntime({ heading, children, delay, setReveal }: {
  heading: RefObject<HTMLHeadingElement | null>; children: string; delay: number; setReveal: Dispatch<SetStateAction<HeadingReveal | null>>;
}) {
  const entered = useRef(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = heading.current;
    if (!element || reduced || entered.current) return;
    let firstObservation = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      const initial = firstObservation;
      firstObservation = false;
      if (!entry.isIntersecting) return;
      entered.current = true;
      observer.disconnect();
      if (initial) return;
      const lines = renderedLines(element, children);
      setReveal({ lines, clock: Number(document.timeline.currentTime ?? performance.now()) });
      timer = setTimeout(() => setReveal(null), delay + HERO_TUNING.headline.duration + (lines.length - 1) * HERO_TUNING.headline.stagger + 100);
    });
    observer.observe(element);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [children, delay, reduced, heading, setReveal]);

  useEffect(() => {
    const element = heading.current;
    if (!element) return;
    let width = element.clientWidth;
    const resize = new ResizeObserver(() => {
      if (element.clientWidth === width) return;
      width = element.clientWidth;
      // Cancel a running reveal on reflow; normal text wrapping takes over at once.
      setReveal(null);
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, [heading, setReveal]);

  return null;
}
