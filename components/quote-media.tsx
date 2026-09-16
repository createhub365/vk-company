"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
const QuoteMediaRuntime = dynamic(() => import("./motion/quote-media-runtime"), { ssr: false });
import { Photograph } from "./photograph";

export function QuoteMedia() {
  const host = useRef<HTMLDivElement>(null);
  return <div ref={host} className="quote-media" data-bubbles="fallback">
    <div className="quote-photo" data-image-feedback="photo" data-photo-frame="">
      <Photograph name="details" alt="Illustrative Indian courier measuring a parcel on a weighing scale beside shipping paperwork; not actual company staff or premises" sizes="(max-width: 900px) 243px, 423px" eager/>
    </div>
    <div className="quote-bubble-fallback" aria-hidden="true"><i/><i/><i/><i/></div>
    <QuoteMediaRuntime host={host}/>
  </div>;
}
