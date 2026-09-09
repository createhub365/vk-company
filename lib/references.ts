import { randomBytes, createHash } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function readableRandom(length: number) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function createReference(prefix: "ENQ" | "QUO" | "BKG" | "VKC") {
  const stamp = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `${prefix}-${stamp}-${readableRandom(prefix === "VKC" ? 10 : 6)}`;
}

export function createSecureToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
