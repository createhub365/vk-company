import { describe, expect, it } from "vitest";
import { serviceTiltSpring, SERVICE_TILT_LIMIT } from "@/lib/motion/service-tilt";
import { HERO_TUNING } from "@/lib/motion/hero-tuning";

describe("service tilt spring", () => {
  it("uses the hero's overdamped physics", () => {
    expect(HERO_TUNING.spring.damping).toBe(24);
    expect(HERO_TUNING.spring.damping ** 2).toBeGreaterThanOrEqual(4 * HERO_TUNING.spring.stiffness * HERO_TUNING.spring.mass);
  });
  for (const [from, to] of [[0, 10], [10, -10], [-10, 0], [5, 6], [-100, 100]]) {
    it(`settles monotonically from ${from} to ${to}, without overshoot`, () => {
      const generator = serviceTiltSpring(from, to), limit = SERVICE_TILT_LIMIT;
      const start = Math.max(-limit, Math.min(limit, from)), target = Math.max(-limit, Math.min(limit, to));
      let previous = start;
      for (let ms = 0; ms <= 3000; ms += 8) {
        const { value } = generator.next(ms);
        expect(value).toBeGreaterThanOrEqual(Math.min(start, target) - 1e-8);
        expect(value).toBeLessThanOrEqual(Math.max(start, target) + 1e-8);
        expect(Math.abs(target - value)).toBeLessThanOrEqual(Math.abs(target - previous) + 1e-8);
        previous = value;
      }
      expect(previous).toBe(target);
    });
  }
});
