import type { MetadataRoute } from "next";import { siteUrl } from "@/lib/config";
export default function sitemap():MetadataRoute.Sitemap{return ["","/services/domestic","/services/international","/get-a-quote","/track","/about","/contact","/faq"].map((path)=>({url:`${siteUrl}${path}`,changeFrequency:path===""?"weekly":"monthly",priority:path===""?1:.7}));}
