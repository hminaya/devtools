export interface EncodeResult {
  component: string;   // encodeURIComponent result
  full: string;        // encodeURI result
  error?: string;
}

export interface DecodeResult {
  component: string;   // decodeURIComponent result
  full: string;        // decodeURI result
  componentError?: string;
  fullError?: string;
}

export function encodeUrl(input: string): EncodeResult {
  try {
    return {
      component: encodeURIComponent(input),
      full: encodeURI(input),
    };
  } catch (e) {
    return { component: '', full: '', error: (e as Error).message };
  }
}

export function decodeUrl(input: string): DecodeResult {
  let component = '';
  let full = '';
  let componentError: string | undefined;
  let fullError: string | undefined;

  try {
    component = decodeURIComponent(input);
  } catch (e) {
    component = input;
    componentError = (e as Error).message;
  }

  try {
    full = decodeURI(input);
  } catch (e) {
    full = input;
    fullError = (e as Error).message;
  }

  return { component, full, componentError, fullError };
}

export interface DiffSegment {
  text: string;
  encoded: boolean;
}

/**
 * Walks the encoded string highlighting each %XX sequence as "encoded"
 * and unchanged characters as plain text.
 */
export function buildDiffSegments(encoded: string): DiffSegment[] {
  const segments: DiffSegment[] = [];
  let i = 0;
  while (i < encoded.length) {
    if (encoded[i] === '%' && i + 2 < encoded.length) {
      const hex = encoded.slice(i + 1, i + 3);
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        segments.push({ text: encoded.slice(i, i + 3), encoded: true });
        i += 3;
        continue;
      }
    }
    segments.push({ text: encoded[i]!, encoded: false });
    i++;
  }
  return segments;
}

export const SAMPLES: { label: string; value: string }[] = [
  { label: 'URL with params', value: 'https://example.com/search?q=hello world&lang=en&filter=type:article' },
  { label: 'Special chars', value: 'name=John Doe&email=john+doe@example.com&note=10% off & free shipping!' },
  { label: 'Unicode', value: 'こんにちは世界 — café, naïve, résumé' },
  { label: 'API key', value: 'Authorization: Bearer eyJhbGc/iOiJIUzI1NiJ9.payload+data==&redirect=/dashboard' },
];
