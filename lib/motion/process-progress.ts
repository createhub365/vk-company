import { clamp } from "./tokens";

// Never divide by sectionHeight - viewportHeight: a fully visible section must
// have a stable, reversible position, including when those dimensions are equal.
export function processProgress(top: number, height: number, viewport: number) {
  return clamp((viewport * .75 - top) / Math.max(1, height + viewport * .5), 0, 1);
}
export function processStepWeight(progress: number, index: number, count: number) {
  return clamp(1 - Math.abs(clamp(progress, 0, 1) * Math.max(0, count - 1) - index), 0, 1);
}
