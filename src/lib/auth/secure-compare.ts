import { timingSafeEqual, createHash } from "crypto";

/**
 * Constant-time string comparison using Node.js crypto module
 * Prevents timing attacks on password/username verification
 */
export function secureCompare(a: string, b: string): boolean {
  // Convert strings to buffers
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  // If lengths differ, compare bufA with itself to maintain constant time
  // This ensures the function always takes the same time regardless of input
  if (bufA.length !== bufB.length) {
    // Still perform constant-time comparison to prevent length oracle
    timingSafeEqual(bufA, bufA);
    return false;
  }

  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    // timingSafeEqual throws if buffers have different lengths
    // This should never happen due to check above, but handle gracefully
    return false;
  }
}

/**
 * Hash a string using SHA-256 for comparison
 *
 * WARNING: This is NOT suitable for password storage!
 * SHA-256 is too fast and vulnerable to brute-force attacks.
 * For password hashing, use bcrypt, scrypt, or argon2 instead.
 *
 * This function is provided for comparing non-sensitive data or
 * for use cases where the plaintext must be reconstructed later.
 * Current authentication does NOT use this function.
 */
export function hashString(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Compare a plaintext string against a hashed value
 *
 * WARNING: This uses SHA-256 which is NOT suitable for password verification!
 * Use this only for non-sensitive data comparison.
 * Current authentication does NOT use this function.
 *
 * Always performs hash operation to maintain constant time
 */
export function compareHashed(plaintext: string, hash: string): boolean {
  const plaintextHash = hashString(plaintext);
  return secureCompare(plaintextHash, hash);
}
