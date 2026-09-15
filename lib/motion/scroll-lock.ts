// Menu locks share the existing Lenis owner, including before its lazy runtime loads.
const locks = new Set<symbol>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());

export const isScrollLocked = () => locks.size > 0;
export function subscribeScrollLock(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function acquireScrollLock() {
  const key = Symbol("navigation");
  locks.add(key);
  notify();
  return () => { if (locks.delete(key)) notify(); };
}
