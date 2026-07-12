/**
 * Whitespace detection, visualization, and cleanup utilities.
 *
 * - Tab, newline, CR, NBSP are visualized as visible markers
 * - Trailing whitespace on each line is highlighted
 * - Cleaner supports: trim each line, collapse multiple spaces, convert tabs to spaces,
 *   remove blank lines, normalize line endings to LF, and squash runs of blank lines
 */

export const WHITESPACE_MARKERS: Record<string, string> = {
  ' ':  '·',   // space -> middle dot
  '\t': '→',   // tab -> right arrow
  '\n': '⏎\n', // newline -> return symbol then real newline
  '\r': '⏎',  // CR (rare in isolation)
  '\u00a0': '⍽', // NBSP -> open box
  '\u200b': '​', // zero-width space
  '\u2009': ' ',   // thin space
  '\u200a': ' ',   // hair space
  '\u2028': '↵',   // line separator
  '\u2029': '¶',   // paragraph separator
  '\u3000': '□',   // ideographic space
  '\ufeff': '⊙',   // BOM
};

export function visualizeWhitespace(input: string): string {
  let out = '';
  for (const ch of input) {
    if (WHITESPACE_MARKERS[ch]) {
      out += WHITESPACE_MARKERS[ch];
    } else if (/\s/.test(ch) && ch !== ' ') {
      // Fallback for any other whitespace char not in the table
      out += `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
    } else {
      out += ch;
    }
  }
  return out;
}

export interface CleanOptions {
  trimLines: boolean;          // strip leading/trailing spaces on each line
  collapseSpaces: boolean;     // collapse runs of spaces / tabs to single space
  tabsToSpaces: boolean;       // convert tabs to 4 spaces
  tabWidth: number;            // spaces per tab (default 4)
  removeBlankLines: boolean;   // remove lines that are entirely whitespace
  collapseBlankRuns: boolean;  // max 1 blank line in a row (lower priority than removeBlankLines)
  normalizeLineEndings: boolean; // convert CRLF / CR to LF
  trimDocument: boolean;       // strip leading/trailing blank lines from the whole document
}

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  trimLines: false,
  collapseSpaces: false,
  tabsToSpaces: false,
  tabWidth: 4,
  removeBlankLines: false,
  collapseBlankRuns: false,
  normalizeLineEndings: true,
  trimDocument: false,
};

export interface WhitespaceStats {
  spaces: number;
  tabs: number;
  newlines: number;
  carriageReturns: number;
  nbsp: number;
  zeroWidth: number;
  otherWhitespace: number;
  trailingWhitespaceLines: number;
  totalLines: number;
}

export function analyzeWhitespace(input: string): WhitespaceStats {
  let spaces = 0, tabs = 0, newlines = 0, carriageReturns = 0, nbsp = 0, zeroWidth = 0, otherWhitespace = 0;
  for (const ch of input) {
    if (ch === ' ') spaces++;
    else if (ch === '\t') tabs++;
    else if (ch === '\n') newlines++;
    else if (ch === '\r') carriageReturns++;
    else if (ch === '\u00a0') nbsp++;
    else if (ch === '\u200b' || ch === '\ufeff') zeroWidth++;
    else if (/\s/.test(ch)) otherWhitespace++;
  }
  const lines = input.split(/\r\n|\r|\n/);
  const totalLines = lines.length;
  const trailingWhitespaceLines = lines.filter((l) => l !== '' && /\s$/.test(l)).length;
  return { spaces, tabs, newlines, carriageReturns, nbsp, zeroWidth, otherWhitespace, totalLines, trailingWhitespaceLines };
}

export function cleanWhitespace(input: string, opts: CleanOptions): string {
  let text = input;

  if (opts.normalizeLineEndings) {
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  let lines = text.split('\n');

  if (opts.tabsToSpaces) {
    const w = Math.max(1, opts.tabWidth);
    lines = lines.map((l) => l.replace(/\t/g, ' '.repeat(w)));
  }
  if (opts.collapseSpaces) {
    lines = lines.map((l) => l.replace(/[ \t]+/g, ' '));
  }
  if (opts.trimLines) {
    lines = lines.map((l) => l.replace(/^\s+|\s+$/g, ''));
  }
  if (opts.removeBlankLines) {
    lines = lines.filter((l) => l.trim().length > 0);
  } else if (opts.collapseBlankRuns) {
    const out: string[] = [];
    let lastWasBlank = false;
    for (const l of lines) {
      const blank = l.trim().length === 0;
      if (blank && lastWasBlank) continue;
      out.push(l);
      lastWasBlank = blank;
    }
    lines = out;
  }
  if (opts.trimDocument) {
    while (lines.length > 0 && lines[0]?.trim() === '') lines.shift();
    while (lines.length > 0 && lines[lines.length - 1]?.trim() === '') lines.pop();
  }

  return lines.join('\n');
}