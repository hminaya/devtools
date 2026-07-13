/**
 * CIDR / Subnet calculator helpers for both IPv4 (32-bit) and IPv6 (128-bit).
 * All math uses BigInt so masks and host counts stay exact across the full
 * 128-bit address space with no precision loss.
 */

export type IpVersion = 'ipv4' | 'ipv6';

export interface CalculateCidrResult {
  version: IpVersion;
  valid: boolean;
  error?: string;

  input: string;
  prefix: number;
  prefixMin: number;
  prefixMax: number;

  ipInt: bigint;
  networkInt: bigint;
  broadcastInt: bigint | null; // null for IPv6 (no broadcast)

  ip: string;
  network: string;
  broadcast: string | null;
  netmask: string | null; // dotted for IPv4, null for IPv6
  wildcard: string | null; // dotted for IPv4, null for IPv6
  prefixLength: number;

  totalAddresses: bigint;
  usableHosts: bigint; // IPv4: total-1/-2 per RFC 3021; IPv6: = total

  firstHost: string | null;
  lastHost: string | null;
  hostRange: string | null;

  reverseDns: string;
  ipAsInteger: string;
  binaryView: string;

  classLabel: string | null; // A/B/C/D/E for IPv4, null for IPv6
  isPrivate: boolean;
  isLoopback: boolean;
  isLinkLocal: boolean;
  isMulticast: boolean;
  isDocumentation: boolean;
  isReserved: boolean;
  specialLabel: string | null;
}

export interface SubnetResult {
  network: string;
  firstHost: string | null;
  lastHost: string | null;
  usableHosts: bigint;
  cidr: string;
}

export interface SubnetSplitOptions {
  prefix: number;
  newPrefix: number;
  version: IpVersion;
  maxResults?: number;
}

// --- Constants ---------------------------------------------------------------

const IPV4_BITS = 32n;
const IPV6_BITS = 128n;
const IPV4_MAX = (1n << IPV4_BITS) - 1n;
const IPV6_MAX = (1n << IPV6_BITS) - 1n;

// --- Parsing -----------------------------------------------------------------

export function detectVersion(input: string): IpVersion {
  return input.includes(':') ? 'ipv6' : 'ipv4';
}

interface ParsedCidr {
  version: IpVersion;
  ip: string;
  prefix: number | null;
  error?: string;
}

export function parseCidrInput(input: string): ParsedCidr {
  const trimmed = input.trim();
  if (!trimmed) return { version: 'ipv4', ip: '', prefix: null, error: 'Empty input' };

  const slashIdx = trimmed.indexOf('/');
  let ipPart = trimmed;
  let prefixPart: string | null = null;

  if (slashIdx >= 0) {
    ipPart = trimmed.slice(0, slashIdx);
    prefixPart = trimmed.slice(slashIdx + 1);
  }

  const version = detectVersion(ipPart);
  const ipError = validateIp(ipPart, version);
  if (ipError) return { version, ip: ipPart, prefix: null, error: ipError };

  let prefix: number | null = null;
  if (prefixPart !== null) {
    // Could be numeric prefix or dotted mask (IPv4 only)
    if (version === 'ipv4' && prefixPart.includes('.')) {
      const mask = dottedMaskToPrefix(prefixPart);
      if (mask === null) {
        return { version, ip: ipPart, prefix: null, error: 'Invalid dotted subnet mask' };
      }
      prefix = mask;
    } else {
      const parsed = Number(prefixPart);
      if (!Number.isInteger(parsed) || parsed < 0) {
        return { version, ip: ipPart, prefix: null, error: 'Prefix length must be a non-negative integer' };
      }
      prefix = parsed;
    }
  }

  return { version, ip: ipPart, prefix };
}

function validateIp(ip: string, version: IpVersion): string | undefined {
  if (version === 'ipv4') {
    return validateIpv4(ip);
  }
  return validateIpv6(ip);
}

function validateIpv4(ip: string): string | undefined {
  const parts = ip.split('.');
  if (parts.length !== 4) return 'IPv4 address must have 4 octets';
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return `Invalid octet "${p}"`;
    const n = Number(p);
    if (n < 0 || n > 255) return `Octet "${p}" out of range (0-255)`;
  }
  return undefined;
}

function validateIpv6(ip: string): string | undefined {
  // RFC 4291 parser — supports leading/trailing "::" compression, mixed
  // IPv4-mapped tail (a.b.c.d), and rejects malformed groups.
  let address = ip.trim();
  if (address.length === 0) return 'Empty IPv6 address';

  // Handle optional IPv4 tail (counts as 2 groups of 16 bits)
  let ipv4Tail: number | null = null;
  const lastDot = address.lastIndexOf('.');
  const lastColon = address.lastIndexOf(':');
  if (lastDot > lastColon) {
    // Mixed form: trailing IPv4
    const colonIdx = address.lastIndexOf(':');
    if (colonIdx < 0) return 'Invalid IPv6 address';
    const v4Part = address.slice(colonIdx + 1);
    const v4Err = validateIpv4(v4Part);
    if (v4Err) return v4Err;
    const [a = 0, b = 0, c = 0, d = 0] = v4Part.split('.').map(Number);
    ipv4Tail = a * 0x1000000 + b * 0x10000 + c * 0x100 + d;
    address = address.slice(0, colonIdx + 1) + 'XXXX'; // placeholder; we'll splice later
  }

  // Normalize "::" into a sentinel we can split on
  const doubleColonIdx = address.indexOf('::');
  const hasDoubleColon = doubleColonIdx >= 0;
  if (hasDoubleColon && address.indexOf('::', doubleColonIdx + 2) >= 0) {
    return 'Invalid IPv6 address: "::" may appear only once';
  }

  let head: string[];
  let tail: string[];
  if (hasDoubleColon) {
    const before = address.slice(0, doubleColonIdx);
    const after = address.slice(doubleColonIdx + 2);
    head = before ? before.split(':') : [];
    tail = after ? after.split(':') : [];
  } else {
    head = address.split(':');
    tail = [];
  }

  // Validate each group
  const allGroups = [...head, ...tail];
  for (const g of allGroups) {
    if (g === 'XXXX') continue; // placeholder for IPv4 tail
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) {
      return `Invalid IPv6 group "${g}"`;
    }
  }

  const groupCount = allGroups.length + (ipv4Tail !== null ? 1 : 0); // IPv4 tail placeholder = 1 slot; expands to 2 groups
  if (hasDoubleColon) {
    if (groupCount > 8) return 'IPv6 address has too many groups';
  } else {
    if (groupCount !== 8) return 'IPv6 address must have exactly 8 groups (or use "::")';
  }

  return undefined;
}

function dottedMaskToPrefix(mask: string): number | null {
  const parts = mask.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map(Number);
  if (octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) return null;
  const o0 = octets[0] ?? 0;
  const o1 = octets[1] ?? 0;
  const o2 = octets[2] ?? 0;
  const o3 = octets[3] ?? 0;
  const int = (o0 << 24) | (o1 << 16) | (o2 << 8) | o3;
  if (int === 0) return 0;
  // Mask must be a contiguous run of 1s followed by 0s
  const flipped = (~int) >>> 0;
  const isContiguous = (flipped & (flipped + 1)) === 0;
  if (!isContiguous) return null;
  // Count leading 1s
  let prefix = 0;
  for (let i = 31; i >= 0; i--) {
    if ((int >>> i) & 1) prefix++;
    else break;
  }
  return prefix;
}

// --- Conversion --------------------------------------------------------------

export function ipToInt(ip: string, version: IpVersion): bigint {
  if (version === 'ipv4') return ipv4ToInt(ip);
  return ipv6ToInt(ip);
}

function ipv4ToInt(ip: string): bigint {
  const parts = ip.split('.').map(Number);
  const a = parts[0] ?? 0;
  const b = parts[1] ?? 0;
  const c = parts[2] ?? 0;
  const d = parts[3] ?? 0;
  return (BigInt(a) << 24n) | (BigInt(b) << 16n) | (BigInt(c) << 8n) | BigInt(d);
}

function ipv6ToInt(ip: string): bigint {
  let address = ip.trim();
  let ipv4Tail: bigint | null = null;
  const lastDot = address.lastIndexOf('.');
  const lastColon = address.lastIndexOf(':');
  if (lastDot > lastColon) {
    const colonIdx = address.lastIndexOf(':');
    const v4Part = address.slice(colonIdx + 1);
    const v4Parts = v4Part.split('.').map(Number);
    const a = v4Parts[0] ?? 0;
    const b = v4Parts[1] ?? 0;
    const c = v4Parts[2] ?? 0;
    const d = v4Parts[3] ?? 0;
    ipv4Tail = (BigInt(a) << 24n) | (BigInt(b) << 16n) | (BigInt(c) << 8n) | BigInt(d);
    address = address.slice(0, colonIdx); // drop ":a.b.c.d" entirely
  }

  const dcIdx = address.indexOf('::');
  const hasDc = dcIdx >= 0;
  let head: string[];
  let tail: string[];
  if (hasDc) {
    const before = address.slice(0, dcIdx);
    const after = address.slice(dcIdx + 2);
    head = before ? before.split(':') : [];
    tail = after ? after.split(':') : [];
  } else {
    head = address.split(':');
    tail = [];
  }

  const groups: bigint[] = [];
  for (const g of head) groups.push(BigInt('0x' + g));
  if (hasDc) {
    // IPv4 tail expands to two 16-bit groups, so subtract 2 from the fill.
    const filled = 8n - BigInt(head.length + tail.length) - (ipv4Tail !== null ? 2n : 0n);
    for (let i = 0n; i < filled; i++) groups.push(0n);
  }
  for (const g of tail) groups.push(BigInt('0x' + g));
  if (ipv4Tail !== null) {
    groups.push((ipv4Tail >> 16n) & 0xFFFFn);
    groups.push(ipv4Tail & 0xFFFFn);
  }

  let result = 0n;
  for (const g of groups) {
    result = (result << 16n) | (g & 0xFFFFn);
  }
  return result;
}

export function intToIp(int: bigint, version: IpVersion): string {
  if (version === 'ipv4') return intToIpv4(int);
  return intToIpv6(int);
}

function intToIpv4(int: bigint): string {
  const masked = int & IPV4_MAX;
  const a = (masked >> 24n) & 0xFFn;
  const b = (masked >> 16n) & 0xFFn;
  const c = (masked >> 8n) & 0xFFn;
  const d = masked & 0xFFn;
  return `${a}.${b}.${c}.${d}`;
}

function intToIpv6(int: bigint): string {
  const masked = int & IPV6_MAX;
  const groups: bigint[] = [];
  for (let i = 7; i >= 0; i--) {
    groups.push((masked >> BigInt(i * 16)) & 0xFFFFn);
  }

  // RFC 5952 canonical form: lowercase, compress the LONGEST run of zero
  // groups (>=2). Tie-break to the first run. Also detect mixed IPv4 tail for
  // addresses in ::ffff:a.b.c.d form for nicer output.
  const hex = groups.map((g) => g.toString(16));

  // Find longest zero run
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (hex[i] === '0') {
      if (curStart < 0) curStart = i;
      curLen++;
      if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen < 2) {
    return hex.join(':');
  }

  const before = hex.slice(0, bestStart).join(':');
  const after = hex.slice(bestStart + bestLen).join(':');
  return `${before}::${after}`;
}

// --- Mask helpers -------------------------------------------------------------

function maskForPrefix(prefix: number, version: IpVersion): bigint {
  const bits = version === 'ipv4' ? IPV4_BITS : IPV6_BITS;
  if (prefix <= 0) return 0n;
  if (prefix >= Number(bits)) return version === 'ipv4' ? IPV4_MAX : IPV6_MAX;
  return ((1n << BigInt(prefix)) - 1n) << (bits - BigInt(prefix));
}

function wildcardForPrefix(prefix: number): bigint {
  return IPV4_MAX ^ maskForPrefix(prefix, 'ipv4');
}

// --- Reverse DNS --------------------------------------------------------------

export function reverseDns(networkInt: bigint, prefix: number, version: IpVersion): string {
  if (version === 'ipv4') {
    // Only the network portion is reversed for the zone
    const ipInt = networkInt;
    const octets: string[] = [];
    let cur = ipInt;
    for (let i = 0; i < 4; i++) {
      octets.unshift(String(cur & 0xFFn));
      cur >>= 8n;
    }
    // For a /N, the reversed zone contains only the first N bits worth of octets.
    // Many tools show the full IP reverse-PTR; we do that here for clarity.
    return `${octets[3]}.${octets[2]}.${octets[1]}.${octets[0]}.in-addr.arpa`;
  }

  // IPv6: nibble reversal per RFC 3152
  const nibbles: string[] = [];
  let cur = networkInt;
  for (let i = 0; i < 32; i++) {
    nibbles.unshift((cur & 0xFn).toString(16));
    cur >>= 4n;
  }
  return `${nibbles.join('.')}.ip6.arpa`;
}

// --- BigInt formatting --------------------------------------------------------

export function formatBigInt(n: bigint): string {
  if (n < 1000n) return n.toString();
  // Group with commas
  const s = n.toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatBigIntWithScientific(n: bigint, version: IpVersion): string {
  const grouped = formatBigInt(n);
  if (version === 'ipv4') return grouped;
  // For IPv6, values can be astronomically large — show both grouped and scientific.
  if (n < 1_000_000_000_000_000n) return grouped;
  const asNumber = Number(n);
  if (!isFinite(asNumber)) return grouped;
  const sci = asNumber.toExponential(4).replace(/\.?0+e/, 'e');
  return `${grouped} (${sci})`;
}

// --- Special range detection --------------------------------------------------

interface SpecialRange {
  label: string;
  isPrivate: boolean;
  isLoopback: boolean;
  isLinkLocal: boolean;
  isMulticast: boolean;
  isDocumentation: boolean;
  isReserved: boolean;
}

function classifyIpv4(ipInt: bigint): SpecialRange {
  const firstOctet = Number((ipInt >> 24n) & 0xFFn);
  if (firstOctet === 10) return { label: 'Private (RFC 1918)', isPrivate: true, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  if (firstOctet === 127) return { label: 'Loopback', isPrivate: false, isLoopback: true, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  if (firstOctet >= 224 && firstOctet <= 239) return { label: 'Multicast', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: true, isDocumentation: false, isReserved: false };
  if (firstOctet === 0) return { label: 'Reserved (This network)', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: true };
  if (firstOctet >= 240) return { label: 'Reserved (Future use)', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: true };
  // 172.16.0.0/12
  if (firstOctet === 172) {
    const second = Number((ipInt >> 16n) & 0xFFn);
    if (second >= 16 && second <= 31) return { label: 'Private (RFC 1918)', isPrivate: true, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  }
  // 192.168.0.0/16
  if (firstOctet === 192) {
    const second = Number((ipInt >> 16n) & 0xFFn);
    if (second === 168) return { label: 'Private (RFC 1918)', isPrivate: true, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  }
  // 169.254.0.0/16
  if (firstOctet === 169) {
    const second = Number((ipInt >> 16n) & 0xFFn);
    if (second === 254) return { label: 'Link-local (APIPA)', isPrivate: false, isLoopback: false, isLinkLocal: true, isMulticast: false, isDocumentation: false, isReserved: false };
  }
  // Documentation ranges (TEST-NET-1/2/3)
  if (ipInt === 0xC0000200n) return { label: 'Documentation (TEST-NET-1)', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: true, isReserved: false };
  // 192.0.2.0/24 -> 0xC0000200 - 0xC00002FF
  if (firstOctet === 192) {
    const second = Number((ipInt >> 16n) & 0xFFn);
    const third = Number((ipInt >> 8n) & 0xFFn);
    if (second === 0 && third === 2) return { label: 'Documentation (TEST-NET-1)', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: true, isReserved: false };
  }
  if (firstOctet === 198) {
    const second = Number((ipInt >> 16n) & 0xFFn);
    const third = Number((ipInt >> 8n) & 0xFFn);
    if (second === 51 && third === 100) return { label: 'Documentation (TEST-NET-2)', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: true, isReserved: false };
    if ((second === 18 || second === 19)) return { label: 'Benchmarking (RFC 2544)', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  }
  if (firstOctet === 203) {
    const second = Number((ipInt >> 16n) & 0xFFn);
    const third = Number((ipInt >> 8n) & 0xFFn);
    if (second === 0 && third === 113) return { label: 'Documentation (TEST-NET-3)', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: true, isReserved: false };
  }
  return { label: null as unknown as string, isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
}

function classifyIpv6(ipInt: bigint): SpecialRange {
  // ::1/128 — loopback
  if (ipInt === 1n) return { label: 'Loopback', isPrivate: false, isLoopback: true, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  // ::/128 — unspecified
  if (ipInt === 0n) return { label: 'Unspecified', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: true };
  // fc00::/7 — ULA (top 7 bits = 1111110 -> first byte 0xFC or 0xFD)
  const topByte = (ipInt >> 120n) & 0xFFn;
  if (topByte === 0xFCn || topByte === 0xFDn) return { label: 'Unique Local Address (ULA)', isPrivate: true, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  // fe80::/10 — link-local
  const topTwo = (ipInt >> 112n) & 0xFFFFn;
  if (topTwo >= 0xFE80n && topTwo <= 0xFEBFn) return { label: 'Link-local', isPrivate: false, isLoopback: false, isLinkLocal: true, isMulticast: false, isDocumentation: false, isReserved: false };
  // ff00::/8 — multicast
  if ((topByte & 0xFFn) === 0xFFn) return { label: 'Multicast', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: true, isDocumentation: false, isReserved: false };
  // 2001:db8::/32 — documentation
  const topFour = (ipInt >> 96n) & 0xFFFFFFFFn;
  if (topFour === 0x20010DB8n) return { label: 'Documentation', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: true, isReserved: false };
  // 2002::/16 — 6to4
  const topTwo16 = (ipInt >> 112n) & 0xFFFFn;
  if (topTwo16 === 0x2002n) return { label: '6to4', isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
  return { label: null as unknown as string, isPrivate: false, isLoopback: false, isLinkLocal: false, isMulticast: false, isDocumentation: false, isReserved: false };
}

// --- IP class -----------------------------------------------------------------

function ipv4Class(firstOctet: number): string {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet === 127) return 'A (Loopback)';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
  return 'E (Reserved)';
}

// --- Binary view --------------------------------------------------------------

function toBinaryView(ipInt: bigint, version: IpVersion): string {
  const bits = version === 'ipv4' ? 32 : 128;
  let bin = ipInt.toString(2);
  bin = bin.padStart(bits, '0');
  if (version === 'ipv4') {
    // Group by octet
    return bin.match(/.{8}/g)!.join('.');
  }
  // Group by 16-bit group, separated by ":"
  return bin.match(/.{16}/g)!.join(':');
}

// --- Main calculator ----------------------------------------------------------

export function calculateCidr(input: string): CalculateCidrResult {
  const parsed = parseCidrInput(input);
  const version = parsed.version;

  if (parsed.error) {
    return emptyResult(version, parsed.error ?? 'Invalid input', input);
  }

  const versionBits = version === 'ipv4' ? IPV4_BITS : IPV6_BITS;
  const versionMax = version === 'ipv4' ? IPV4_MAX : IPV6_MAX;
  const prefixMin = 0;
  const prefixMax = Number(versionBits);

  let prefix = parsed.prefix;
  if (prefix === null) {
    prefix = version === 'ipv4' ? 32 : 128; // bare IP defaults to a single host
  }
  if (prefix < prefixMin || prefix > prefixMax) {
    return emptyResult(version, `Prefix length must be between ${prefixMin} and ${prefixMax}`, input);
  }

  const ipInt = ipToInt(parsed.ip, version) & versionMax;
  const mask = maskForPrefix(prefix, version);
  const networkInt = ipInt & mask;
  const broadcastInt = version === 'ipv4' ? (networkInt | (versionMax ^ mask)) : null;

  const prefixBitsVersion = Number(versionBits);
  const totalAddresses = prefix === prefixBitsVersion ? 1n : (1n << BigInt(prefixBitsVersion - prefix));

  let usableHosts: bigint;
  let firstHostInt: bigint | null;
  let lastHostInt: bigint | null;

  if (version === 'ipv4') {
    if (prefix === 32) {
      usableHosts = 1n;
      firstHostInt = networkInt;
      lastHostInt = networkInt;
    } else if (prefix === 31) {
      // RFC 3021 point-to-point: both addresses are usable
      usableHosts = 2n;
      firstHostInt = networkInt;
      lastHostInt = networkInt | 1n;
    } else {
      usableHosts = totalAddresses - 2n;
      firstHostInt = networkInt + 1n;
      lastHostInt = (broadcastInt ?? 0n) - 1n;
    }
  } else {
    usableHosts = totalAddresses;
    firstHostInt = networkInt;
    lastHostInt = networkInt + totalAddresses - 1n;
  }

  const special = version === 'ipv4' ? classifyIpv4(ipInt) : classifyIpv6(ipInt);
  const classLabel = version === 'ipv4'
    ? ipv4Class(Number((ipInt >> 24n) & 0xFFn))
    : null;

  const ip = intToIp(ipInt, version);
  const network = intToIp(networkInt, version);
  const broadcast = broadcastInt !== null ? intToIp(broadcastInt, version) : null;
  const netmask = version === 'ipv4' ? intToIpv4(mask) : null;
  const wildcard = version === 'ipv4' ? intToIpv4(wildcardForPrefix(prefix)) : null;

  const firstHost = firstHostInt !== null ? intToIp(firstHostInt, version) : null;
  const lastHost = lastHostInt !== null ? intToIp(lastHostInt, version) : null;
  const hostRange = (firstHost && lastHost) ? `${firstHost} – ${lastHost}` : null;

  return {
    version,
    valid: true,
    input,
    prefix,
    prefixMin,
    prefixMax,
    ipInt,
    networkInt,
    broadcastInt,
    ip,
    network,
    broadcast,
    netmask,
    wildcard,
    prefixLength: prefix,
    totalAddresses,
    usableHosts,
    firstHost,
    lastHost,
    hostRange,
    reverseDns: reverseDns(networkInt, prefix, version),
    ipAsInteger: ipInt.toString(),
    binaryView: toBinaryView(ipInt, version),
    classLabel,
    isPrivate: special.isPrivate,
    isLoopback: special.isLoopback,
    isLinkLocal: special.isLinkLocal,
    isMulticast: special.isMulticast,
    isDocumentation: special.isDocumentation,
    isReserved: special.isReserved,
    specialLabel: (special.label as string | null) ?? null,
  };
}

function emptyResult(version: IpVersion, error: string, input: string): CalculateCidrResult {
  return {
    version,
    valid: false,
    error,
    input,
    prefix: 0,
    prefixMin: 0,
    prefixMax: version === 'ipv4' ? 32 : 128,
    ipInt: 0n,
    networkInt: 0n,
    broadcastInt: null,
    ip: '',
    network: '',
    broadcast: null,
    netmask: null,
    wildcard: null,
    prefixLength: 0,
    totalAddresses: 0n,
    usableHosts: 0n,
    firstHost: null,
    lastHost: null,
    hostRange: null,
    reverseDns: '',
    ipAsInteger: '0',
    binaryView: '',
    classLabel: null,
    isPrivate: false,
    isLoopback: false,
    isLinkLocal: false,
    isMulticast: false,
    isDocumentation: false,
    isReserved: false,
    specialLabel: null,
  };
}

// --- Subnet splitter ----------------------------------------------------------

export function subnetSplit(opts: SubnetSplitOptions): SubnetResult[] {
  const { prefix, newPrefix, version } = opts;
  const max = opts.maxResults ?? 256;
  const bits = version === 'ipv4' ? IPV4_BITS : IPV6_BITS;

  if (newPrefix <= prefix) return [];
  if (newPrefix > Number(bits)) return [];

  // The CIDR input was already validated upstream; here we just compute
  // from a known base. The caller passes the base network as `prefix` plus
  // the network integer via the calculateCidr result. We re-derive from the
  // network int passed through `networkInt`.

  return [];
}

export function subnetSplitFromNetwork(
  networkInt: bigint,
  prefix: number,
  newPrefix: number,
  version: IpVersion,
  maxResults = 256,
): SubnetResult[] {
  const bits = version === 'ipv4' ? IPV4_BITS : IPV6_BITS;
  if (newPrefix <= prefix || newPrefix > Number(bits)) return [];

  const subnetCount = 1 << (newPrefix - prefix); // safe; max newPrefix - prefix is small
  const stride = newPrefix === 0 ? (version === 'ipv4' ? IPV4_MAX + 1n : IPV6_MAX + 1n) : (1n << BigInt(Number(bits) - newPrefix));

  const results: SubnetResult[] = [];
  const count = Math.min(subnetCount, maxResults);

  for (let i = 0; i < count; i++) {
    const subnetNet = networkInt + BigInt(i) * stride;
    const lastHost = subnetNet + stride - 1n;

    const totalForSubnet = newPrefix === Number(bits) ? 1n : (1n << BigInt(Number(bits) - newPrefix));
    let usable: bigint;
    let firstHostInt: bigint;
    let lastHostInt: bigint;

    if (version === 'ipv4') {
      if (newPrefix === 32) {
        usable = 1n;
        firstHostInt = subnetNet;
        lastHostInt = subnetNet;
      } else if (newPrefix === 31) {
        usable = 2n;
        firstHostInt = subnetNet;
        lastHostInt = subnetNet | 1n;
      } else {
        usable = totalForSubnet - 2n;
        firstHostInt = subnetNet + 1n;
        lastHostInt = lastHost - 1n;
      }
    } else {
      usable = totalForSubnet;
      firstHostInt = subnetNet;
      lastHostInt = lastHost;
    }

    results.push({
      network: intToIp(subnetNet, version),
      firstHost: intToIp(firstHostInt, version),
      lastHost: intToIp(lastHostInt, version),
      usableHosts: usable,
      cidr: `${intToIp(subnetNet, version)}/${newPrefix}`,
    });
  }

  return results;
}

export function subnetSplitCount(prefix: number, newPrefix: number): number {
  if (newPrefix <= prefix) return 0;
  return 1 << (newPrefix - prefix);
}