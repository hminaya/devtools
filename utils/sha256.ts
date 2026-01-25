/**
 * SHA-256 and SHA-512 hash generation utilities
 * Uses the Web Crypto API for reliable, secure hashing
 */

export type SHAAlgorithm = 'SHA-256' | 'SHA-512';

export async function generateSHA(text: string, algorithm: SHAAlgorithm = 'SHA-256'): Promise<string> {
  // Convert string to UTF-8 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generate hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest(algorithm, data);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

export async function generateSHA256(text: string): Promise<string> {
  return generateSHA(text, 'SHA-256');
}

export async function generateSHA512(text: string): Promise<string> {
  return generateSHA(text, 'SHA-512');
}
