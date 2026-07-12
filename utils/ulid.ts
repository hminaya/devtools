/**
 * ULID (Universally Unique Lexicographically Sortable Identifier) generator.
 * Implements the ULID spec (https://github.com/ulid/spec):
 *   - 128 bits: 48-bit Unix timestamp (ms) + 80 bits of crypto-random
 *   - 26 chars of Crockford Base32
 *   - Lexicographically sortable (string compare == time compare)
 *   - Monotonic option to avoid collisions when generating in same ms
 */

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const DECODE_CROCKFORD: Record<string, number> = Object.fromEntries(
  CROCKFORD.split('').map((c, i) => [c, i] as [string, number])
);
// also accept lowercase + i,l,o,s which alias to 1,1,0,5
DECODE_CROCKFORD['i'] = 1; DECODE_CROCKFORD['I'] = 1;
DECODE_CROCKFORD['l'] = 1; DECODE_CROCKFORD['L'] = 1;
DECODE_CROCKFORD['o'] = 0; DECODE_CROCKFORD['O'] = 0;
DECODE_CROCKFORD['s'] = 5; DECODE_CROCKFORD['S'] = 5;
const ENCRYPT_TIME_LEN = 10;  // 48-bit timestamp → 10 chars
const RANDOM_LEN = 16;          // 80-bit random → 16 chars

function encodeTime(time: number, len: number): string {
  let out = '';
  let ts = time;
  for (let i = 0; i < len; i++) {
    const mod = ts % 32;
    out = CROCKFORD[mod]! + out;
    ts = Math.floor(ts / 32);
  }
  return out;
}

function encodeRandom(bytes: Uint8Array, len: number): string {
  // Each char holds 5 bits; we need len*5 = 80 bits.
  // Pull bits from crypto-random bytes.
  let out = '';
  let buffer = 0;
  let bitsInBuffer = 0;
  for (let i = 0; i < len; i++) {
    while (bitsInBuffer < 5) {
      buffer = (buffer << 8) | (bytes[i % bytes.length]!);
      bitsInBuffer += 8;
    }
    const idx = (buffer >>> (bitsInBuffer - 5)) & 0x1F;
    bitsInBuffer -= 5;
    out += CROCKFORD[idx]!;
  }
  return out;
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

export interface ULID {
  ulid: string;
  timestamp: number;
}

export function generateULID(timestamp: number = Date.now()): string {
  const timePart = encodeTime(timestamp, ENCRYPT_TIME_LEN);
  const randomPart = encodeRandom(randomBytes(10), RANDOM_LEN);
  return timePart + randomPart;
}

export function generateULIDs(count: number = 1): string[] {
  return Array.from({ length: count }, () => generateULID());
}

/**
 * Monotonic ULID generation — if two ULIDs are generated in the same millisecond,
 * the random part of the second is incremented by 1 (instead of regenerating).
 * This preserves sort order across bursts within a single ms.
 */
export class MonotonicULID {
  private lastTime = 0;
  private lastRandom = '';

  next(timestamp: number = Date.now()): string {
    if (timestamp < this.lastTime) {
      // Clock went backward — preserve monotonicity by reusing last time.
      timestamp = this.lastTime;
    }
    if (timestamp === this.lastTime) {
      // Increment the last random part by 1 in the 80-bit field.
      this.lastRandom = incrementCrockford(this.lastRandom);
    } else {
      this.lastRandom = encodeRandom(randomBytes(10), RANDOM_LEN);
      this.lastTime = timestamp;
    }
    return encodeTime(timestamp, ENCRYPT_TIME_LEN) + this.lastRandom;
  }

  reset() {
    this.lastTime = 0;
    this.lastRandom = '';
  }
}

function incrementCrockford(random: string): string {
  const chars = random.split('');
  let i = chars.length - 1;
  while (i >= 0) {
    const cur = DECODE_CROCKFORD[chars[i]!.toUpperCase()] ?? 0;
    const next = cur + 1;
    if (next < 32) {
      chars[i] = CROCKFORD[next]!;
      return chars.join('');
    }
    chars[i] = CROCKFORD[0]!;
    i--;
  }
  // Overflow — wrap to all zeros (extremely unlikely; 80 bits)
  return chars.join('');
}

/**
 * Decode the timestamp portion of a ULID (first 10 chars).
 * Useful for inspecting when a given ULID was minted.
 */
export function decodeULIDTimestamp(ulid: string): number {
  const timePart = ulid.slice(0, ENCRYPT_TIME_LEN).toUpperCase();
  let ts = 0;
  for (let i = 0; i < timePart.length; i++) {
    const val = DECODE_CROCKFORD[timePart[i]!];
    if (val === undefined) return 0;
    ts = ts * 32 + val;
  }
  return ts;
}

export function isULID(input: string): boolean {
  return /^[0-9A-TV-Za-tv-z]{26}$/.test(input.trim());
}