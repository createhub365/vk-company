import { NextRequest, NextResponse } from "next/server";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { trackingCodeSchema } from "@/lib/schemas";
import { checkRateLimit, requestFingerprint } from "@/lib/rate-limit";
import { jsonError } from "@/lib/http";

export async function GET(request:NextRequest){
  const parsed=trackingCodeSchema.safeParse(request.nextUrl.searchParams.get("code")||"");if(!parsed.success)return jsonError("Enter a valid VK tracking code.",422);
  const db=createPrivilegedClient();if(!db)return jsonError("Tracking is not configured yet.",503);
  try{if(!(await checkRateLimit(db,"public-tracking",requestFingerprint(request.headers),30)))return jsonError("Too many tracking requests. Please wait and retry.",429);}catch{return jsonError("Tracking is temporarily unavailable.",503)}
  const{data:shipment,error}=await db.from("shipments").select("id,public_tracking_code,status,source,courier_partner_name,partner_tracking_url,last_event_at").eq("public_tracking_code",parsed.data).eq("is_test",false).is("archived_at",null).maybeSingle();
  if(error)return jsonError("Tracking is temporarily unavailable.",503);if(!shipment)return jsonError("No shipment was found for that tracking code.",404);
  const{data:events,error:eventError}=await db.from("tracking_events").select("status,public_description,public_location,occurred_at").eq("shipment_id",shipment.id).order("occurred_at",{ascending:false}).limit(100);
  if(eventError)return jsonError("Tracking events are temporarily unavailable.",503);
  return NextResponse.json({ok:true,shipment:{trackingCode:shipment.public_tracking_code,status:shipment.status,source:shipment.source,lastUpdated:shipment.last_event_at,courierPartner:shipment.courier_partner_name,partnerTrackingUrl:shipment.partner_tracking_url,events:(events||[]).map((event)=>({status:event.status,description:event.public_description,location:event.public_location,occurredAt:event.occurred_at}))}});
}
