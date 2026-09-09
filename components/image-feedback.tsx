"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const surfaceSelector = "[data-image-feedback]";
const controlSelector = "a[href], button, [role='button'], [role='link']";

// One delegated listener set covers server-rendered images and client navigation.
// The attributes also support a positioned CSS-background surface without an img.
export function ImageFeedback() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const active = new Map<HTMLElement, () => void>();
    let gesture: { surface: HTMLElement; id: number; x: number; y: number; at: number; valid: boolean } | null = null;

    function surfaceFor(target: EventTarget | null, keyboard = false) {
      if (!(target instanceof Element)) return null;
      const control = target.closest(controlSelector);
      const surface = target.closest<HTMLElement>(surfaceSelector)
        ?? (keyboard ? control?.querySelector<HTMLElement>(surfaceSelector) : null);
      if (!surface) return null;
      if (surface.dataset.imageFeedback === "background" &&
        target.closest("[data-image-feedback-foreground], a, button, input, textarea, select, label, p, h1, h2, h3, span")) return null;
      return surface;
    }

    function play(surface: HTMLElement, clientX: number, clientY: number) {
      active.get(surface)?.();
      const image = surface instanceof HTMLImageElement ? surface : surface.querySelector("img");
      const animations: Animation[] = [];
      let layer: HTMLDivElement | undefined;
      const clear = () => {
        animations.forEach(animation => { animation.onfinish = null; animation.cancel(); });
        layer?.remove();
        active.delete(surface);
      };
      active.set(surface, clear);
      const timing: KeyframeAnimationOptions = { duration: 450, easing: "ease-out" };

      if (reducedMotion.matches || surface.dataset.imageFeedback === "logo") {
        // A stationary inset highlight: no logo deformation or reduced-motion ripple.
        const highlight = surface.dataset.imageFeedback === "logo" ? surface : (image ?? surface);
        animations.push(highlight.animate([
          { outline: "2px solid rgba(55, 169, 177, .55)", outlineOffset: "-3px" },
          { outline: "2px solid rgba(55, 169, 177, .55)", outlineOffset: "-3px" },
        ], timing));
      } else {
        const rect = surface.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
        layer = document.createElement("div");
        layer.className = "image-feedback-layer";
        layer.setAttribute("aria-hidden", "true");
        const ripple = document.createElement("div");
        ripple.className = "image-feedback-ripple";
        Object.assign(ripple.style, { width: `${radius * 2}px`, height: `${radius * 2}px`, left: `${x - radius}px`, top: `${y - radius}px` });
        layer.append(ripple);
        surface.append(layer);
        if (image && surface.dataset.imageFeedback === "photo") {
          animations.push(image.animate([
            { transform: "scale(1)" },
            { transform: "scale(1.025)", offset: .45 },
            { transform: "scale(1)" },
          ], timing));
        }
        animations.push(ripple.animate([
          { transform: "scale(0)", opacity: .3 },
          { opacity: .18, offset: .4 },
          { transform: "scale(1)", opacity: 0 },
        ], timing));
      }
      animations[animations.length - 1].onfinish = clear;
    }

    function cancelGesture() { if (gesture) gesture.valid = false; }
    function down(event: PointerEvent) {
      if (!event.isPrimary) { cancelGesture(); return; }
      const surface = surfaceFor(event.target);
      gesture = event.button === 0 && surface
        ? { surface, id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now(), valid: true }
        : null;
    }
    function move(event: PointerEvent) {
      if (gesture && event.pointerId === gesture.id && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) cancelGesture();
    }
    function click(event: MouseEvent) {
      const keyboard = event.detail === 0;
      const surface = surfaceFor(event.target, keyboard);
      const previous = gesture;
      gesture = null;
      if (!surface || window.getSelection()?.toString()) return;
      if (keyboard) {
        if (!(event.target instanceof Element) || !event.target.closest(controlSelector)) return;
        const rect = surface.getBoundingClientRect();
        play(surface, rect.left + rect.width / 2, rect.top + rect.height / 2);
      } else if (previous?.valid && previous.surface === surface && performance.now() - previous.at < 750 &&
        Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= 8) {
        play(surface, event.clientX, event.clientY);
      }
      // Never preventDefault, capture pointers, or delay the native control action.
    }

    const passive = { capture: true, passive: true };
    document.addEventListener("pointerdown", down, passive);
    document.addEventListener("pointermove", move, passive);
    document.addEventListener("click", click, passive);
    document.addEventListener("pointercancel", cancelGesture, passive);
    document.addEventListener("dragstart", cancelGesture, passive);
    document.addEventListener("scroll", cancelGesture, passive);
    window.addEventListener("blur", cancelGesture);
    const clearEffects = () => active.forEach(clear => clear());
    reducedMotion.addEventListener("change", clearEffects);
    const observer = new MutationObserver(() => {
      active.forEach((clear, surface) => { if (!surface.isConnected) clear(); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("pointercancel", cancelGesture, true);
      document.removeEventListener("dragstart", cancelGesture, true);
      document.removeEventListener("scroll", cancelGesture, true);
      window.removeEventListener("blur", cancelGesture);
      reducedMotion.removeEventListener("change", clearEffects);
      observer.disconnect();
      clearEffects();
    };
  }, [pathname]);

  return null;
}
