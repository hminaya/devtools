/**
 * Lightweight JSONPath query engine.
 *
 * Implements the most commonly-used JSONPath syntax described in the
 * IETF "JSONPath: Query expressions for JSON" RFC draft:
 *   - $                      : root
 *   - .name                  : dot property access ($.foo.bar)
 *   - .['name']            : bracketed property access with quotes
 *   - [index]                : integer index
 *   - [start:end]            : array slice (positive ints; negative = from end)
 *   - [*]                    : wildcard (every index/key)
 *   - ..name                 : recursive descent (deep search for a key)
 *   - ..[index]              : recursive descent to all matching indices
 *   - ..*                    : recursive descent to every leaf
 *   - [?(@.prop op value)]   : filter (filters by a property comparison)
 *
 * Not supported (intentionally narrow):
 *   - script expressions with @.length, function calls, complex boolean trees
 *   - union syntax [a,b]    : this is parsed as either/or — picky
 *
 * The output preserves an "options.mode" of:
 *   - "values"   : the matched values (default)
 *   - "paths"    : a JSONPath string per match
 *   - "wrapped"  : an array of {path, value} pairs
 *
 * All evaluation runs in JS without dependencies.
 */

export type MatchMode = 'values' | 'paths' | 'wrapped';

export interface JsonPathResult {
  matches: unknown[];
  paths: string[];
  error?: string;
}

class Token {
  constructor(
    public type: 'root' | 'dot' | 'recursive' | 'wildcard' | 'key' | 'index' | 'slice' | 'filter',
    public payload?: unknown
  ) {}
}

const QUOTED_KEY = /^['"](.+?)['"]$/;

export function tokenize(path: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = path.trim();
  if (s[0] !== '$') throw new Error('JSONPath must start with "$"');

  tokens.push(new Token('root'));
  i = 1;

  while (i < s.length) {
    if (s[i] === '.') {
      // .. = recursive descent, . = dot access
      if (s[i + 1] === '.') {
        tokens.push(new Token('recursive'));
        i += 2;
        continue;
      }
      tokens.push(new Token('dot'));
      i += 1;
      continue;
    }

    if (s[i] === '[') {
      // [...] — index, slice, wildcard, filter, or quoted key
      let depth = 1;
      let j = i + 1;
      while (j < s.length && depth > 0) {
        if (s[j] === '[') depth++;
        else if (s[j] === ']') depth--;
        if (depth > 0) j++;
      }
      if (depth !== 0) throw new Error('Unclosed "[" in JSONPath');
      const inner = s.slice(i + 1, j).trim();
      i = j + 1;

      if (inner === '*') {
        tokens.push(new Token('wildcard'));
        continue;
      }

      // Quoted string → key
      const quoted = inner.match(QUOTED_KEY);
      if (quoted) {
        tokens.push(new Token('key', quoted[1]));
        continue;
      }

      // Filter [?(...)]
      if (inner.startsWith('?') && inner.endsWith(')') && inner[1] === '(') {
        tokens.push(new Token('filter', inner.slice(2, -1).trim()));
        continue;
      }

      // Slice [start:end] or [start:end:step]
      if (inner.includes(':')) {
        const parts = inner.split(':');
        const start = parts[0]!.trim() === '' ? null : parseInt(parts[0]!, 10);
        const end   = parts[1]!.trim() === '' ? null : parseInt(parts[1]!, 10);
        const step  = parts[2] ? (parts[2]!.trim() === '' ? null : parseInt(parts[2]!, 10)) : null;
        tokens.push(new Token('slice', { start, end, step }));
        continue;
      }

      // Numeric index
      const idx = parseInt(inner, 10);
      if (!isNaN(idx)) {
        tokens.push(new Token('index', idx));
        continue;
      }

      // Fallback: treat as bare key
      tokens.push(new Token('key', inner));
      continue;
    }

    if (s[i] === '*') {
      tokens.push(new Token('wildcard'));
      i += 1;
      continue;
    }

    // Bare identifier (e.g., $.foo.bar)
    let j = i;
    while (j < s.length && s[j] !== '.' && s[j] !== '[') j++;
    const ident = s.slice(i, j);
    if (ident) tokens.push(new Token('key', ident));
    i = j;
  }

  return tokens;
}

interface Cursor { value: unknown; path: string; }

export function queryJsonPath(path: string, root: unknown): JsonPathResult {
  try {
    const tokens = tokenize(path);
    let cursors: Cursor[] = [{ value: root, path: '$' }];

    for (let t = 1; t < tokens.length; t++) {
      const token = tokens[t]!;
      const next: Cursor[] = [];

      const push = (value: unknown, path: string) => next.push({ value, path });

      const descendDotKey = (val: unknown, currentPath: string, key: string) => {
        if (val && typeof val === 'object') {
          if (Array.isArray(val) && /^\d+$/.test(key)) {
            const idx = parseInt(key, 10);
            if (idx >= 0 && idx < val.length) push(val[idx], `${currentPath}[${idx}]`);
          } else if (!Array.isArray(val) && (val as Record<string, unknown>)[key] !== undefined) {
            push((val as Record<string, unknown>)[key], `${currentPath}['${key}']`);
          }
        }
      };

      if (token.type === 'dot') continue; // pure separator

      if (token.type === 'key') {
        const key = token.payload as string;
        for (const c of cursors) descendDotKey(c.value, c.path, key);
      } else if (token.type === 'index') {
        const idx = token.payload as number;
        for (const c of cursors) {
          if (Array.isArray(c.value) && idx >= 0 && idx < c.value.length) {
            push(c.value[idx], `${c.path}[${idx}]`);
          }
        }
      } else if (token.type === 'wildcard') {
        for (const c of cursors) {
          if (Array.isArray(c.value)) {
            c.value.forEach((v, idx) => push(v, `${c.path}[${idx}]`));
          } else if (c.value && typeof c.value === 'object') {
            for (const [k, v] of Object.entries(c.value as Record<string, unknown>)) {
              push(v, `${c.path}['${k}']`);
            }
          }
        }
      } else if (token.type === 'slice') {
        const slice = token.payload as { start: number | null; end: number | null; step: number | null };
        for (const c of cursors) {
          if (Array.isArray(c.value)) {
            const arr = c.value;
            const start = slice.start ?? 0;
            const end = slice.end ?? arr.length;
            const step = slice.step ?? 1;
            applySlice(arr, start, end, step).forEach((v, i) => {
              if (v !== undefined) push(v, `${c.path}[${i}]`);
            });
          }
        }
      } else if (token.type === 'recursive') {
        const nextToken = tokens[t + 1];
        // Snapshot all descendants; pair with full paths
        for (const c of cursors) {
          walk(c.value, c.path, (subValue, subPath) => {
            if (subValue !== c.value) next.push({ value: subValue, path: subPath });
          });
        }
        // If a wildcard follows, push everything; if a key follows, filter
        if (nextToken) {
          if (nextToken.type === 'key') {
            const k = nextToken.payload as string;
            cursors = next.filter((c) => {
              if (c.value && typeof c.value === 'object' && !Array.isArray(c.value)) {
                return (c.value as Record<string, unknown>)[k] !== undefined;
              }
              return false;
            }).map((c) => ({ value: (c.value as Record<string, unknown>)[k]!, path: `${c.path}['${k}']` }));
            t++;
            continue;
          }
          if (nextToken.type === 'wildcard') {
            // Each descendant → children of itself
            const exp: Cursor[] = [];
            for (const c of next) {
              if (Array.isArray(c.value)) c.value.forEach((v, idx) => exp.push({ value: v, path: `${c.path}[${idx}]` }));
              else if (c.value && typeof c.value === 'object') {
                for (const [k, v] of Object.entries(c.value as Record<string, unknown>)) {
                  exp.push({ value: v, path: `${c.path}['${k}']` });
                }
              }
            }
            cursors = exp;
            t++;
            continue;
          }
        }
        cursors = next;
      } else if (token.type === 'filter') {
        const expr = token.payload as string;
        for (const c of cursors) {
          if (Array.isArray(c.value)) {
            c.value.forEach((v, idx) => {
              if (evalFilter(v, expr)) push(v, `${c.path}[${idx}]`);
            });
          } else if (c.value && typeof c.value === 'object') {
            for (const [k, v] of Object.entries(c.value as Record<string, unknown>)) {
              if (evalFilter(v, expr)) push(v, `${c.path}['${k}']`);
            }
          }
        }
      }

      cursors = next;
    }

    return {
      matches: cursors.map((c) => c.value),
      paths: cursors.map((c) => c.path),
    };
  } catch (e) {
    return { matches: [], paths: [], error: e instanceof Error ? e.message : String(e) };
  }
}

function applySlice(arr: unknown[], start: number, end: number, step: number) {
  const n = arr.length;
  let s = start < 0 ? Math.max(n + start, 0) : Math.min(start, n);
  let e = end < 0 ? Math.max(n + end, 0) : Math.min(end, n);
  const out: unknown[] = [];
  if (step > 0) {
    for (let i = s; i < e; i += step) out.push(arr[i]);
  } else if (step < 0) {
    for (let i = e - 1; i >= s; i += step) out.push(arr[i]);
  }
  return out;
}

function walk(value: unknown, path: string, visit: (v: unknown, p: string) => void) {
  visit(value, path);
  if (Array.isArray(value)) {
    value.forEach((v, idx) => walk(v, `${path}[${idx}]`, visit));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) walk(v, `${path}['${k}']`, visit);
  }
}

// Evaluate simple filter expressions like @.price < 10, @.published == true, or @.isbn (truthy)
function evalFilter(value: unknown, expr: string): boolean {
  // Truthy property check: @.foo or @.foo.bar (no operator) — value is truthy
  const truthyMatch = expr.match(/^@\.([A-Za-z_$][\w$.]*)$/);
  if (truthyMatch) {
    const path = truthyMatch[1]!.split('.');
    let cur: unknown = value;
    for (const k of path) {
      if (cur && typeof cur === 'object') cur = (cur as Record<string, unknown>)[k];
      else return false;
    }
    return cur !== undefined && cur !== null && cur !== false && cur !== 0 && cur !== '';
  }

  // Comparison: @.prop OP literal
  const match = expr.match(/^@\.?([A-Za-z_$][\w$]*)?\s*(==|!=|<=|>=|<|>)\s*(.+)$/);
  if (!match) return false;
  const [, prop, op, litRaw] = match;
  const lit = parseLiteral((litRaw ?? '').trim());
  let actual: unknown;
  if (!prop) actual = value;
  else if (value && typeof value === 'object') actual = (value as Record<string, unknown>)[prop];
  else return false;

  switch (op) {
    case '==': return actual === lit;
    case '!=': return actual !== lit;
    case '<':  return typeof actual === 'number' && typeof lit === 'number' && actual < lit;
    case '>':  return typeof actual === 'number' && typeof lit === 'number' && actual > lit;
    case '<=': return typeof actual === 'number' && typeof lit === 'number' && actual <= lit;
    case '>=': return typeof actual === 'number' && typeof lit === 'number' && actual >= lit;
    default:   return false;
  }
}

function parseLiteral(s: string): unknown {
  s = s.trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  if ((s.startsWith('\'') && s.endsWith('\'')) || (s.startsWith('"') && s.endsWith('"'))) return s.slice(1, -1);
  return s; // unknown identifier — compare as string
}