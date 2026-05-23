export type DataFormat = 'csv' | 'json' | 'unknown';
export type Indent = 2 | 4;
export type DelimiterChoice = 'auto' | ',' | ';' | '\t' | '|';

export interface ConvertOptions {
  manualFormat: 'auto' | 'csv' | 'json';
  delimiter: DelimiterChoice;
  header: boolean;
  typeInference: boolean;
  flatten: boolean;
  indent: Indent;
}

export interface ConvertResult {
  output: string;
  detectedFormat: DataFormat;
  outputFormat: 'csv' | 'json';
  /** Delimiter actually used for the CSV side (auto-detected or explicit). */
  delimiterUsed?: string;
  /** Row count parsed/written, for the UI status line. */
  rowCount?: number;
  error?: string;
}

const CANDIDATE_DELIMITERS = [',', ';', '\t', '|'] as const;

/** Detect whether the input looks like JSON or CSV. */
export function detectFormat(input: string): DataFormat {
  const trimmed = input.trim();
  if (!trimmed) return 'unknown';

  // JSON converters elsewhere on the site treat a leading { or [ as JSON.
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Could still be CSV with a quirky first cell — fall through.
    }
  }

  // Anything with a row of delimited values reads as CSV.
  const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? '';
  if (CANDIDATE_DELIMITERS.some((d) => firstLine.includes(d))) {
    return 'csv';
  }

  // Single column with multiple rows is still valid CSV.
  if (trimmed.includes('\n')) return 'csv';

  return 'unknown';
}

/** Pick the delimiter that appears most often in the header line (outside quotes). */
export function detectDelimiter(input: string): string {
  const firstLine = stripQuotedSpans(input.split(/\r?\n/, 1)[0] ?? '');
  let best = ',';
  let bestCount = 0;
  for (const d of CANDIDATE_DELIMITERS) {
    const count = firstLine.split(d).length - 1;
    if (count > bestCount) {
      best = d;
      bestCount = count;
    }
  }
  return best;
}

/** Remove the contents of "quoted spans" so delimiters inside quotes aren't counted. */
function stripQuotedSpans(line: string): string {
  return line.replace(/"(?:[^"]|"")*"/g, '""');
}

/** RFC 4180 CSV tokenizer: handles quoted fields, embedded delimiters/newlines, and "" escapes. */
export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;

  const endField = () => {
    row.push(field);
    field = '';
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const char = text[i]!;

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += char;
        i += 1;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
    } else if (char === delimiter) {
      endField();
      i += 1;
    } else if (char === '\r') {
      if (text[i + 1] === '\n') i += 2;
      else i += 1;
      endRow();
    } else if (char === '\n') {
      i += 1;
      endRow();
    } else {
      field += char;
      i += 1;
    }
  }

  // Flush the trailing field/row (file may not end in a newline).
  endRow();

  // Drop blank rows produced by trailing newlines or empty lines.
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** Convert a raw CSV cell to a JS value, optionally inferring numbers/booleans/null. */
function coerceCell(raw: string, typeInference: boolean): unknown {
  if (!typeInference) return raw;
  if (raw === '') return null;

  const lower = raw.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  if (lower === 'null') return null;

  // Strict numeric form: no leading zeros (preserves IDs/zips like "007"),
  // and skip very long integers that would lose precision as JS numbers.
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(raw)) {
    const digits = raw.replace(/[^0-9]/g, '');
    if (!(Number.isInteger(Number(raw)) && digits.length > 15)) {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
  }

  return raw;
}

function csvToJson(input: string, options: ConvertOptions): ConvertResult {
  const delimiter = options.delimiter === 'auto' ? detectDelimiter(input) : options.delimiter;
  const rows = parseCsv(input, delimiter);

  if (rows.length === 0) {
    return { output: '', detectedFormat: 'csv', outputFormat: 'json', delimiterUsed: delimiter };
  }

  let data: unknown;
  let rowCount: number;

  if (options.header) {
    const headers = rows[0]!.map((h) => h.trim());
    const records = rows.slice(1).map((cols) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((key, idx) => {
        obj[key] = coerceCell(cols[idx] ?? '', options.typeInference);
      });
      return obj;
    });
    data = records;
    rowCount = records.length;
  } else {
    const matrix = rows.map((cols) => cols.map((c) => coerceCell(c, options.typeInference)));
    data = matrix;
    rowCount = matrix.length;
  }

  return {
    output: JSON.stringify(data, null, options.indent),
    detectedFormat: 'csv',
    outputFormat: 'json',
    delimiterUsed: delimiter,
    rowCount,
  };
}

/** Flatten nested objects into dot.notation keys; arrays are JSON-encoded into one cell. */
function flattenRecord(
  obj: Record<string, unknown>,
  flatten: boolean,
  prefix = '',
  out: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (flatten && val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if (Object.keys(val as object).length === 0) out[path] = '';
      else flattenRecord(val as Record<string, unknown>, flatten, path, out);
    } else {
      out[path] = val;
    }
  }
  return out;
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCsv(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function jsonToCsv(input: string, options: ConvertOptions): ConvertResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    return {
      output: '',
      detectedFormat: 'json',
      outputFormat: 'csv',
      error: `JSON parse error: ${(e as Error).message}`,
    };
  }

  const delimiter = options.delimiter === 'auto' ? ',' : options.delimiter;

  // Normalize to an array of items.
  const items = Array.isArray(parsed) ? parsed : [parsed];
  if (items.length === 0) {
    return { output: '', detectedFormat: 'json', outputFormat: 'csv', delimiterUsed: delimiter, rowCount: 0 };
  }

  // Array of arrays → emit rows directly (no header inference).
  if (items.every((it) => Array.isArray(it))) {
    const lines = (items as unknown[][]).map((cols) =>
      cols.map((c) => escapeCsv(cellToString(c), delimiter)).join(delimiter)
    );
    return {
      output: lines.join('\n'),
      detectedFormat: 'json',
      outputFormat: 'csv',
      delimiterUsed: delimiter,
      rowCount: lines.length,
    };
  }

  const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);

  // Array of objects → flatten, collect the union of keys as headers.
  if (items.every(isPlainObject)) {
    const flatRows = (items as Record<string, unknown>[]).map((it) =>
      flattenRecord(it, options.flatten)
    );
    const headers: string[] = [];
    const seen = new Set<string>();
    for (const r of flatRows) {
      for (const key of Object.keys(r)) {
        if (!seen.has(key)) {
          seen.add(key);
          headers.push(key);
        }
      }
    }
    const headerLine = headers.map((h) => escapeCsv(h, delimiter)).join(delimiter);
    const dataLines = flatRows.map((r) =>
      headers.map((h) => escapeCsv(cellToString(r[h]), delimiter)).join(delimiter)
    );
    return {
      output: [headerLine, ...dataLines].join('\n'),
      detectedFormat: 'json',
      outputFormat: 'csv',
      delimiterUsed: delimiter,
      rowCount: dataLines.length,
    };
  }

  // Mixed / array of primitives → single "value" column.
  const lines = ['value', ...items.map((it) => escapeCsv(cellToString(it), delimiter))];
  return {
    output: lines.join('\n'),
    detectedFormat: 'json',
    outputFormat: 'csv',
    delimiterUsed: delimiter,
    rowCount: items.length,
  };
}

export function convert(input: string, options: ConvertOptions): ConvertResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: '', detectedFormat: 'unknown', outputFormat: 'json' };
  }

  const detected = options.manualFormat === 'auto' ? detectFormat(trimmed) : options.manualFormat;

  if (detected === 'unknown') {
    return {
      output: '',
      detectedFormat: 'unknown',
      outputFormat: 'json',
      error: 'Could not detect format. Make sure input is valid CSV or JSON.',
    };
  }

  return detected === 'json' ? jsonToCsv(trimmed, options) : csvToJson(input, options);
}

export const SAMPLES: { label: string; format: 'csv' | 'json'; value: string }[] = [
  {
    label: 'Spreadsheet export (CSV)',
    format: 'csv',
    value: `id,name,email,role,active
1,Jane Doe,jane@example.com,admin,true
2,John Smith,"Smith, John" <john@example.com>,editor,true
3,Acme Corp,billing@acme.io,viewer,false`,
  },
  {
    label: 'API response (JSON)',
    format: 'json',
    value: JSON.stringify(
      [
        {
          id: 1,
          name: 'Jane Doe',
          contact: { email: 'jane@example.com', phone: '555-0100' },
          active: true,
        },
        {
          id: 2,
          name: 'John Smith',
          contact: { email: 'john@example.com', phone: '555-0142' },
          active: false,
        },
      ],
      null,
      2
    ),
  },
];
