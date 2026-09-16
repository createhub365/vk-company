"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import { MOTION_EVENT, MOTION_KEY } from "@/components/motion-control";
import type { SceneVariant } from "./scene-types";

const CourierCanvas = dynamic(() => import("./courier-canvas"), {
  ssr: false,
  loading: () => <SceneFallback variant="journey" />,
});

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function SceneFallback({ variant }: { variant: SceneVariant }) {
  return (
    <div className={`scene-fallback scene-fallback-${variant}`} role="img" aria-label={`${variant} courier illustration`}>
      <span className="fallback-route" />
      <span className="fallback-box" />
      <span className="fallback-vehicle" />
    </div>
  );
}

export function SceneStage({ variant, className = "", label, compact = false }: { variant: SceneVariant; className?: string; label?: string; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let userPaused = window.localStorage.getItem(MOTION_KEY) === "true";
    const update = () => setReduced(query.matches || userPaused);
    const onPreference = (event: Event) => {
      userPaused = Boolean((event as CustomEvent<{ paused: boolean }>).detail?.paused);
      update();
    };
    let recoveryTimer = 0;
    const onFailure = () => {
      setFailed(true);
      window.clearTimeout(recoveryTimer);
      recoveryTimer = window.setTimeout(() => setFailed(false), 1400);
    };
    update();
    query.addEventListener("change", update);
    window.addEventListener(MOTION_EVENT, onPreference);
    window.addEventListener("vk:webgl-failed", onFailure);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener(MOTION_EVENT, onPreference);
      window.removeEventListener("vk:webgl-failed", onFailure);
      window.clearTimeout(recoveryTimer);
    };
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "180px" });
    observer.observe(element);
    let raf = 0;
    const updateProgress = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const travel = rect.height + window.innerHeight * 0.3;
        setProgress(Math.max(0, Math.min(1, (-rect.top + 100) / travel)));
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const fallback = <SceneFallback variant={variant} />;
  return (
    <div ref={host} className={`scene-stage ${compact ? "scene-stage-compact" : ""} ${className}`} aria-label={label || `${variant} logistics scene`}>
      <div className="scene-horizon" aria-hidden="true" />
      <SceneErrorBoundary fallback={fallback}>
        {visible && !failed ? <CourierCanvas variant={variant} reduced={reduced} active={visible} progress={progress} /> : fallback}
      </SceneErrorBoundary>
    </div>
  );
}
