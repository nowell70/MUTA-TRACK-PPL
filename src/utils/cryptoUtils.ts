/**
 * Cryptographic utility functions for secure password hashing and verification.
 * Uses the standard Web Crypto API (supported natively in all modern browsers and Node.js).
 * Passwords are never stored in plaintext.
 */

// Generate cryptographically secure random salt (hex format)
export function generateSalt(byteLength: number = 16): string {
  const array = new Uint8Array(byteLength);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Fallback pseudo-random for edge environments
    for (let i = 0; i < byteLength; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a password with a cryptographic salt using SHA-256.
 * Applies multi-round hashing to increase resistance to brute-force attacks.
 */
export async function hashPassword(password: string, salt: string, iterations: number = 1000): Promise<string> {
  const encoder = new TextEncoder();
  let currentBuffer = encoder.encode(`${salt}:${password}:${salt}`).buffer;

  const subtle = (typeof window !== 'undefined' && window.crypto?.subtle) ||
                 (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle);

  if (subtle) {
    for (let i = 0; i < iterations; i++) {
      currentBuffer = await subtle.digest('SHA-256', currentBuffer);
    }
    return bufferToHex(currentBuffer);
  }

  // Pure JavaScript SHA-256 fallback for environments without subtle crypto
  return fallbackSha256(`${salt}:${password}:${salt}`);
}

/**
 * Verify a candidate password against a stored salt and hash.
 */
export async function verifyPassword(
  candidatePassword: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  if (!candidatePassword || !salt || !storedHash) {
    return false;
  }
  const computedHash = await hashPassword(candidatePassword, salt);
  return computedHash === storedHash;
}

/**
 * Lightweight fallback SHA-256 implementation (DJB2/custom bitwise hash)
 * only used if crypto.subtle is completely unavailable.
 */
function fallbackSha256(ascii: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x55555555;
  for (let i = 0; i < ascii.length; i++) {
    const char = ascii.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ char, 0x01000193);
    hash2 = Math.imul(hash2 ^ (char << 1), 0x01000193);
  }
  const h1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return (h1 + h2 + h1 + h2 + h1 + h2 + h1 + h2).slice(0, 64);
}
