"use client";

import dynamic from "next/dynamic";
import { Pause, Play } from "lucide-react";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import { StaticDispatchArt } from "./dispatch-canvas";

const DispatchCanvas = dynamic(() => import("./dispatch-canvas"), { ssr: false, loading: () => <div className="scene-fallback"><StaticDispatchArt /></div> });

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="scene-fallback"><StaticDispatchArt /></div> : this.props.children; }
}

export function DispatchExperience() {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    update(); query.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "150px" });
    if (host.current) observer.observe(host.current);
    return () => { query.removeEventListener("change", update); observer.disconnect(); };
  }, []);
  const reduced = systemReduced || paused;
  return <div ref={host} className="scene-wrap" aria-label="Animated parcel dispatch illustration">
    <div className="scene-controls"><button type="button" className="motion-toggle" onClick={() => setPaused((value) => !value)} aria-pressed={reduced} aria-label={reduced ? "Enable motion" : "Reduce motion"}>{reduced ? <Play size={15}/> : <Pause size={15}/>}<span aria-hidden="true">{reduced ? "Enable motion" : "Reduce motion"}</span></button></div>
    <SceneErrorBoundary>{visible ? <DispatchCanvas reduced={reduced} /> : <div className="scene-fallback"><StaticDispatchArt /></div>}</SceneErrorBoundary>
  </div>;
}
