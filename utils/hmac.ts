/**
 * HMAC (Hash-based Message Authentication Code) generation utilities.
 * Uses the Web Crypto API for SHA-1, SHA-256, SHA-384, SHA-512.
 */

export type HMACAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const ENCODER = new TextEncoder();

export async function generateHMAC(
  message: string,
  secret: string,
  algorithm: HMACAlgorithm = 'SHA-256',
  outputEncoding: BaseOutputEncoding = 'hex',
): Promise<{ hex: string; base64: string; base64url: string }> {
  const keyData = ENCODER.encode(secret);
  const msgData = ENCODER.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: algorithm } },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  const bytes = new Uint8Array(signature);

  return {
    hex: bytesToHex(bytes),
    base64: bytesToBase64(bytes),
    base64url: bytesToBase64url(bytes),
  };
}

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, '0');
  }
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return typeof btoa !== 'undefined' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
}

function bytesToBase64url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

type BaseOutputEncoding = 'hex' | 'base64' | 'base64url';