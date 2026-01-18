/**
 * MFA Cryptography Utilities
 *
 * Encrypts/decrypts TOTP secrets using AES-256-GCM.
 * Uses MFA_ENCRYPTION_KEY from environment variables.
 */

import { serverEnv } from "@/lib/env/schema";

const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encrypt a TOTP secret using AES-256-GCM
 */
export async function encryptTotpSecret(secret: string): Promise<string> {
  const encryptionKey = serverEnv.MFA_ENCRYPTION_KEY;

  if (!encryptionKey || encryptionKey.length !== 64) {
    throw new Error(
      "MFA_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"
    );
  }

  // Convert hex key to buffer
  const keyBuffer = Buffer.from(encryptionKey, "hex");

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Convert secret to buffer
  const secretBuffer = new TextEncoder().encode(secret);

  // Import key for Web Crypto API
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: AUTH_TAG_LENGTH * 8, // bits
    },
    cryptoKey,
    secretBuffer
  );

  // Combine IV + ciphertext + auth tag
  const combined = new Uint8Array(IV_LENGTH + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), IV_LENGTH);

  // Return as base64
  return Buffer.from(combined).toString("base64");
}

/**
 * Decrypt a TOTP secret using AES-256-GCM
 */
export async function decryptTotpSecret(
  encryptedSecret: string
): Promise<string> {
  const encryptionKey = serverEnv.MFA_ENCRYPTION_KEY;

  if (!encryptionKey || encryptionKey.length !== 64) {
    throw new Error(
      "MFA_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"
    );
  }

  // Convert hex key to buffer
  const keyBuffer = Buffer.from(encryptionKey, "hex");

  // Decode base64
  const combined = Buffer.from(encryptedSecret, "base64");

  // Extract IV and ciphertext
  const iv = combined.subarray(0, IV_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH);

  // Import key for Web Crypto API
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: AUTH_TAG_LENGTH * 8, // bits
    },
    cryptoKey,
    ciphertext
  );

  // Convert back to string
  return new TextDecoder().decode(decrypted);
}

/**
 * Generate cryptographically secure backup codes
 * Returns array of 10 codes in format: XXXX-XXXX-XXXX
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  // cspell:disable-next-line
  // eslint-disable-next-line no-secrets/no-secrets
  const characters = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excluding I, O for clarity

  for (let i = 0; i < count; i++) {
    const segments: string[] = [];

    for (let j = 0; j < 3; j++) {
      let segment = "";
      for (let k = 0; k < 4; k++) {
        // Avoid modulo bias by discarding values outside the largest multiple of
        // characters.length that fits into a 32‑bit unsigned integer.
        const maxUnbiased = Math.floor(2 ** 32 / characters.length) * characters.length;
        let randomIndex: number;

        // This loop is extremely unlikely to iterate more than once, since the
        // discarded range is strictly less than characters.length.
        while (true) {
          const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
          if (randomValue < maxUnbiased) {
            randomIndex = randomValue % characters.length;
            break;
          }
        }

        // eslint-disable-next-line security/detect-object-injection
        segment += characters[randomIndex];
      }
      segments.push(segment);
    }

    codes.push(segments.join("-"));
  }

  return codes;
}
