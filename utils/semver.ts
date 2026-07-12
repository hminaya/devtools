/**
 * Semantic Versioning (SemVer 2.0.0) parsing and comparison.
 * @see https://semver.org
 */

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];  // each entry is an identifier (numeric or alphanumeric)
  build: string[];       // build metadata — ignored for precedence
  raw: string;
}

const NUMERIC_ID = /^[0-9]+$/;

/**
 * Parse a SemVer string into its components. Throws on invalid input.
 * Accepts an optional leading "v" (e.g. "v1.2.3") and build metadata.
 */
export function parseSemVer(input: string): SemVer {
  const raw = input.trim();
  if (!raw) throw new Error('Empty version string');

  // Strip optional leading "v"
  const cleaned = raw.startsWith('v') || raw.startsWith('V') ? raw.slice(1) : raw;

  // Per SemVer 2.0.0 BNF: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
  const match = cleaned.match(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
  );

  if (!match) {
    throw new Error(`Invalid SemVer string: "${raw}"`);
  }

  const major = parseInt(match[1]!, 10);
  const minor = parseInt(match[2]!, 10);
  const patch = parseInt(match[3]!, 10);
  const prerelease = match[4] ? match[4].split('.') : [];
  const build = match[5] ? match[5].split('.') : [];

  return { major, minor, patch, prerelease, build, raw };
}

/**
 * Compare two prerelease identifier arrays per SemVer 2.0.0 §11.
 * Returns -1 if a < b, 1 if a > b, 0 if equal.
 */
function comparePrerelease(a: string[], b: string[]): number {
  // A version without a prerelease has higher precedence than one with.
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;  // a has no prerelease -> greater
  if (b.length === 0) return -1; // b has no prerelease -> greater

  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i]!;
    const bv = b[i]!;
    const aIsNum = NUMERIC_ID.test(av);
    const bIsNum = NUMERIC_ID.test(bv);

    if (aIsNum && bIsNum) {
      const ai = parseInt(av, 10);
      const bi = parseInt(bv, 10);
      if (ai < bi) return -1;
      if (ai > bi) return 1;
    } else if (aIsNum && !bIsNum) {
      return -1; // numeric identifiers always have lower precedence than alphanumeric
    } else if (!aIsNum && bIsNum) {
      return 1;
    } else {
      // Both alphanumeric — compare lexically by ASCII code
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
  }

  // All compared identifiers are equal — the shorter array wins (lower precedence)
  if (a.length < b.length) return -1;
  if (a.length > b.length) return 1;
  return 0;
}

/**
 * Compare two SemVer strings (or parsed objects) for precedence per §11.
 * Build metadata is ignored.
 * Returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareSemver(a: string | SemVer, b: string | SemVer): number {
  const pa = typeof a === 'string' ? parseSemVer(a) : a;
  const pb = typeof b === 'string' ? parseSemVer(b) : b;

  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1;
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1;
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1;
  return comparePrerelease(pa.prerelease, pb.prerelease);
}

export function equalsSemver(a: string | SemVer, b: string | SemVer): boolean {
  return compareSemver(a, b) === 0;
}

/**
 * Sort a list of SemVer strings in ascending order (lowest precedence first).
 * Invalid entries are pushed to the end and reported via the returned errors array.
 */
export function sortVersions(
  versions: string[]
): { sorted: string[]; errors: Array<{ input: string; error: string }> } {
  const parsed: Array<{ raw: string; ver: SemVer }> = [];
  const errors: Array<{ input: string; error: string }> = [];

  for (const v of versions) {
    try {
      parsed.push({ raw: v, ver: parseSemVer(v) });
    } catch (e) {
      errors.push({ input: v, error: e instanceof Error ? e.message : String(e) });
    }
  }

  parsed.sort((x, y) => compareSemver(x.ver, y.ver));
  return { sorted: parsed.map((p) => p.raw), errors };
}

/**
 * Whether a version satisfies the common "is this a prerelease?" check.
 */
export function isPrerelease(v: string | SemVer): boolean {
  const p = typeof v === 'string' ? parseSemVer(v) : v;
  return p.prerelease.length > 0;
}

/**
 * Human-readable relationship label, e.g. "1.2.3 < 1.3.0".
 */
export function describeRelation(a: string, b: string): { symbol: string; label: string } {
  const cmp = compareSemver(a, b);
  if (cmp === 0) return { symbol: '=', label: 'equal to' };
  if (cmp < 0) return { symbol: '<', label: 'is less than' };
  return { symbol: '>', label: 'is greater than' };
}