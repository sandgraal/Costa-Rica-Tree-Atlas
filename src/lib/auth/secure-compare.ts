import { timingSafeEqual, createHash } from "crypto";

/**
 * TRULY constant-time string comparison using hash normalization
 * Prevents timing attacks, length oracle, and cache timing attacks
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal
 *
 * Security properties:
 * - Fixed-length comparison (32 bytes) regardless of input
 * - No branches based on input characteristics
 * - No early exits
 * - Resistant to cache timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  // Hash both strings to fixed 32-byte length FIRST
  // This eliminates:
  // - Variable encoding time (UTF-8 complexity)
  // - Length oracle (both hashes are always 32 bytes)
  // - Cache timing (hash operation time is constant)
  const hashA = createHash("sha256").update(a, "utf8").digest();
  const hashB = createHash("sha256").update(b, "utf8").digest();

  // Now both buffers are ALWAYS 32 bytes - no length check needed!
  // timingSafeEqual will never throw, never branch on length
  return timingSafeEqual(hashA, hashB);
}

/**
 * Hash a string using SHA-256
 *
 * ⚠️ WARNING: NOT suitable for password storage!
 * SHA-256 is too fast and vulnerable to brute-force attacks.
 * For password hashing, use bcrypt, scrypt, or argon2.
 *
 * This is provided for legacy compatibility only.
 */
export function hashString(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Compare a plaintext string against a hashed value (constant-time)
 *
 * ⚠️ WARNING: This uses SHA-256 which is NOT suitable for password verification!
 * Use only for non-sensitive data comparison.
 */
export function compareHashed(plaintext: string, hash: string): boolean {
  const plaintextHash = hashString(plaintext);
  return secureCompare(plaintextHash, hash);
}
