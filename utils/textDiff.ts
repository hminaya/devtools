export interface DiffLine {
  type: 'added' | 'removed' | 'equal';
  text: string;
  lineNumber?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: {
    added: number;
    removed: number;
    unchanged: number;
  };
}

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  return dp;
}

export function computeLineDiff(text1: string, text2: string): DiffResult {
  const a = text1.split('\n');
  const b = text2.split('\n');
  const dp = lcs(a, b);
  const lines: DiffLine[] = [];

  let i = a.length;
  let j = b.length;
  const result: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.push({ type: 'equal', text: a[i - 1]! });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      result.push({ type: 'added', text: b[j - 1]! });
      j--;
    } else {
      result.push({ type: 'removed', text: a[i - 1]! });
      i--;
    }
  }

  result.reverse();

  let lineNum = 1;
  for (const line of result) {
    lines.push({ ...line, lineNumber: lineNum++ });
  }

  const stats = {
    added: lines.filter((l) => l.type === 'added').length,
    removed: lines.filter((l) => l.type === 'removed').length,
    unchanged: lines.filter((l) => l.type === 'equal').length,
  };

  return { lines, stats };
}
