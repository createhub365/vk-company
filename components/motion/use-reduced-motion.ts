"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { MOBILE_QUERY, POINTER_QUERY, REDUCED_MOTION_QUERY, pointerRouteAllowed } from "@/lib/motion/policy";

// One MediaQueryList subscription per query, shared by every consumer.
function mediaStore(query: string, serverValue: boolean) {
  let media: MediaQueryList | undefined;
  const listeners = new Set<() => void>();
  const getMedia = () => media ??= window.matchMedia(query);
  const notify = () => listeners.forEach(listener => listener());
  return {
    subscribe(listener: () => void) {
      if (!listeners.size) getMedia().addEventListener("change", notify);
      listeners.add(listener);
      return () => { listeners.delete(listener); if (!listeners.size) media?.removeEventListener("change", notify); };
    },
    snapshot: () => getMedia().matches,
    serverSnapshot: () => serverValue,
  };
}
const reduced = mediaStore(REDUCED_MOTION_QUERY, true);
const pointer = mediaStore(POINTER_QUERY, false);
const mobile = mediaStore(MOBILE_QUERY, true);
export function useReducedMotion() {
  // SSR and the hydration render are conservative: visible, stationary content.
  return useSyncExternalStore(reduced.subscribe, reduced.snapshot, reduced.serverSnapshot);
}
export function usePointerEffects() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const capable = useSyncExternalStore(pointer.subscribe, pointer.snapshot, pointer.serverSnapshot);
  return !reduce && capable && pointerRouteAllowed(pathname);
}
export function useMobileDepth() {
  return useSyncExternalStore(mobile.subscribe, mobile.snapshot, mobile.serverSnapshot);
}
