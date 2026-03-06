import type { Tool } from '../config/tools';

export interface RecoverySuggestion {
  tool: Tool;
  score: number;
  matchedTerms: string[];
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'best',
  'blog',
  'como',
  'con',
  'de',
  'del',
  'developer',
  'developers',
  'do',
  'el',
  'en',
  'for',
  'from',
  'html',
  'how',
  'index',
  'introduccion',
  'intro',
  'la',
  'las',
  'latest',
  'los',
  'new',
  'of',
  'on',
  'or',
  'para',
  'php',
  'post',
  'programacion',
  'que',
  'the',
  'this',
  'to',
  'una',
  'un',
  'url',
  'what',
  'with',
  'www',
  'y',
]);

const SYNONYMS: Record<string, string[]> = {
  api: ['json', 'http'],
  base64: ['encode', 'decode'],
  code: ['developer', 'programming'],
  decoder: ['decode'],
  developer: ['code', 'programming'],
  fhir: ['hl7', 'health'],
  hash: ['md5', 'sha1', 'sha256', 'security'],
  hl7: ['fhir', 'health'],
  ios: ['apple', 'xcode', 'swift'],
  json: ['api', 'data'],
  jwt: ['token', 'security'],
  mobile: ['ios', 'apple'],
  objectivec: ['ios', 'xcode', 'swift'],
  programador: ['developer', 'code'],
  programming: ['code', 'developer'],
  qa: ['question', 'answer'],
  reclutamiento: ['question', 'answer'],
  saml: ['security', 'xml'],
  security: ['token', 'hash', 'certificate'],
  swift: ['ios', 'xcode', 'apple'],
  token: ['jwt', 'security'],
  xcode: ['ios', 'swift', 'apple'],
  xml: ['saml', 'data'],
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isNoiseToken(token: string): boolean {
  if (STOP_WORDS.has(token)) {
    return true;
  }

  if (/^\d+$/.test(token)) {
    return true;
  }

  if (/^20\d{2}$/.test(token)) {
    return true;
  }

  return token.length < 2;
}

function splitIntoTokens(value: string): string[] {
  return normalizeText(safeDecode(value))
    .replace(/index\.php/gi, ' ')
    .replace(/\.(html|php|aspx?)\b/gi, ' ')
    .split(/[^a-z0-9]+/)
    .filter((token) => !isNoiseToken(token));
}

function expandTokens(tokens: string[]): string[] {
  const expanded = new Set<string>();

  tokens.forEach((token) => {
    expanded.add(token);

    const synonymTerms = SYNONYMS[token] ?? [];
    synonymTerms.forEach((term) => expanded.add(term));
  });

  return [...expanded];
}

function getToolSearchTerms(tool: Tool): string[] {
  const baseTerms = splitIntoTokens([
    tool.id,
    tool.name,
    tool.description,
    tool.category,
    tool.route,
  ].join(' '));

  return expandTokens(baseTerms);
}

export function extractRecoveryTerms(pathname: string): string[] {
  const baseTerms = splitIntoTokens(pathname);
  return expandTokens(baseTerms);
}

export function getReadablePathname(pathname: string): string {
  const decoded = safeDecode(pathname || '/');
  return decoded.length > 100 ? `${decoded.slice(0, 97)}...` : decoded;
}

export function getLatestTools(tools: Tool[], limit = 6): Tool[] {
  return tools.filter((tool) => !tool.external).slice(-limit).reverse();
}

export function getRecoverySuggestions(pathname: string, tools: Tool[], limit = 6): RecoverySuggestion[] {
  const queryTerms = extractRecoveryTerms(pathname);

  if (queryTerms.length === 0) {
    return [];
  }

  return tools
    .map((tool) => {
      const toolTerms = getToolSearchTerms(tool);
      const matchedTerms = new Set<string>();
      let score = tool.external ? 0 : 1;

      queryTerms.forEach((term) => {
        if (toolTerms.includes(term)) {
          matchedTerms.add(term);
          score += 10;
          return;
        }

        const partialMatch = toolTerms.some(
          (toolTerm) =>
            (term.length >= 4 && toolTerm.includes(term)) ||
            (toolTerm.length >= 4 && term.includes(toolTerm))
        );

        if (partialMatch) {
          matchedTerms.add(term);
          score += 4;
        }
      });

      return {
        tool,
        score,
        matchedTerms: [...matchedTerms].slice(0, 4),
      };
    })
    .filter((result) => result.score > 1)
    .sort((left, right) => right.score - left.score || left.tool.name.localeCompare(right.tool.name))
    .slice(0, limit);
}
