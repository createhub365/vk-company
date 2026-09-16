"use client";

import { useEffect } from "react";
import { queueSharedPointer } from "@/lib/motion/shared-pointer";
import { cancelFrame, frame as motionFrame } from "framer-motion";
import { usePointerEffects } from "@/components/motion/use-reduced-motion";
import { usePathname } from "next/navigation";
import { pointerRouteAllowed } from "@/lib/motion/policy";
import { MEDIA_INTERACTION, type MediaInteraction } from "@/lib/media-interaction";
import { createServiceTilt, SERVICE_TILT_LIMIT } from "@/lib/motion/service-tilt";

const photos = '[data-image-feedback="photo"]';
const fields = "input, textarea, select, label, button, summary, [contenteditable]:not([contenteditable='false'])";

// One passive recognizer owns photo hover and tap. Native activation/scroll/zoom
// are never cancelled; the bounded Quote scene subscribes to its local events.
export default function ImageFeedbackRuntime() {
  const pointerEnabled = usePointerEffects();
  const pathname = usePathname();
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointers = new Set<number>();
    const serviceTilt = createServiceTilt();
    let gesture: { target: Element; id: number; x: number; y: number; at: number; valid: boolean } | null = null;
    let hovered: HTMLElement | null = null;
    let cleanup: (() => void) | undefined;
    let pending: { frame: HTMLElement; x: number; y: number } | null = null;
    const publish = (frame: HTMLElement, detail: MediaInteraction) => frame.dispatchEvent(new CustomEvent(MEDIA_INTERACTION, { bubbles: true, detail }));
    function cancel() { if (gesture) gesture.valid = false; }
    function leave() {
      cancelFrame(renderPointer); pending = null;
      if (hovered) {
        if (hovered.hasAttribute("data-service-tilt")) serviceTilt.set(hovered, 0, 0);
        else hovered.style.removeProperty("transform");
        hovered.removeAttribute("data-photo-hover");
        publish(hovered, { kind: "leave", x: 0, y: 0 });
        hovered = null;
      }
    }
    function down(event: PointerEvent) {
      pointers.add(event.pointerId);
      if (!event.isPrimary || pointers.size > 1) { cancel(); leave(); return; }
      gesture = event.button === 0 && event.target instanceof Element
        ? { target: event.target, id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now(), valid: true } : null;
    }
    function move(event: PointerEvent) {
      if (gesture?.id === event.pointerId && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) cancel();
      if (!pointerEnabled || event.pointerType === "touch" || reduced.matches || event.buttons || !(event.target instanceof Element)) return;
      queueSharedPointer({ x: event.clientX, y: event.clientY, target: event.target });
      const frame = !event.target.closest(fields) ? event.target.closest<HTMLElement>(photos)
        ?? event.target.closest("[data-service-tilt-boundary]")?.querySelector<HTMLElement>("[data-service-tilt]") ?? null : null;
      if (frame !== hovered) leave();
      if (!frame) return;
      hovered = frame;
      // Measure the stationary photo boundary rather than the tilted face.
      const b = (frame.hasAttribute("data-service-tilt") ? frame.parentElement! : frame).getBoundingClientRect();
      pending = { frame, x: Math.max(-1, Math.min(1, (event.clientX - b.left) / b.width * 2 - 1)), y: Math.max(-1, Math.min(1, (event.clientY - b.top) / b.height * 2 - 1)) };
      motionFrame.render(renderPointer);
    }
    function renderPointer() {
      if (!pending) return;
      const { frame, x, y } = pending;
      if (frame.hasAttribute("data-service-tilt")) serviceTilt.set(frame, -y * SERVICE_TILT_LIMIT, x * SERVICE_TILT_LIMIT);
      else if (frame.dataset.photoMotion !== "scroll") frame.style.transform = `perspective(1000px) rotateX(${-y * 3.5}deg) rotateY(${x * 3.5}deg)`;
      frame.style.setProperty("--photo-x", `${(x + 1) * 50}%`);
      frame.style.setProperty("--photo-y", `${(y + 1) * 50}%`);
      frame.dataset.photoHover = "";
      publish(frame, { kind: "move", x, y });
      pending = null;
    }
    function out(event: PointerEvent) {
      if (!event.relatedTarget) queueSharedPointer(null);
      const boundary = hovered?.hasAttribute("data-service-tilt") ? hovered.parentElement : hovered;
      if (boundary && (!(event.relatedTarget instanceof Node) || !boundary.contains(event.relatedTarget))) leave();
    }
    function up(event: PointerEvent) { pointers.delete(event.pointerId); }
    function pointerCancel(event: PointerEvent) { up(event); cancel(); leave(); }
    function clear() { cleanup?.(); }
    function click(event: MouseEvent) {
      const previous = gesture; gesture = null;
      if (!pointerRouteAllowed(pathname)) return;
      if (!(event.target instanceof Element) || getSelection()?.toString() || event.target.closest(fields)) return;
      const frame = event.target.closest<HTMLElement>(photos) ?? (event.detail === 0 ? event.target.closest("a[href]")?.querySelector<HTMLElement>(photos) : null);
      if (!frame) return;
      if (event.detail !== 0 && (!previous?.valid || performance.now() - previous.at > 750 ||
        Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 8 ||
        !(event.target.contains(previous.target) || previous.target.contains(event.target)))) return;
      clear(); leave();
      serviceTilt.reset(frame);
      // Resolve the resting box before locating the ripple, even mid-hover.
      frame.style.transition = "none";
      const b = frame.getBoundingClientRect();
      frame.style.removeProperty("transition");
      // Parallax can scale an ancestor. Map the visible point back into the
      // frame's local CSS pixels so its existing ripple remains under the tap.
      const x = event.detail === 0 ? frame.clientWidth / 2 : (event.clientX - b.left) * frame.offsetWidth / b.width - frame.clientLeft;
      const y = event.detail === 0 ? frame.clientHeight / 2 : (event.clientY - b.top) * frame.offsetHeight / b.height - frame.clientTop;
      const layer = document.createElement("i");
      layer.className = "image-feedback-layer image-feedback-ripple";
      layer.setAttribute("aria-hidden", "true");
      Object.assign(layer.style, { left: `${x}px`, top: `${y}px` });
      frame.append(layer);
      const animations: Animation[] = [];
      if (!reduced.matches) {
        // The whole clipped frame moves; the inner photograph stays edge-to-edge.
        animations.push(frame.animate([{ transform: "perspective(1000px) translateZ(0) scale(1)" },
          { transform: "perspective(1000px) translateZ(-24px) scale(.985)", offset: .22 },
          { transform: "perspective(1000px) translateZ(5px) scale(1.005)", offset: .57 },
          { transform: "perspective(1000px) translateZ(0) scale(1)" }], { duration: 640, easing: "cubic-bezier(.2,.7,.25,1)" }));
      }
      animations.push(layer.animate(reduced.matches ? [{ opacity: .95 }, { opacity: .95, offset: .7 }, { opacity: 0 }] : [
        { transform: "translate(-50%,-50%) scale(.2)", opacity: 1 },
        { transform: "translate(-50%,-50%) scale(1.2)", opacity: .9, offset: .5 },
        { transform: "translate(-50%,-50%) scale(1.8)", opacity: 0 },
      ], { duration: 640, easing: "ease-out" }));
      publish(frame, { kind: "tap", x: x / frame.clientWidth * 2 - 1, y: y / frame.clientHeight * 2 - 1 });
      const timer = window.setTimeout(clear, 680);
      cleanup = () => { cleanup = undefined; clearTimeout(timer); animations.forEach(a => a.cancel()); layer.remove(); };
    }
    function scroll() { cancel(); clear(); leave(); }
    function blur() { scroll(); serviceTilt.clear(); pointers.clear(); queueSharedPointer(null); }
    const passive = { capture: true, passive: true };
    document.addEventListener("pointerdown", down, passive);
    document.addEventListener("pointermove", move, passive);
    document.addEventListener("pointerout", out, passive);
    document.addEventListener("pointerup", up, passive);
    document.addEventListener("pointercancel", pointerCancel, passive);
    document.addEventListener("click", click, passive);
    document.addEventListener("dragstart", cancel, passive);
    document.addEventListener("scroll", scroll, passive);
    window.addEventListener("blur", blur);
    reduced.addEventListener("change", blur);
    document.documentElement.dataset.photoFeedbackReady = "true";
    return () => {
      delete document.documentElement.dataset.photoFeedbackReady;
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerout", out, true);
      document.removeEventListener("pointerup", up, true);
      document.removeEventListener("pointercancel", pointerCancel, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("dragstart", cancel, true);
      document.removeEventListener("scroll", scroll, true);
      window.removeEventListener("blur", blur);
      reduced.removeEventListener("change", blur);
      blur();
    };
  }, [pointerEnabled, pathname]);
  return null;
}
