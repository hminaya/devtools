/**
 * String escaping and unescaping for common contexts: JSON, XML, CSV, HTML,
 * URL, JavaScript-regex, and Unicode.
 */

export type EscapeContext =
  | 'json'
  | 'xml'
  | 'csv'
  | 'regex'
  | 'shell';

export const ESCAPE_CONTEXT_LABELS: { value: EscapeContext; label: string }[] = [
  { value: 'json',    label: 'JSON string' },
  { value: 'xml',     label: 'XML / HTML attribute' },
  { value: 'csv',     label: 'CSV field' },
  { value: 'regex',   label: 'JavaScript regex literal' },
  { value: 'shell',   label: 'POSIX shell' },
];

export function escapeString(input: string, ctx: EscapeContext): string {
  switch (ctx) {
    case 'json':
      return input.replace(/["\\\b\f\n\r\t]/g, (m) => {
        switch (m) {
          case '"':  return '\\"';
          case '\\': return '\\\\';
          case '\b': return '\\b';
          case '\f': return '\\f';
          case '\n': return '\\n';
          case '\r': return '\\r';
          case '\t': return '\\t';
          default:   return m;
        }
      }).replace(/[\u0000-\u001F\u007F]/g, (m) => {
        return '\\u' + m.charCodeAt(0).toString(16).padStart(4, '0');
      });
    case 'xml':
      return input.replace(/[&<>"']/g, (m) => {
        switch (m) {
          case '&':  return '&amp;';
          case '<':  return '&lt;';
          case '>':  return '&gt;';
          case '"':  return '&quot;';
          case "'":  return '&apos;';
          default:   return m;
        }
      });
    case 'csv':
      // Quote if contains delimiter/quote/newline; escape quotes by doubling.
      // Default delimiter is comma; quote character is ".
      if (/[",\n\r]/.test(input)) {
        return '"' + input.replace(/"/g, '""') + '"';
      }
      return input;
    case 'regex':
      return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    case 'shell':
      return input.replace(/[ `"'\n\\$><&|;:{}()#@!~*?=\[\]]/g, (m) => '\\' + m);
    default:
      return input;
  }
}

export function unescapeString(input: string, ctx: EscapeContext): { output?: string; error?: string } {
  try {
    switch (ctx) {
      case 'json': {
        // Parse as a JSON string — JSON.parse handles the escapes for us.
        const parsed = JSON.parse('"' + input.replace(/(^["])|(["]$)/g, '') + '"');
        return { output: String(parsed) };
      }
      case 'xml':
        return { output: input.replace(/&(amp|lt|gt|quot|apos|#(\d+)|#x([0-9a-fA-F]+));/g, (m, ent, dec, hex) => {
          if (ent === 'amp') return '&';
          if (ent === 'lt') return '<';
          if (ent === 'gt') return '>';
          if (ent === 'quot') return '"';
          if (ent === 'apos') return "'";
          if (dec) return String.fromCharCode(parseInt(dec, 10));
          if (hex) return String.fromCharCode(parseInt(hex, 16));
          return m;
        }) };
      case 'csv': {
        const trimmed = input.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
          const inner = trimmed.slice(1, -1);
          return { output: inner.replace(/""/g, '"') };
        }
        return { output: input };
      }
      case 'regex':
        return { output: input.replace(/\\([.*+?^${}()|[\]\\])/g, '$1') };
      case 'shell':
        return { output: input.replace(/\\(.)|"([^"]*)"|'([^']*)'/g, (_, esc, dq, sq) => {
          if (esc !== undefined) return esc;
          if (dq !== undefined) return dq;
          if (sq !== undefined) return sq;
          return '';
        }) };
      default:
        return { output: input };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Invalid escaped input' };
  }
}