export const businessConfig = {
  name: "VK AND COMPANY",
  legalName: null as string | null,
  phone: "+91 93177 24056" as string | null,
  whatsapp: null as string | null,
  email: "vkandcompanymohali@gmail.com" as string | null,
  address: null as string | null,
  mapUrl: null as string | null,
  operatingHours: null as string | null,
  pickupRequestsEnabled: false,
  logoPath: "/brand/vk-and-company-logo-transparent.png",
} as const;

// No invented production origin. Missing origin is a launch blocker, not a
// reason to publish localhost in the sitemap or metadata.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || undefined;
