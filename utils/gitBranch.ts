/**
 * Git branch name generator.
 *
 * Sanitizes the user's text into a git-friendly, kebab-case branch name and
 * optionally prepends a prefix (feat, fix, chore, docs, refactor, etc.).
 *
 * Output rules (Git's default ref naming rules):
 *   - A–Z, a–z, 0–9, period, hyphen, underscore and forward slash
 *   - cannot start with a hyphen, dot, or 'end'/'release' followed by slash
 *   - cannot contain '..', '@{', backslash, control chars, or sequences of '/'
 *   - cannot have trailing '.lock', '.lock/', or end with '/' '.'
 *   - cannot have '~' '^' ':' ' ' '?'
 */

export type BranchPrefix =
  | 'feat' | 'fix' | 'chore' | 'docs' | 'refactor' | 'test'
  | 'perf' | 'style' | 'build' | 'ci' | 'revert' | 'release' | 'hotfix'
  | 'bugfix' | 'task' | 'wip' | 'experiment' | 'security' | 'dependencies'
  | 'none';

export const BRANCH_PREFIXES: BranchPrefix[] = [
  'feat', 'fix', 'bugfix', 'hotfix', 'chore', 'docs', 'refactor', 'test',
  'perf', 'style', 'build', 'ci', 'revert', 'release', 'task', 'wip',
  'experiment', 'security', 'dependencies', 'none',
];

export interface BranchOptions {
  prefix: BranchPrefix;
  includeId?: number | string;
  idSeparator?: string;  // default '-' between branch base and id
  ticketId?: string;     // optional issue/ticket identifier prepended verbatim
  maxBranchLength?: number; // cap final length
}

/**
 * Convert free text into a clean, git-safe, kebab-case slug.
 * Strips forbidden characters, normalizes separators to hyphens,
 * collapses runs of hyphens, and trims leading/trailing hyphens.
 */
export function slugifyBranchText(text: string): string {
  return text
    .normalize('NFKD')           // decompose accented letters
    .replace(/[\u0300-\u036f]/g, '') // drop combining marks
    .replace(/[^A-Za-z0-9._\-\s/]+/g, '-') // non-safe chars → dash
    .replace(/[\s_.]+/g, '-')   // spaces and underscores and dots → dash
    .replace(/-+/g, '-')         // collapse
    .replace(/^-+|-+$/g, '')    // trim
    .replace(/^\.|-\.lock$|\.lock\/$/, '') // git ref reserved patterns
  ;
}

/**
 * Generate the full branch name from text + options.
 */
export function generateBranchName(text: string, opts: BranchOptions): string {
  const slug = slugifyBranchText(text);
  if (!slug) return '';

  let parts: string[] = [];
  if (opts.prefix && opts.prefix !== 'none') parts.push(opts.prefix);
  if (opts.ticketId) parts.push(sanitizeTicketId(opts.ticketId));
  parts.push(slug);
  if (opts.includeId !== undefined && opts.includeId !== '') {
    parts.push(`${opts.includeId}`);
  }

  const sep = opts.idSeparator ?? '-';
  let name = parts.join('/');
  if (opts.includeId !== undefined && opts.includeId !== '' && opts.idSeparator && opts.idSeparator !== '/') {
    // Allow id being glued with the chosen separator instead of slash.
    name = parts.slice(0, -1).join('/') + opts.idSeparator + parts[parts.length - 1];
  }

  name = enforceGitRefRules(name);
  // Apply max length
  if (opts.maxBranchLength && name.length > opts.maxBranchLength) {
    name = name.slice(0, opts.maxBranchLength).replace(/[-./]+$/, '');
  }
  return name;
}

export function sanitizeTicketId(id: string): string {
  return id
    .toUpperCase()
    .replace(/[^A-Z0-9_\-]/g, '')
    .replace(/^-+|-+$/g, '');
}

/**
 * Apply Git's hard rules from the ref naming spec (git-check-ref-format).
 * - No double dots, no @, no backslash, no trailing dot/space, no consecutive slashes
 * - No control chars, no leading hyphen/dot
 * - Can't end with '.lock' (in any case)
 */
export function enforceGitRefRules(name: string): string {
  return name
    .replace(/[\\@~^:?]/g, '-')
    .replace(/\.\./g, '.')
    .replace(/\/+/g, '/')
    .replace(/^[-.]+/, '')
    .replace(/[-.\\ ]+$/, '')
    .replace(/\.lock$/i, '')
    ;
}

/**
 * Generate a list of variant branch names for a single input — useful when
 * you're not sure which prefix form your team prefers.
 */
export function generateVariants(text: string, ticketId?: string): string[] {
  if (!text.trim()) return [];
  const variants: string[] = [];
  for (const prefix of BRANCH_PREFIXES) {
    if (prefix === 'none') continue;
    variants.push(generateBranchName(text, { prefix, ticketId, maxBranchLength: 60 }));
  }
  return variants.filter((v) => v.length > 0);
}