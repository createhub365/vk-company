// The existing Quote WebGL implementation is deliberately not part of this system.
export const POINTER_EFFECTS_DISABLED_ROUTES = new Set(["/get-a-quote"]);
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const POINTER_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";
export const MOBILE_QUERY = "(max-width: 767px)";
export function pointerRouteAllowed(pathname: string) {
  return !POINTER_EFFECTS_DISABLED_ROUTES.has(pathname.replace(/\/$/, "") || "/");
}
