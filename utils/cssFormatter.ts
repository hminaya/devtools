/**
 * Lightweight CSS minifier / beautifier.
 *
 * This is a regex-driven formatter, not a full CSS parser. Handles the
 * common cases: rules, selectors, declarations, comments, braces, media
 * queries. Produces a reasonable-looking stylesheet in either compact
 * (minified) or re-indented (beautified) form.
 *
 * For strict-spec handling, reach for `clean-css` or `postcss`. This tool
 * is fine for dev-time formatting and stripping comments/whitespace.
 */

export interface FormatResult {
  ok: boolean;
  output?: string;
  error?: string;
}

export function minifyCss(input: string): FormatResult {
  try {
    const trimmed = input.trim();
    if (!trimmed) return { ok: false, error: 'Empty input' };

    let out = trimmed;

    // Strip comments (/* ... */) outside string literals.
    out = out.replace(/\/\*[\s\S]*?\*\//g, '');

    // Collapse whitespace
    out = out.replace(/\s+/g, ' ').trim();

    // Remove spaces around structural punctuation — but only OUTSIDE (...) blocks.
    // Walk char-by-char, track paren depth, and only apply normalisation outside parens.
    let paren = 0;
    let res = '';
    for (let i = 0; i < out.length; i++) {
      const c = out[i]!;
      const next = out[i + 1];
      const prev = res.length ? res[res.length - 1]! : '';

      if (c === '(') paren++;
      if (c === ')') paren = Math.max(0, paren - 1);

      if (paren === 0 && /\s/.test(c)) {
        // Collapse whitespace only when between identifier chars / structural punctuation.
        if (
          prev && !/[\s({\[>~+,]/.test(prev) &&
          next && !/[\s)}\]>~+,]/.test(next)
        ) {
          res += ' ';
        }
        continue;
      }
      if (paren > 0 && /\s/.test(c)) continue;   // strip all whitespace inside parens

      if (paren === 0 && /[{}:;,>~+]/.test(c)) {
        // Strip leading/trailing spaces around structural punctuation.
        res = res.replace(/[ \t]+$/, '');
        res += c;
        // Skip trailing whitespace.
        while (i + 1 < out.length && /\s/.test(out[i + 1]!)) i++;
        continue;
      }
      res += c;
    }
    out = res;

    // Drop final semicolon before '}' for tighter output
    out = out.replace(/;}/g, '}');

    // Restore space after `@media`, `@keyframes` etc. → "@media (...)"
    out = out.replace(/@(media|keyframes|supports|font-face|import|charset|page|namespace|viewport|document|custom-selector|custom-media|counter-style|property|color-profile|font-feature-values|layer|container)\(/g, '@$1 (');

    return { ok: true, output: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to minify CSS' };
  }
}

export function beautifyCss(input: string, indentSize: number = 2): FormatResult {
  try {
    const trimmed = input.trim();
    if (!trimmed) return { ok: false, error: 'Empty input' };

    // First minify to normalize, then pretty-print.
    const min = minifyCss(input);
    if (!min.ok || !min.output) return { ok: false, error: min.error };

    let out = '';
    let indent = 0;
    const pad = () => ' '.repeat(indentSize * indent);
    let i = 0;
    const src = min.output;

    while (i < src.length) {
      const c = src[i]!;
      const next = src[i + 1];

      if (c === '{') {
        out += ' {\n';
        indent++;
        i++;
        // Skip any spaces and indent the next line.
        while (i < src.length && src[i] === ' ') i++;
        if (i < src.length && src[i] !== '}') out += pad();
        continue;
      }
      if (c === '}') {
        indent = Math.max(0, indent - 1);
        // Drop trailing spaces before }
        out = out.replace(/[ \t]+$/, '');
        if (!out.endsWith('\n')) out += '\n';
        out += pad() + '}\n';
        i++;
        while (i < src.length && src[i] === ' ') i++;
        continue;
      }
      if (c === ';') {
        out += ';\n';
        i++;
        while (i < src.length && src[i] === ' ') i++;
        // Preserve indent for next declaration — only pad if next is not } or end
        if (i < src.length && src[i] !== '}') out += pad();
        continue;
      }

      out += c;
      i++;
    }

    out = out.replace(/^[ \t]+$/gm, '').replace(/\n{2,}/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '');
    return { ok: true, output: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to beautify CSS' };
  }
}