export interface RegexMatch {
  fullMatch: string;
  index: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string> | null;
}

export function getMatches(pattern: string, flags: string, input: string): RegexMatch[] {
  if (!pattern) return [];
  const regex = new RegExp(pattern, flags);
  const matches: RegexMatch[] = [];

  if (flags.includes('g')) {
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((match = regex.exec(input)) !== null) {
      matches.push({
        fullMatch: match[0],
        index: match.index,
        groups: match.slice(1),
        namedGroups: match.groups ? { ...match.groups } : null,
      });
      // Prevent infinite loop on zero-length matches
      if (match[0].length === 0) regex.lastIndex++;
    }
  } else {
    const match = regex.exec(input);
    if (match) {
      matches.push({
        fullMatch: match[0],
        index: match.index,
        groups: match.slice(1),
        namedGroups: match.groups ? { ...match.groups } : null,
      });
    }
  }

  return matches;
}

export function applyReplacement(
  pattern: string,
  flags: string,
  input: string,
  replacement: string
): string {
  if (!pattern) return input;
  const regex = new RegExp(pattern, flags);
  return input.replace(regex, replacement);
}

export function highlightSegments(
  input: string,
  matches: RegexMatch[]
): { text: string; isMatch: boolean }[] {
  if (matches.length === 0) return [{ text: input, isMatch: false }];

  const segments: { text: string; isMatch: boolean }[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.index > cursor) {
      segments.push({ text: input.slice(cursor, match.index), isMatch: false });
    }
    segments.push({ text: match.fullMatch, isMatch: true });
    cursor = match.index + match.fullMatch.length;
  }

  if (cursor < input.length) {
    segments.push({ text: input.slice(cursor), isMatch: false });
  }

  return segments;
}
