import { businessConfig } from "@/lib/config";
export type PublicBusinessSettings = { phone: string | null; whatsapp: string | null; email: string | null; address: string | null; mapUrl: string | null; operatingHours: string | null; pickupEnabled: boolean };
// Verified build-time settings; no request context, database, or credentials.
export function getPublicBusinessSettings(): PublicBusinessSettings {
  return { phone: businessConfig.phone, whatsapp: businessConfig.whatsapp, email: businessConfig.email, address: businessConfig.address, mapUrl: businessConfig.mapUrl, operatingHours: businessConfig.operatingHours, pickupEnabled: businessConfig.pickupRequestsEnabled };
}
