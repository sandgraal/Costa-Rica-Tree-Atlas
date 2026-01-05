/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  // If lengths differ, the strings cannot be equal
  // However, we still need to perform a comparison to maintain constant time
  let mismatch = a.length !== b.length ? 1 : 0;

  // Use the longer length to ensure we check all characters
  const maxLength = Math.max(a.length, b.length);

  let result = 0;
  for (let i = 0; i < maxLength; i++) {
    // Get character codes, using 0 if index is out of bounds
    const aChar = i < a.length ? a.charCodeAt(i) : 0;
    const bChar = i < b.length ? b.charCodeAt(i) : 0;
    result |= aChar ^ bChar;
  }

  return mismatch === 0 && result === 0;
}
