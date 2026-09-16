"use client";

import { useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
const ProcessRuntime = dynamic(() => import("./process-runtime"), { ssr: false });
import "@/styles/process-depth.css";

export function ProcessSequence({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<SVGSVGElement>(null);

  return <div ref={root} className="process-depth">
    <svg ref={line} className="process-connector" aria-hidden="true" focusable="false">
      <line className="process-line-horizontal" x1="0" y1="1" x2="100%" y2="1" pathLength="1"/>
      <line className="process-line-vertical" x1="1" y1="0" x2="1" y2="100%" pathLength="1"/>
    </svg>
    <ol ref={list} className="process-list">{children}</ol>
    <ProcessRuntime root={root} list={list} line={line}/>
  </div>;
}
