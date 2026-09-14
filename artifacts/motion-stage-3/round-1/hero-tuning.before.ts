// Stage 3 tuning surface. Pointer physics and scroll mapping are deliberately separate.
export const HERO_TUNING = {
  pointer: { limit: 10, backWeight: -1, midWeight: 0.55, frontWeight: 1 },
  spring: { stiffness: 120, damping: 20, mass: 1, restDelta: 0.01, restSpeed: 0.05 },
  headline: { rise: 24, rotation: 12, duration: 600, stagger: 90, emphasisDelay: 120 },
  follow: { rise: 16, rotation: 0, duration: 400, ctaDelay: 90 },
  depth: { backScale: 1.08, emphasis: 15, scrollEnd: -60, opacityEnd: 0.4 },
} as const;
