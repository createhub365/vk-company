import { describe, expect, it } from "vitest";
import { acquireScrollLock, isScrollLocked, subscribeScrollLock } from "@/lib/motion/scroll-lock";

describe("shared menu scroll lock", () => {
  it("keeps another owner locked and releases idempotently", () => {
    const states: boolean[] = [];
    const unsubscribe = subscribeScrollLock(() => states.push(isScrollLocked()));
    const releaseFirst = acquireScrollLock(), releaseSecond = acquireScrollLock();
    try {
      releaseFirst();
      expect(isScrollLocked()).toBe(true);
      releaseFirst();
      expect(states).toEqual([true, true, true]);
      releaseSecond();
      expect(isScrollLocked()).toBe(false);
      expect(states).toEqual([true, true, true, false]);
      unsubscribe();
      const releaseLater = acquireScrollLock();
      releaseLater();
      expect(states).toHaveLength(4);
    } finally { releaseFirst(); releaseSecond(); unsubscribe(); }
  });
});
