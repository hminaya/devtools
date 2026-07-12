export type SortOrder = 'asc' | 'desc' | 'none';
export type SortMode =
  | 'lexical'      // alphabetic
  | 'numeric'      // by leading number
  | 'length'       // by length
  | 'none';        // only dedup
export type DedupMode = 'exact' | 'case-insensitive' | 'trim' | 'none';
export type KeepCase = 'sensitive' | 'first-seen';

export interface SortDedupOptions {
  sortMode: SortMode;
  dedupMode: DedupMode;
  trimLines: boolean;
}

function splitIntoLines(text: string): string[] {
  // Preserve original line-ending info via split on any common newline.
  // Final empty entry from trailing newline is dropped so trailing newline isn't
  // counted as an extra blank line — but blank lines within the text ARE kept.
  return text.split(/\r\n|\r|\n/);
}

export function sortAndDedup(text: string, opts: SortDedupOptions): string[] {
  let lines = splitIntoLines(text);
  if (opts.trimLines) lines = lines.map((l) => l.trim());

  // Dedup
  if (opts.dedupMode !== 'none') {
    const seen = new Set<string>();
    const dedup: string[] = [];
    for (const line of lines) {
      const key =
        opts.dedupMode === 'case-insensitive' ? line.toLowerCase() :
        opts.dedupMode === 'trim' ? line.trim() :
        line;
      if (!seen.has(key)) {
        seen.add(key);
        dedup.push(line);
      }
    }
    lines = dedup;
  }

  // Sort
  if (opts.sortMode === 'none') return lines;
  const cmp = (a: string, b: string): number => {
    if (opts.sortMode === 'numeric') {
      const na = parseFloat(a.trim());
      const nb = parseFloat(b.trim());
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      // Fall through to lexical when both aren't numeric.
    }
    if (opts.sortMode === 'length') {
      return a.length - b.length;
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };

  const sorted = [...lines].sort(cmp);
  return sorted;
}

export function sortAndDedupText(text: string, opts: SortDedupOptions): string {
  return sortAndDedup(text, opts).join('\n');
}