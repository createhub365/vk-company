"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

export const MOTION_KEY = "vk-motion-paused";
export const MOTION_EVENT = "vk:motion-preference";

export function MotionControl() {
  const [paused, setPaused] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateSystem = () => setSystemReduced(query.matches);
    const frame = requestAnimationFrame(() => {
      updateSystem();
      setPaused(window.localStorage.getItem(MOTION_KEY) === "true");
    });
    query.addEventListener("change", updateSystem);
    return () => { cancelAnimationFrame(frame); query.removeEventListener("change", updateSystem); };
  }, []);

  const reduced = paused || systemReduced;
  function toggle() {
    const next = !paused;
    setPaused(next);
    window.localStorage.setItem(MOTION_KEY, String(next));
    window.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: { paused: next } }));
  }

  return (
    <button type="button" className="motion-toggle" onClick={toggle} aria-pressed={reduced} aria-label={reduced ? "Enable motion" : "Reduce motion"}>
      {reduced ? <Play size={14} /> : <Pause size={14} />}
      <span>{reduced ? "Motion off" : "Motion on"}</span>
    </button>
  );
}
