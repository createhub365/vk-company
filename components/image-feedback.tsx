"use client";

import dynamic from "next/dynamic";
const ImageFeedbackRuntime = dynamic(() => import("./motion/image-feedback-runtime"), { ssr: false });
export function ImageFeedback() { return <ImageFeedbackRuntime/>; }
