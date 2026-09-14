import { cubicBezier } from "framer-motion";

// Safety bounds remain enforced even if a consumer supplies invalid props/tokens.
export const MAX_TRANSLATION = 40;
export const MAX_ROTATION = 12;
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
export function readDepthTokens(element: HTMLElement) {
  const css = getComputedStyle(element);
  const number = (name: string) => parseFloat(css.getPropertyValue(name));
  const easing = css.getPropertyValue("--ease-out-expo").trim();
  const points = easing.slice(easing.indexOf("(") + 1, -1).split(",").map(Number);
  return {
    easing,
    ease: cubicBezier(points[0], points[1], points[2], points[3]),
    duration: number("--d-base"),
    rest: number("--d-fast"),
    rise: clamp(number("--depth-rise"), 0, MAX_TRANSLATION),
    rotation: clamp(number("--depth-rotate"), 0, MAX_ROTATION),
    from: clamp(number("--depth-parallax-from"), -MAX_TRANSLATION, MAX_TRANSLATION),
    to: clamp(number("--depth-parallax-to"), -MAX_TRANSLATION, MAX_TRANSLATION),
    scaleFrom: number("--depth-scale-from"),
    scaleTo: number("--depth-scale-to"),
  };
}
