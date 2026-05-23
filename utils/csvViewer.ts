import { parseCsv, detectDelimiter, type DelimiterChoice } from './csvJson';

export type { DelimiterChoice };
export type SortDir = 'asc' | 'desc';

export interface SortState {
  col: number;
  dir: SortDir;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  /** Delimiter actually used (auto-detected or explicit). */
  delimiterUsed: string;
}

/** Parse CSV text into a normalized, rectangular table for display. */
export function buildTable(
  input: string,
  delimiter: DelimiterChoice,
  hasHeader: boolean
): TableData {
  const used = delimiter === 'auto' ? detectDelimiter(input) : delimiter;
  const parsed = input.trim() ? parseCsv(input, used) : [];

  if (parsed.length === 0) {
    return { headers: [], rows: [], delimiterUsed: used };
  }

  // Column count is the widest row so ragged data still lines up.
  const colCount = parsed.reduce((max, row) => Math.max(max, row.length), 0);

  let headers: string[];
  let dataRows: string[][];

  if (hasHeader) {
    const headerRow = parsed[0]!;
    headers = Array.from({ length: colCount }, (_, i) =>
      (headerRow[i] ?? '').trim() || `Column ${i + 1}`
    );
    dataRows = parsed.slice(1);
  } else {
    headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
    dataRows = parsed;
  }

  // Pad short rows so every row has the same number of cells.
  const rows = dataRows.map((row) =>
    row.length === colCount
      ? row
      : Array.from({ length: colCount }, (_, i) => row[i] ?? '')
  );

  return { headers, rows, delimiterUsed: used };
}

/** Case-insensitive substring match across any cell in a row. */
export function filterRows(rows: string[][], query: string): string[][] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
}

const NUMERIC_RE = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

function asNumber(value: string): number | null {
  const v = value.trim();
  if (v === '' || !NUMERIC_RE.test(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Type-aware, stable sort: numeric when both cells are numbers, else locale string compare. Empty cells sink to the bottom. */
export function sortRows(rows: string[][], sort: SortState): string[][] {
  const { col, dir } = sort;
  const factor = dir === 'asc' ? 1 : -1;

  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const av = a.row[col] ?? '';
      const bv = b.row[col] ?? '';

      const aEmpty = av.trim() === '';
      const bEmpty = bv.trim() === '';
      if (aEmpty && bEmpty) return a.index - b.index;
      if (aEmpty) return 1; // empties always last, regardless of direction
      if (bEmpty) return -1;

      const an = asNumber(av);
      const bn = asNumber(bv);

      let cmp: number;
      if (an !== null && bn !== null) {
        cmp = an - bn;
      } else {
        cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
      }

      return cmp !== 0 ? cmp * factor : a.index - b.index; // stable tiebreak
    })
    .map((entry) => entry.row);
}

export const SAMPLE_CSV = `id,name,department,salary,start_date,active
1,Jane Doe,Engineering,125000,2021-03-15,true
2,John Smith,Marketing,98000,2019-07-01,true
3,Acme Bot,Engineering,142000,2022-11-20,false
4,Maria Garcia,Sales,87500,2020-01-10,true
5,Wei Chen,Engineering,118000,2023-05-30,true
6,Sam Patel,Marketing,73000,2018-09-12,false
7,Aisha Khan,Sales,95000,2021-12-05,true`;
