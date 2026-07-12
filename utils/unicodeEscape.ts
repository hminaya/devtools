/**
 * Unicode escape / unescape utilities.
 *
 * - Escape: converts non-ASCII characters to \\uXXXX (BMP) or \\u{XXXXX} (supplementary)
 *   Also supports `escapeAll` mode that escapes ASCII control chars too.
 * - Unescape: handles \\uXXXX, \\u{XXXXX}, \\xXX, surrogate pairs, and standard JSON-style
 *   escapes (\\n, \\t, \\r, \\b, \\f, \\", \\\\).
 *
 * All operations work on the UTF-8/UTF-16 view of the JS string (the JS engine already
 * keeps strings as UTF-16 internally).
 */

export interface UnicodeEscapeOptions {
  escapeAll?: boolean;       // also escape control chars (\\n, \\t, \\r, \\b, \\f, \\0)
  escapeASCII?: boolean;      // also escape printable ASCII (rarely useful)
  useES6Braces?: boolean;     // use \u{XXXXX} form for supplementary plane chars (default true)
}

export function escapeUnicode(input: string, opts: UnicodeEscapeOptions = {}): string {
  const {
    escapeAll = true,
    escapeASCII = false,
    useES6Braces = true,
  } = opts;

  let out = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    const code = ch.codePointAt(0)!;

    // Surrogates for supplementary plane chars need to be paired.
    if (code >= 0xD800 && code <= 0xDBFF && input[i + 1]) {
      const next = input[i + 1]!.codePointAt(0)!;
      if (next >= 0xDC00 && next <= 0xDFFF) {
        const full = 0x10000 + ((code - 0xD800) << 10) + (next - 0xDC00);
        out += useES6Braces ? `\\u{${full.toString(16)}}` : `\\u${((full >> 16) + 0xD800).toString(16)}\\u${((full & 0xFFFF) + 0xDC00).toString(16)}`;
        i++;
        continue;
      }
    }

    if (escapeAll) {
      switch (ch) {
        case '\\n': out += '\\n'; continue;
        case '\\t': out += '\\t'; continue;
        case '\\r': out += '\\r'; continue;
        case '\\b': out += '\\b'; continue;
        case '\\f': out += '\\f'; continue;
        case '\\0': out += '\\0'; continue;
      }
    }

    if (ch === '\\') { out += '\\\\'; continue; }

    if (code < 0x20) {
      out += `\\u${code.toString(16).padStart(4, '0')}`;
    } else if (code < 0x7F && !escapeASCII) {
      out += ch;
    } else if (code <= 0xFFFF) {
      out += `\\u${code.toString(16).padStart(4, '0')}`;
    } else {
      out += useES6Braces ? `\\u{${code.toString(16)}}` : `\\u${((code - 0x10000) >> 16 & 0xFFFF).toString(16).padStart(4, '0')}\\u${((code - 0x10000) & 0xFFFF).toString(16).padStart(4, '0')}`;
    }
  }
  return out;
}

const UNI_ESCAPE = /\\(?:u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|n|r|t|b|f|0|\\|")/g;

export function unescapeUnicode(input: string): { output?: string; error?: string } {
  try {
    const out = input.replace(UNI_ESCAPE, (full, braced, u4, x2) => {
      if (braced !== undefined) return String.fromCodePoint(parseInt(braced, 16));
      if (u4 !== undefined) return String.fromCharCode(parseInt(u4, 16));
      if (x2 !== undefined) return String.fromCharCode(parseInt(x2, 16));
      switch (full) {
        case '\\n': return '\n';
        case '\\r': return '\r';
        case '\\t': return '\t';
        case '\\b': return '\b';
        case '\\f': return '\f';
        case '\\0': return '\0';
        case '\\\\': return '\\';
        case '\\"': return '"';
        default: return full;
      }
    });
    return { output: out };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Invalid Unicode escape sequence' };
  }
}