export const businessConfig = {
  name: "VK AND COMPANY",
  legalName: null as string | null,
  phone: null as string | null,
  whatsapp: null as string | null,
  email: null as string | null,
  address: null as string | null,
  mapUrl: null as string | null,
  operatingHours: null as string | null,
  pickupRequestsEnabled: false,
  logoPath: "/brand/vk-and-company-logo-transparent.png",
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function hasSupabasePublicConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function hasSupabaseAdminConfig() {
  return hasSupabasePublicConfig() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
