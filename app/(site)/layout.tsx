import { existsSync } from "node:fs";
import { join } from "node:path";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RouteTransition } from "@/components/route-transition";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const hasLogo = existsSync(join(process.cwd(), "public/brand/vk-and-company-logo-transparent.png"));
  return <><RouteTransition/><SiteHeader hasLogo={hasLogo}/><main>{children}</main><SiteFooter/></>;
}
