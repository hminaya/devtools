/**
 * Lightweight JavaScript minifier.
 *
 * A regex-driven minifier — NOT a real JS engine, not safe for arbitrary code.
 * For production minification use `terser` or `esbuild --minify`.
 *
 * This dev tool:
 *   - strips both // and /* comments (outside strings)
 *   - collapses whitespace
 *   - removes whitespace around structural punctuation
 *   - preserves string literals verbatim
 *   - drops trailing semicolons (cosmetic — JS auto-inserts them)
 *
 * It does NOT rename variables, dead-code-eliminate, or do any AST traversal.
 */

export interface MinifyResult {
  ok: boolean;
  output?: string;
  error?: string;
}

export function minifyJs(input: string): MinifyResult {
  try {
    const trimmed = input.trim();
    if (!trimmed) return { ok: false, error: 'Empty input' };

    // Step 1: Walk character-by-character, skipping comments and preserving strings.
    let cleaned = '';
    let i = 0;
    const n = trimmed.length;

    while (i < n) {
      const c = trimmed[i]!;
      const next = trimmed[i + 1];

      // Line comment //...
      if (c === '/' && next === '/') {
        // Skip to end of line
        const nl = trimmed.indexOf('\n', i);
        i = nl === -1 ? n : nl;
        continue;
      }

      // Block comment /* ... */
      if (c === '/' && next === '*') {
        const end = trimmed.indexOf('*/', i + 2);
        i = end === -1 ? n : end + 2;
        continue;
      }

      // String literals: '...', "...", `...`
      if (c === '"' || c === '\'' || c === '`') {
        let end = i + 1;
        while (end < n) {
          const ch = trimmed[end]!;
          if (ch === '\\') { end += 2; continue; }
          if (ch === c) { end++; break; }
          end++;
        }
        cleaned += trimmed.slice(i, end);
        i = end;
        continue;
      }

      cleaned += c;
      i++;
    }

    // Step 2: Collapse whitespace, but only outside strings.
    let out = '';
    i = 0;
    while (i < cleaned.length) {
      const c = cleaned[i]!;
      const next = cleaned[i + 1];

      // Strings preserved verbatim.
      if (c === '"' || c === '\'' || c === '`') {
        let end = i + 1;
        while (end < cleaned.length) {
          const ch = cleaned[end]!;
          if (ch === '\\') { end += 2; continue; }
          if (ch === c) { end++; break; }
          end++;
        }
        out += cleaned.slice(i, end);
        i = end;
        continue;
      }

      // Drop whitespace around structural punctuation.
      if (/[{}()\[\];,=<>+\-*/%!&|?:]/.test(c)) {
        out = out.replace(/[ \t]+$/, '');
        out += c;
        // Skip any trailing whitespace after this punctuation.
        i++;
        while (i < cleaned.length && /\s/.test(cleaned[i]!)) i++;
        continue;
      }

      // Collapse runs of whitespace into a single space.
      if (/\s/.test(c)) {
        let j = i;
        while (j < cleaned.length && /\s/.test(cleaned[j]!)) j++;
        const prev = out[out.length - 1];
        const after = cleaned[j];
        const isMeaningful =
          prev && !/[\s({[<>+\-*/%!&|?:=]/.test(prev) &&
          after && !/[\s)}\];,<>+\-*/%!&|?:=]/.test(after);
        if (isMeaningful) out += ' ';
        i = j;
        continue;
      }

      out += c;
      i++;
    }

    // Step 3: Drop trailing semicolons and extra whitespace.
    out = out.replace(/;+/g, ';').replace(/;\s*([}\]])/g, '$1').replace(/\s+$/g, '').trim();
    return { ok: true, output: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to minify JavaScript' };
  }
}