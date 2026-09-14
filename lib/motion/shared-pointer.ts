import { cancelFrame, frame } from "framer-motion";

export type SharedPointer = { x: number; y: number; target: Element } | null;
const subscribers = new Set<(point: SharedPointer) => void>();
let pending: SharedPointer = null;
function flush() { subscribers.forEach(subscriber => subscriber(pending)); }
// The existing ImageFeedback recognizer is the sole DOM pointer-event owner.
export function queueSharedPointer(point: SharedPointer) {
  if (!subscribers.size) return;
  pending = point;
  frame.read(flush);
}
export function subscribeSharedPointer(subscriber: (point: SharedPointer) => void) {
  subscribers.add(subscriber);
  return () => { subscribers.delete(subscriber); if (!subscribers.size) { cancelFrame(flush); pending = null; } };
}
