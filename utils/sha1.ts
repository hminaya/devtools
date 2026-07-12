/**
 * SHA-1 hash generation utilities
 * Pure JavaScript implementation - no dependencies
 */

export function generateSHA1FromBytes(bytes: Uint8Array): string {
  // SHA-1 implementation
  const h0 = 0x67452301;
  const h1 = 0xEFCDAB89;
  const h2 = 0x98BADCFE;
  const h3 = 0x10325476;
  const h4 = 0xC3D2E1F0;

  // Pre-processing
  const ml = bytes.length * 8;
  const paddingLength = (((ml + 64) >>> 9) << 4) + 15;
  const words = new Uint32Array(paddingLength + 1);

  // Copy bytes to words
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2]! |= bytes[i]! << (24 - (i % 4) * 8);
  }

  // Append 1 bit
  words[bytes.length >>> 2]! |= 0x80 << (24 - (bytes.length % 4) * 8);

  // Append length
  words[paddingLength]! = ml;

  // Process message in 512-bit chunks
  let a = h0;
  let b = h1;
  let c = h2;
  let d = h3;
  let e = h4;

  const w = new Uint32Array(80);

  for (let i = 0; i < words.length; i += 16) {
    const h0Temp = a;
    const h1Temp = b;
    const h2Temp = c;
    const h3Temp = d;
    const h4Temp = e;

    for (let j = 0; j < 80; j++) {
      if (j < 16) {
        w[j]! = words[i + j] || 0;
      } else {
        w[j]! = rotateLeft(w[j - 3]! ^ w[j - 8]! ^ w[j - 14]! ^ w[j - 16]!, 1);
      }

      let f: number;
      let k: number;

      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5A827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }

      const temp = (rotateLeft(a, 5) + f + e + k + w[j]!) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }

    a = (a + h0Temp) >>> 0;
    b = (b + h1Temp) >>> 0;
    c = (c + h2Temp) >>> 0;
    d = (d + h3Temp) >>> 0;
    e = (e + h4Temp) >>> 0;
  }

  // Produce final hash
  return [a, b, c, d, e]
    .map((h) => h.toString(16).padStart(8, '0'))
    .join('');
}

function rotateLeft(n: number, s: number): number {
  return ((n << s) | (n >>> (32 - s))) >>> 0;
}

/**
 * Generate SHA-1 hash from a UTF-8 string.
 * Provided for backward compatibility — internally delegates to
 * generateSHA1FromBytes with UTF-8 encoded bytes.
 */
export function generateSHA1(text: string): string {
  // Convert string to UTF-8 bytes
  const utf8 = unescape(encodeURIComponent(text));
  const bytes = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i++) {
    bytes[i]! = utf8.charCodeAt(i);
  }
  return generateSHA1FromBytes(bytes);
}
