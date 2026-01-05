import { headers } from "next/headers";

/**
 * Generate a cryptographically secure nonce for CSP
 * This version works in both Node.js and Edge Runtime
 */
export function generateNonce(): string {
  // Use crypto.randomUUID() which is available in both runtimes
  // Then convert to base64-like format
  const uuid = crypto.randomUUID();
  const buffer = uuid.replace(/-/g, "");
  // Take first 16 chars for a reasonable nonce length
  return Buffer.from(buffer.slice(0, 16)).toString("base64");
}

/**
 * Generate nonce for Edge Runtime (middleware)
 * Uses Web Crypto API which is available in Edge Runtime
 */
export function generateNonceEdge(): string {
  // Use crypto.randomUUID which is available in Edge Runtime
  const uuid = crypto.randomUUID();
  // Convert UUID to base64-ish format for nonce
  return btoa(uuid.replace(/-/g, "").slice(0, 16));
}

/**
 * Get or generate nonce for the current request
 */
export async function getNonce(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-nonce") || generateNonce();
}
