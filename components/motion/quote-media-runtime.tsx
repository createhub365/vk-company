"use client";

import { useEffect, type RefObject } from "react";
export default function QuoteMediaRuntime({ host }: { host: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const element = host.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, visible = false, loading = false, failed = false;
    let scene: ReturnType<typeof import("../three/quote-bubbles").createQuoteBubbles> | undefined;
    async function update() {
      scene?.setActive(visible && !reduced.matches && !document.hidden);
      if (disposed || failed || loading || scene || !visible || reduced.matches) return;
      loading = true;
      try {
        const { createQuoteBubbles } = await import("../three/quote-bubbles");
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
  }, [host]);
  return null;
}
