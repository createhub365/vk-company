import { cancelFrame, frame, spring, type FrameData } from "framer-motion";
import { HERO_TUNING } from "./hero-tuning";

export const SERVICE_TILT_LIMIT = 10;
const bounded = (angle: number) => Math.max(-SERVICE_TILT_LIMIT, Math.min(SERVICE_TILT_LIMIT, angle));
export function serviceTiltSpring(from: number, to: number) {
  // Reset velocity on retargeting: the hero's overdamped spring then approaches
  // each new target monotonically, even after a fast pointer direction change.
  return spring({ ...HERO_TUNING.spring, velocity: 0, keyframes: [bounded(from), bounded(to)] });
}

// Called by the existing recognizer. No DOM listeners, timers or native rAF.
export function createServiceTilt() {
  type State = { x: number; y: number; targetX: number; targetY: number; start: number;
    xSpring: ReturnType<typeof serviceTiltSpring>; ySpring: ReturnType<typeof serviceTiltSpring> };
  const states = new Map<HTMLElement, State>();
  function reset(element: HTMLElement) {
    states.delete(element);
    element.style.removeProperty("transform");
    element.style.removeProperty("will-change");
  }
  function render({ timestamp }: FrameData) {
    let moving = false;
    for (const [element, state] of states) {
      if (!element.isConnected) { reset(element); continue; }
      const x = state.xSpring.next(Math.max(0, timestamp - state.start));
      const y = state.ySpring.next(Math.max(0, timestamp - state.start));
      state.x = bounded(x.value); state.y = bounded(y.value);
      const resting = x.done && y.done;
      if (resting && state.targetX === 0 && state.targetY === 0) { reset(element); continue; }
      element.style.transform = `perspective(var(--perspective)) rotateX(${state.x}deg) rotateY(${state.y}deg)`;
      if (resting) element.style.removeProperty("will-change");
      else { element.style.willChange = "transform"; moving = true; }
    }
    if (moving) frame.render(render);
  }
  function set(element: HTMLElement, x: number, y: number) {
    const previous = states.get(element);
    const targetX = bounded(x), targetY = bounded(y);
    if (previous?.targetX === targetX && previous.targetY === targetY) return;
    states.set(element, { x: previous?.x ?? 0, y: previous?.y ?? 0, targetX, targetY, start: performance.now(),
      xSpring: serviceTiltSpring(previous?.x ?? 0, targetX), ySpring: serviceTiltSpring(previous?.y ?? 0, targetY) });
    frame.render(render);
  }
  function clear() { cancelFrame(render); for (const element of states.keys()) reset(element); }
  return { set, reset, clear };
}
