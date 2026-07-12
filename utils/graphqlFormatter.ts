/**
 * Lightweight GraphQL query / mutation formatter.
 *
 * A naive regex-driven pretty-printer for dev-tool use. Walks the string
 * character-by-character, preserving string literals verbatim, and applies
 * indentation based on `{`, `[`, `}`, `]`, `(`, `)`, and `,`.
 *
 * This is NOT spec-compliant — for serious work reach for `prettier` +
 * `prettier-plugin-graphql`. It is, however, dependency-free and fast.
 */

const KEYWORDS = /\b(query|mutation|subscription|fragment|schema|directive|type|input|interface|union|enum|scalar|extend|implements|on)\b/;

export interface FormatResult {
  ok: boolean;
  output?: string;
  error?: string;
}

type Char = '{' | '[' | '(' | '}' | ']' | ')';

const OPENERS = new Set<Char>(['{', '[', '(']);
const CLOSERS = new Set<Char>(['}', ']', ')']);
const MATCHES: Partial<Record<Char, Char>> = { '}': '{', ']': '[', ')': '(' };

export function formatGraphQL(input: string): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'Empty input' };

  try {
    let out = '';
    let indent = 0;
    let i = 0;
    let pendingNewline = false;
    let lastWasNewline = false;

    const pad = () => out += '  '.repeat(Math.max(0, indent));

    const emitKeywordSpace = (c: string) => {
      // After a keyword, the next non-whitespace token should be spaced if it's an identifier.
      // Handled inline below.
    };

    while (i < trimmed.length) {
      const c = trimmed[i]!;
      const next = trimmed[i + 1];

      // String literals are preserved verbatim.
      if (c === '"' || c === '\'') {
        if (pendingNewline) { out += '\n'; pad(); pendingNewline = false; lastWasNewline = false; }
        out += c;
        const close = c;
        i++;
        while (i < trimmed.length) {
          const cc = trimmed[i]!;
          if (cc === '\\') {
            out += cc + (trimmed[i + 1] ?? '');
            i += 2;
            continue;
          }
          out += cc;
          if (cc === close) { i++; break; }
          i++;
        }
        continue;
      }

      // Block comments / descriptions: """..."""
      if (c === '#' || trimmed.startsWith('"""', i)) {
        const isTriple = trimmed.startsWith('"""', i);
        const endSeq = isTriple ? '"""' : '\n';
        const end = trimmed.indexOf(endSeq, i + (isTriple ? 3 : 1));
        const stopAt = end === -1 ? trimmed.length : end + (isTriple ? 3 : 0);
        const comment = trimmed.slice(i, stopAt);
        if (pendingNewline) { out += '\n'; pad(); pendingNewline = false; }
        out += comment;
        i = stopAt;
        // Force newline after a comment.
        pendingNewline = true;
        lastWasNewline = true;
        continue;
      }

      // Skip whitespace
      if (/\s/.test(c)) {
        // Collapse runs of whitespace to a single space, but only between identifier chars.
        let j = i;
        while (j < trimmed.length && /\s/.test(trimmed[j]!)) j++;
        const prev = out.length > 0 ? out[out.length - 1]! : '';
        const after = trimmed[j];
        const isMeaningful =
          prev && !OPENERS.has(prev as Char) && !CLOSERS.has(prev as Char) && prev !== ',' && prev !== ':' &&
          after && !OPENERS.has(after as Char) && !CLOSERS.has(after as Char) && after !== ',' && after !== ')';
        if (isMeaningful && !pendingNewline && !lastWasNewline) out += ' ';
        i = j;
        continue;
      }

      // Newline immediately for opener following a { — common GraphQL case.
      if (OPENERS.has(c as Char)) {
        if (pendingNewline) { out += '\n'; pad(); pendingNewline = false; }
        out += c as Char;
        indent++;
        pendingNewline = true;
        lastWasNewline = true;
        i++;
        continue;
      }
      if (CLOSERS.has(c as Char)) {
        indent = Math.max(0, indent - 1);
        const followedByOpenBrace =
          c === ')' && next === '{';
        if (followedByOpenBrace) {
          out += c as Char + ' ';
          pendingNewline = false;
          lastWasNewline = false;
        } else {
          out += '\n' + '  '.repeat(Math.max(0, indent)) + c;
          pendingNewline = true;
          lastWasNewline = true;
        }
        i++;
        continue;
      }
      if (c === ',') {
        out += c;
        pendingNewline = true;
        lastWasNewline = true;
        i++;
        continue;
      }
      if (c === ':') {
        out += ': ';
        i++;
        // Skip whitespace after the colon
        while (i < trimmed.length && /\s/.test(trimmed[i]!)) i++;
        continue;
      }

      // Regular token — emit and clear pending newline.
      if (pendingNewline) {
        out += '\n' + '  '.repeat(Math.max(0, indent));
        pendingNewline = false;
        lastWasNewline = false;
      }
      out += c;
      i++;
    }

    out = out.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '');
    return { ok: true, output: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to format GraphQL' };
  }
}

/**
 * Coarse validation: catches unbalanced braces / brackets / parens.
 */
export function validateGraphQL(input: string): { valid: boolean; error?: string } {
  const text = input.trim();
  if (!text) return { valid: false, error: 'Empty input' };

  const stack: string[] = [];
  let inString = false;
  let strQuote = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (inString) {
      if (c === '\\') { i++; continue; }
      if (c === strQuote) inString = false;
      continue;
    }
    if (c === '"' || c === '\'') { inString = true; strQuote = c; continue; }
    if (OPENERS.has(c as Char)) stack.push(c);
    else if (CLOSERS.has(c as Char)) {
      const opener = stack.pop();
      if (!opener || opener !== MATCHES[c as Char]) {
        return { valid: false, error: `Unbalanced "${c}" at position ${i}` };
      }
    }
  }
  if (stack.length > 0) return { valid: false, error: `Unclosed "${stack[stack.length - 1]}"` };
  return { valid: true };
}