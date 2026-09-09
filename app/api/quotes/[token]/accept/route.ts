import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { createReference, hashToken } from "@/lib/references";
import { jsonError, sameOrigin } from "@/lib/http";

const tokenSchema=z.string().min(40).max(100).regex(/^[A-Za-z0-9_-]+$/);
export async function POST(request:NextRequest,{params}:{params:Promise<{token:string}>}){
  if(!sameOrigin(request))return jsonError("Request origin was not accepted.",403);
  const{token}=await params;const parsed=tokenSchema.safeParse(token);if(!parsed.success)return jsonError("This offer link is invalid.",400);
  const db=createPrivilegedClient();if(!db)return jsonError("Quote acceptance is not configured.",503);
  const{data,error}=await db.rpc("accept_quote",{p_token_hash:hashToken(token),p_booking_reference:createReference("BKG")});
  if(error){const message=error.message.toLowerCase();if(message.includes("expired"))return jsonError("This offer has expired.",410);if(message.includes("superseded")||message.includes("available"))return jsonError("This offer is no longer available.",409);return jsonError("We could not accept this offer. Please contact support.",400);}
  const result=Array.isArray(data)?data[0]:data;return NextResponse.json({ok:true,bookingReference:result?.booking_reference,alreadyAccepted:Boolean(result?.already_accepted),message:result?.already_accepted?"This quote was already accepted. Your booking remains confirmed.":"Quote accepted. Your booking has been created."});
}
