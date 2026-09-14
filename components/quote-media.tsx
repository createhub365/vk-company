"use client";

import { useEffect, useRef } from "react";
import { Photograph } from "./photograph";

export function QuoteMedia() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, visible = false, loading = false, failed = false;
    let scene: ReturnType<typeof import("./three/quote-bubbles").createQuoteBubbles> | undefined;
    async function update() {
      scene?.setActive(visible && !reduced.matches && !document.hidden);
      if (disposed || failed || loading || scene || !visible || reduced.matches) return;
      loading = true;
      try {
        const { createQuoteBubbles } = await import("./three/quote-bubbles");
        if (!disposed && !reduced.matches) {
          scene = createQuoteBubbles(element, () => { failed = true; element.dataset.bubbles = "fallback"; });
          scene.setActive(visible && !document.hidden);
        }
      } catch { failed = true; element.dataset.bubbles = "fallback"; }
      finally { loading = false; }
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; void update(); });
    observer.observe(element);
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { disposed = true; observer.disconnect(); reduced.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); scene?.dispose(); };
  }, []);
  return <div ref={host} className="quote-media" data-bubbles="fallback">
    <div className="quote-photo" data-image-feedback="photo" data-photo-frame="">
      <Photograph name="details" alt="Illustrative Indian courier measuring a parcel on a weighing scale beside shipping paperwork; not actual company staff or premises" sizes="(max-width: 900px) 243px, 423px" eager/>
    </div>
    <div className="quote-bubble-fallback" aria-hidden="true"><i/><i/><i/><i/></div>
  </div>;
}
