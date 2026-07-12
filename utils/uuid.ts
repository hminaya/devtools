import { generateMD5 } from './md5';
import { generateSHA1FromBytes } from './sha1';

export type UUIDVersion = 'nil' | 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8';

export interface UUIDOptions {
  // v2 local domain + id (e.g. group/user id). id 0-0xFFFFFFFF, domain 0-255.
  localId?: number;
  localDomain?: number;
  // v3 / v5 name-based require a namespace UUID (string) + name (string).
  namespace?: string;
  name?: string;
  // Optional node id (48-bit hex) for v1/v6 — randomized if not provided.
  node?: string;
  // Optional clock sequence (14-bit, 0-16383) for v1/v6 — randomized if not provided.
  clockSeq?: number;
}

const HEX = '0123456789abcdef';

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[-{}]/g, '').toLowerCase();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    out[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return out;
}

// Format 16 bytes as 8-4-4-4-12 with embedded version/variant bits.
function formatUUID(bytes: Uint8Array, version: number): string {
  // version (bits 12-15 of byte 6)
  bytes[6] = (bytes[6]! & 0x0f) | (version << 4);
  // variant (bits 6-7 of byte 8) — RFC 4122 / RFC 9562 (10xxxxxx)
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// — v1 — time-based, Gregorian timestamp (100-ns intervals since 1582-10-15)
const GREGORIAN_OFFSET_MS = Date.UTC(1582, 9, 15) - Date.UTC(1970, 0, 1); // ms between epochs
function generateV1(opts: UUIDOptions): string {
  const now = Date.now();
  // 100-ns intervals since Gregorian epoch
  const timestamp100ns = BigInt(now + GREGORIAN_OFFSET_MS) * 10000n;
  // Add a small random count to make generated values unique within the same millisecond
  const count = BigInt(Math.floor(Math.random() * 10000));
  const ts = timestamp100ns + count;

  // time_low (32 bits, least significant — bytes 0-3 hold the low part in v1's bit order)
  const timeLow = Number(ts & 0xffffffffn);
  const timeMid = Number((ts >> 32n) & 0xffffn);
  // time_hi_and_version: 4 bits version + 12 bits of time_hi
  const timeHi = Number((ts >> 48n) & 0x0fffn);

  // node (48 bits) — set multicast bit (0x01) for privacy if we generate it
  let nodeBytes: Uint8Array;
  if (opts.node) {
    nodeBytes = hexToBytes(opts.node.padStart(12, '0').slice(0, 12));
    if (nodeBytes.length !== 6) nodeBytes = new Uint8Array(6);
  } else {
    nodeBytes = randomBytes(6);
    nodeBytes[0] = nodeBytes[0]! | 0x01; // multicast bit
  }

  let clockSeq = opts.clockSeq;
  if (clockSeq === undefined || clockSeq < 0 || clockSeq > 0x3fff) {
    clockSeq = Math.floor(Math.random() * 0x4000);
  }

  const bytes = new Uint8Array(16);
  bytes[0] = (timeLow >>> 24) & 0xff;
  bytes[1] = (timeLow >>> 16) & 0xff;
  bytes[2] = (timeLow >>> 8) & 0xff;
  bytes[3] = timeLow & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = (timeHi >>> 8) & 0xff;
  bytes[7] = timeHi & 0xff;
  bytes[8] = (clockSeq >>> 8) & 0x3f;
  bytes[9] = clockSeq & 0xff;
  bytes.set(nodeBytes, 10);
  return formatUUID(bytes, 1);
}

// — v2 — DCE Security: replaces low 32 bits of v1 timestamp with local id+domain
function generateV2(opts: UUIDOptions): string {
  const now = Date.now();
  const ts = BigInt(now + GREGORIAN_OFFSET_MS) * 10000n;
  const timeMid = Number((ts >> 32n) & 0xffffn);
  const timeHi = Number((ts >> 48n) & 0x0fffn);

  const localId = opts.localId !== undefined ? (opts.localId >>> 0) : Math.floor(Math.random() * 0xffffffff);

  let nodeBytes: Uint8Array;
  if (opts.node) {
    nodeBytes = hexToBytes(opts.node.padStart(12, '0').slice(0, 12));
    if (nodeBytes.length !== 6) nodeBytes = new Uint8Array(6);
  } else {
    nodeBytes = randomBytes(6);
    nodeBytes[0] = nodeBytes[0]! | 0x01;
  }

  let clockSeq = opts.clockSeq;
  if (clockSeq === undefined || clockSeq < 0 || clockSeq > 0x3fff) {
    clockSeq = Math.floor(Math.random() * 0x4000);
  }

  const bytes = new Uint8Array(16);
  // low 32 bits replaced with local identifier (little-endian per RFC 9562)
  bytes[0] = (localId >>> 24) & 0xff;
  bytes[1] = (localId >>> 16) & 0xff;
  bytes[2] = (localId >>> 8) & 0xff;
  bytes[3] = localId & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = (timeHi >>> 8) & 0xff;
  bytes[7] = timeHi & 0xff;
  bytes[8] = (clockSeq >>> 8) & 0x3f;
  bytes[9] = clockSeq & 0xff;
  // domain embedded in the high octet of the clockSeq+variant byte
  const domain = (opts.localDomain ?? 0) & 0xff;
  bytes[8] = (bytes[8]! & 0x3f) | ((domain & 0x0f) << 4);
  bytes.set(nodeBytes, 10);
  return formatUUID(bytes, 2);
}

// — v3 / v5 — name-based: MD5 (v3) or SHA-1 (v5)
function nameHashToUUID(hashHex: string, version: 3 | 5): string {
  const bytes = hexToBytes(hashHex.slice(0, 32));
  return formatUUID(bytes, version);
}

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const OID_NAMESPACE = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
const X500_NAMESPACE = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

export const UUID_NAMESPACES: Record<string, string> = {
  dns: DNS_NAMESPACE,
  url: URL_NAMESPACE,
  oid: OID_NAMESPACE,
  x500: X500_NAMESPACE,
};

// Concatenate namespace bytes + name UTF-8 bytes into a single raw byte buffer.
function toNameInputBytes(namespace: string, name: string): Uint8Array {
  const nsBytes = hexToBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const out = new Uint8Array(nsBytes.length + nameBytes.length);
  out.set(nsBytes, 0);
  out.set(nameBytes, nsBytes.length);
  return out;
}

function generateV3(opts: UUIDOptions): string {
  const ns = (opts.namespace && opts.namespace.trim()) || DNS_NAMESPACE;
  const name = opts.name ?? '';
  const inputBytes = toNameInputBytes(ns, name);
  // MD5 util expects Latin-1 char codes; our input may contain bytes > 0x7F,
  // so build a Latin-1 string (each byte → one char), since md51 reads via charCodeAt.
  let latin1 = '';
  for (const b of inputBytes) latin1 += String.fromCharCode(b);
  return nameHashToUUID(generateMD5(latin1), 3);
}

function generateV5(opts: UUIDOptions): string {
  const ns = (opts.namespace && opts.namespace.trim()) || DNS_NAMESPACE;
  const name = opts.name ?? '';
  const inputBytes = toNameInputBytes(ns, name);
  return nameHashToUUID(generateSHA1FromBytes(inputBytes), 5);
}

// — v4 — fully random
function generateV4(): string {
  const bytes = randomBytes(16);
  return formatUUID(bytes, 4);
}

// — v6 — Gregorian timestamp with bits reordered for lexicographic sort
function generateV6(opts: UUIDOptions): string {
  const now = Date.now();
  const ts = BigInt(now + GREGORIAN_OFFSET_MS) * 10000n;
  // 60-bit timestamp split into:
  //   time_high (32 bits, bits 59-28) → bytes 0-3
  //   time_mid  (16 bits, bits 27-12) → bytes 4-5
  //   time_low  (12 bits, bits 11-0)  → high 12 bits of bytes 6-7
  const timeHigh = Number(ts >> 28n) & 0xffffffff;
  const timeMid  = Number((ts >> 12n) & 0xffffn);
  const timeLow  = Number(ts & 0xfffn);

  const bytes = new Uint8Array(16);
  bytes[0] = (timeHigh >>> 24) & 0xff;
  bytes[1] = (timeHigh >>> 16) & 0xff;
  bytes[2] = (timeHigh >>> 8) & 0xff;
  bytes[3] = timeHigh & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = (timeLow >>> 8) & 0xff;
  bytes[7] = timeLow & 0xff;

  let clockSeq = opts.clockSeq;
  if (clockSeq === undefined || clockSeq < 0 || clockSeq > 0x3fff) {
    clockSeq = Math.floor(Math.random() * 0x4000);
  }
  bytes[8] = (clockSeq >>> 8) & 0x3f;
  bytes[9] = clockSeq & 0xff;

  let nodeBytes: Uint8Array;
  if (opts.node) {
    nodeBytes = hexToBytes(opts.node.padStart(12, '0').slice(0, 12));
    if (nodeBytes.length !== 6) nodeBytes = new Uint8Array(6);
  } else {
    nodeBytes = randomBytes(6);
    nodeBytes[0] = nodeBytes[0]! | 0x01;
  }
  bytes.set(nodeBytes, 10);
  return formatUUID(bytes, 6);
}

// — v7 — Unix-epoch milliseconds timestamp (48 bits) + random
function generateV7(): string {
  const bytes = new Uint8Array(16);
  const now = Date.now();
  // 48 bits of milliseconds
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;
  // 74 bits of randomness
  const rand = randomBytes(10);
  bytes.set(rand, 6);
  return formatUUID(bytes, 7);
}

// — v8 — implementation-defined random
function generateV8(): string {
  const bytes = randomBytes(16);
  return formatUUID(bytes, 8);
}

export function generateUUID(version: UUIDVersion, opts: UUIDOptions = {}): string {
  switch (version) {
    case 'nil':  return NIL_UUID;
    case 'v1':   return generateV1(opts);
    case 'v2':   return generateV2(opts);
    case 'v3':   return generateV3(opts);
    case 'v4':   return generateV4();
    case 'v5':   return generateV5(opts);
    case 'v6':   return generateV6(opts);
    case 'v7':   return generateV7();
    case 'v8':   return generateV8();
    default:     return generateV4();
  }
}

export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export function generateUUIDs(count: number = 1): string[] {
  return generateUUIDBatch('v4', count);
}

export function generateUUIDBatch(
  version: UUIDVersion,
  count: number = 1,
  opts: UUIDOptions = {}
): string[] {
  const uuids: string[] = [];
  for (let i = 0; i < count; i++) {
    uuids.push(generateUUID(version, opts));
  }
  return uuids;
}

export const UUID_DESCRIPTIONS: Record<UUIDVersion, string> = {
  nil: 'All-zero (special-case) UUID — useful as a sentinel/null value.',
  v1:  'Time-based UUID using Gregorian timestamps (100-ns intervals since 1582-10-15) + random node. Sortable by time generated.',
  v2:  'DCE Security UUID — v1 with the low 32 bits replaced by a local domain/identifier for security contexts.',
  v3:  'MD5 name-based UUID — deterministic. Same namespace+name always produces the same UUID.',
  v4:  'Fully random UUID — the most common choice for general use.',
  v5:  'SHA-1 name-based UUID — deterministic like v3, but uses SHA-1 for better collision resistance.',
  v6:  'Reordered time-based UUID — lexicographically sortable, ideal for database indexes.',
  v7:  'Modern Unix-epoch milliseconds sortable UUID (RFC 9562) — millisecond precision + random suffix.',
  v8:  'Custom/vendor-specific UUID — RFC 9562 variant with proper version+variant bits set.',
};