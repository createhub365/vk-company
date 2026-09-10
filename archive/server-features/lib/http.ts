import { NextRequest, NextResponse } from "next/server";
import { siteUrl } from "@/lib/config";

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
  const allowed = new URL(siteUrl);
  return origin === allowed.origin || origin === request.nextUrl.origin;
}

export function jsonError(message: string, status: number, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, message, fields }, { status });
}
