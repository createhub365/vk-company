"use client";

import dynamic from "next/dynamic";
import { useRef, type ReactNode } from "react";
import "@/styles/utility-depth.css";
const UtilityRuntime = dynamic(() => import("./utility-runtime"), { ssr: false });

export function FaqDepth({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  return <div ref={root} className="faq-list faq-depth">{children}<UtilityRuntime root={root} kind="faq"/></div>;
}
export function FormDepth({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  return <div ref={root} className="form-depth" data-utility-pointer={false}>{children}<UtilityRuntime root={root} kind="form"/></div>;
}
export function FooterDepth({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  return <div ref={root} className="shell footer-depth" data-utility-pointer={false}>{children}<UtilityRuntime root={root} kind="footer"/></div>;
}
