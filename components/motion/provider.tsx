"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, type ReactNode } from "react";
import { useScroll } from "framer-motion";

const ScrollRuntime = dynamic(() => import("./scroll-runtime"), { ssr: false });
const MotionContext = createContext<ReturnType<typeof useScroll> | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const scroll = useScroll({ trackContentSize: true });
  // Context adds no DOM or delayed content boundary. Only the null-rendering runtime is lazy.
  return <MotionContext.Provider value={scroll}><ScrollRuntime/>{children}</MotionContext.Provider>;
}
export function useDepthScroll() {
  const context = useContext(MotionContext);
  if (!context) throw new Error("Depth motion requires the shared MotionProvider.");
  return context;
}
