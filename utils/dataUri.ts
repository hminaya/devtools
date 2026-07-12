/**
 * Data URI conversion utilities.
 *
 * Encodes and decodes `data:` URLs of arbitrary MIME types, supporting
 * Base64 and percent-encoded text.
 *
 * Browser-native: uses FileReader, TextEncoder, btoa/atob in the client.
 * The functions are async where file reading is involved.
 */

const DATA_URI_RE = /^data:([^,]*?)(;base64)?,(.*)$/s;

export interface DataUriInfo {
  mimeType: string;
  isBase64: boolean;
  data: string;            // raw bytes-after-decode (as a UTF-8 string for text types)
  sizeBytes: number;       // byte length of decoded data
  charset?: string;        // optional charset param (e.g. "utf-8")
}

/**
 * Encode raw text into a data URI.
 */
export function textToDataUri(text: string, mimeType: string = 'text/plain', charset: string = 'utf-8'): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const bin = bytes.reduce((acc, b) => acc + String.fromCharCode(b), '');
  // Base64-encode UTF-8 bytes via btoa for safer URIs.
  const base64 = typeof btoa !== 'undefined'
    ? btoa(bin)
    : Buffer.from(bin, 'binary').toString('base64');
  const charsetParam = charset ? `;charset=${charset}` : '';
  return `data:${mimeType}${charsetParam};base64,${base64}`;
}

export async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Decode a data URI back into bytes (and metadata).
 * Returns the decoded payload as a UTF-8 string when possible (for text/* types),
 * or Base64-decoded bytes for binary types.
 */
export function decodeDataUri(uri: string): { ok: true; info: DataUriInfo } | { ok: false; error: string } {
  const match = uri.trim().match(DATA_URI_RE);
  if (!match) return { ok: false, error: 'Invalid data URI — must match "data:<mime>;base64?,<...>"' };

  const fullMime = match[1]!;
  const base64 = match[2] === ';base64';
  const payload = match[3]!;

  // Parse mime type and any parameters (e.g. "text/plain;charset=utf-8")
  const [mimeTypeRaw, ...params] = fullMime.split(';');
  const mimeType = mimeTypeRaw || 'text/plain';
  const charsetParam = params.find((p) => p.trim().startsWith('charset='));
  const charset = charsetParam ? charsetParam.split('=')[1]?.trim() : undefined;

  let bytes: Uint8Array;
  if (base64) {
    bytes = base64ToBytes(payload);
  } else {
    // Percent-decoded text
    const text = decodeURIComponent(payload.replace(/\+/g, ' '));
    bytes = new TextEncoder().encode(text);
  }

  const data = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

  return {
    ok: true,
    info: { mimeType, isBase64: base64, data, sizeBytes: bytes.length, charset },
  };
}

function base64ToBytes(b64: string): Uint8Array {
  let bin: string;
  if (typeof atob !== 'undefined') {
    bin = atob(b64);
  } else {
    bin = Buffer.from(b64, 'base64').toString('binary');
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bytes.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Try to detect if a data URI represents text content (image/, audio/, video/
 * are binary). Affects the UI choice of preview vs. raw output.
 */
export function isTextMime(mime: string): boolean {
  return /^(text\/|application\/(json|xml|yaml|javascript|x-www-form-urlencoded|graphql|ld\+json|x-sh|x-yaml|x-toml))/i.test(mime);
}