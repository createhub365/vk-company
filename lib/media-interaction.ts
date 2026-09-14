// The existing gesture recognizer publishes this local event; the scene never
// adds another global pointer/click listener or prevents a native action.
export const MEDIA_INTERACTION = "vk:media-interaction";
export type MediaInteraction = { kind: "move" | "leave" | "tap"; x: number; y: number };
