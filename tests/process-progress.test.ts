import { describe, expect, it } from "vitest";
import { processProgress, processStepWeight } from "@/lib/motion/process-progress";

describe("process scroll sequence", () => {
  it.each([300, 900, 1800])("stays monotonic and reversible with section height %i in a 900px viewport", height => {
    const positions = [1500, 675, 400, 0, -400, -height, -2500];
    const values = positions.map(top => processProgress(top, height, 900));
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect([...positions].reverse().map(top => processProgress(top, height, 900))).toEqual([...values].reverse());
    expect(values.every(p => Number.isFinite(p) && p >= 0 && p <= 1)).toBe(true);
  });
  it("centers a completely visible section on a stable blend of the middle steps", () => {
    const top = (1800 - 500) / 2;
    expect(processProgress(top, 500, 1800)).toBe(.5);
    expect([0, 1, 2, 3].map(i => processStepWeight(.5, i, 4))).toEqual([0, .5, .5, 0]);
    expect(Math.abs(processProgress(top + .01, 500, 1800) - .5)).toBeLessThan(.00001);
  });
  it("reaches each exact active state without a discrete toggle", () => {
    for (let active = 0; active < 4; active++) {
      expect([0, 1, 2, 3].map(i => processStepWeight(active / 3, i, 4))).toEqual([0, 1, 2, 3].map(i => +(i === active)));
    }
    expect(processStepWeight(.4, 1, 4)).toBeCloseTo(.8);
    expect(processStepWeight(.4, 2, 4)).toBeCloseTo(.2);
  });
});
