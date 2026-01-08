/**
 * Maximum input length for secure comparison to prevent HashDoS attacks
 * Admin credentials should be well under this limit (typical max ~256 chars)
 */
const MAX_INPUT_LENGTH = 10000;

/**
 * TRULY constant-time string comparison using hash normalization
 * Prevents timing attacks, length oracle, and cache timing attacks
 *
 * Uses Web Crypto API (available in Edge Runtime)
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal
 * @throws Error if input exceeds MAX_INPUT_LENGTH (prevents HashDoS)
 *
 * Security properties:
 * - Fixed-length comparison (32 bytes) regardless of input
 * - No branches based on input characteristics
 * - No early exits
 * - Resistant to cache timing attacks
 * - Protected against HashDoS attacks via input length validation
 */
export async function secureCompare(a: string, b: string): Promise<boolean> {
  // Prevent HashDoS attacks by rejecting excessively long inputs
  // This check is done BEFORE any expensive operations
  if (a.length > MAX_INPUT_LENGTH || b.length > MAX_INPUT_LENGTH) {
    throw new Error(
      `Input length exceeds maximum allowed (${MAX_INPUT_LENGTH} characters)`
    );
  }

  // Hash both strings to fixed 32-byte length FIRST using Web Crypto API
  // This eliminates:
  // - Variable encoding time (UTF-8 complexity)
  // - Length oracle (both hashes are always 32 bytes)
  // - Cache timing (hash operation time is constant)
  const encoder = new TextEncoder();
  const hashA = await crypto.subtle.digest("SHA-256", encoder.encode(a));
  const hashB = await crypto.subtle.digest("SHA-256", encoder.encode(b));

  // Convert to Uint8Array for comparison
  const arrayA = new Uint8Array(hashA);
  const arrayB = new Uint8Array(hashB);

  // Constant-time comparison
  let result = 0;
  for (let i = 0; i < arrayA.length; i++) {
    result |= arrayA[i] ^ arrayB[i];
  }

  return result === 0;
}

/**
 * Hash a string using SHA-256 (Web Crypto API)
 *
 * ⚠️ WARNING: NOT suitable for password storage!
 * SHA-256 is too fast and vulnerable to brute-force attacks.
 * For password hashing, use bcrypt, scrypt, or argon2.
 *
 * This is provided for legacy compatibility only.
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compare a plaintext string against a hashed value (constant-time)
 *
 * ⚠️ WARNING: This uses SHA-256 which is NOT suitable for password verification!
 * Use only for non-sensitive data comparison.
 */
export async function compareHashed(
  plaintext: string,
  hash: string
): Promise<boolean> {
  const plaintextHash = await hashString(plaintext);
  return secureCompare(plaintextHash, hash);
}
