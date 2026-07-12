/**
 * HTML entity encode / decode.
 *
 * - Encode: escapes <, >, &, ", ', and all non-ASCII characters to numeric entities
 * - Decode: handles named entities (legacy + HTML5 + XP), decimal, and hex references
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  copy: '\u00a9', reg: '\u00ae', trade: '\u2122', hellip: '\u2026',
  mdash: '\u2014', ndash: '\u2013', lsquo: '\u2018', rsquo: '\u2019',
  ldquo: '\u201c', rdquo: '\u201d', laquo: '\u00ab', raquo: '\u00bb',
  euro: '\u20ac', pound: '\u00a3', cent: '\u00a2', yen: '\u00a5',
  deg: '\u00b0', plusmn: '\u00b1', times: '\u00d7', divide: '\u00f7',
  micro: '\u00b5', para: '\u00b6', sect: '\u00a7', middot: '\u00b7',
  bull: '\u2022', dagger: '\u2020', Dagger: '\u2021',
  frac12: '\u00bd', frac14: '\u00bc', frac34: '\u00be',
  sup1: '\u00b9', sup2: '\u00b2', sup3: '\u00b3',
  alpha: '\u03b1', beta: '\u03b2', gamma: '\u03b3', delta: '\u03b4',
  Beta: '\u0392', Gamma: '\u0393', Delta: '\u0394',
  pi: '\u03c0', Pi: '\u03a0', omega: '\u03c9', Omega: '\u03a9',
  infin: '\u221e', ne: '\u2260', le: '\u2264', ge: '\u2265',
  larr: '\u2190', uarr: '\u2191', rarr: '\u2192', darr: '\u2193',
  harr: '\u2194', lArr: '\u21d0', rArr: '\u21d2',
  spades: '\u2660', clubs: '\u2663', hearts: '\u2665', diams: '\u2666',
  iexcl: '\u00a1', iquest: '\u00bf', brvbar: '\u00a6', not: '\u00ac',
  shy: '\u00ad', macr: '\u00af', acute: '\u00b4', cedil: '\u00b8',
};

const ENTITY_REGEX = /&(?:([a-zA-Z][a-zA-Z0-9]+)|#(\d+)|#x([0-9a-fA-F]+));/g;

export interface HTMLEncodeOptions {
  escapeQuotes?: boolean;       // escape " and '
  escapeNonASCII?: boolean;      // escape non-ASCII Unicode chars to numeric entities
}

export const DEFAULT_HTML_ENCODE_OPTIONS: HTMLEncodeOptions = {
  escapeQuotes: true,
  escapeNonASCII: true,
};

export function encodeHTMLEntities(input: string, opts: HTMLEncodeOptions = DEFAULT_HTML_ENCODE_OPTIONS): string {
  let out = input.replace(/[&<>]/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      default: return m;
    }
  });
  if (opts.escapeQuotes) {
    out = out.replace(/"/g, '&#34;').replace(/'/g, '&#39;');
  }
  if (opts.escapeNonASCII) {
    out = out.replace(/[\u0080-\uFFFF]/g, (m) => `&#${m.charCodeAt(0)};`);
  }
  return out;
}

export function decodeHTMLEntities(input: string): string {
  return input.replace(ENTITY_REGEX, (full, named, dec, hex) => {
    if (named) {
      const ch = NAMED_ENTITIES[named];
      if (ch) return ch;
      // Unknown named entity — pass through unchanged (HTML5 has ~2000; we cover the common subset).
      return full;
    }
    if (dec) return String.fromCharCode(parseInt(dec, 10));
    if (hex) return String.fromCharCode(parseInt(hex, 16));
    return full;
  });
}