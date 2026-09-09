import type { NextRequest } from "next/server";
import { submitEnquiry } from "@/lib/submit-enquiry";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return submitEnquiry(request, "support_request");
}
