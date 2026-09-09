"use client";

import { usePathname } from "next/navigation";

export function RouteTransition() {
  const pathname = usePathname();
  return <div className="route-transition" key={pathname} aria-hidden="true"><span /></div>;
}
