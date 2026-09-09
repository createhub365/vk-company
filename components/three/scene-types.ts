export type SceneVariant =
  | "journey"
  | "services"
  | "process"
  | "domestic"
  | "international"
  | "quote"
  | "tracking"
  | "about"
  | "contact"
  | "faq"
  | "legal"
  | "footer"
  | "admin";

export type TrackingVisualState = "neutral" | "loading" | "unknown" | "in_transit" | "delivered" | "exception";
