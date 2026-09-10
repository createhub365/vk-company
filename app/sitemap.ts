import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return ["", "/services/domestic", "/services/international", "/get-a-quote", "/about", "/contact", "/track", "/faq", "/privacy", "/terms"].map(path => ({ url: `${siteUrl}${path}`, changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.7 }));
}
