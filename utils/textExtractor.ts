export interface ExtractedEntity {
  type: string;
  value: string;
  start: number;
  end: number;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  summary: Record<string, number>;
}

interface PatternDefinition {
  name: string;
  pattern: RegExp;
  description: string;
}

const PATTERNS: PatternDefinition[] = [
  {
    name: 'Email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    description: 'Email addresses',
  },
  {
    name: 'URL',
    pattern: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g,
    description: 'HTTP/HTTPS URLs',
  },
  {
    name: 'IPv4',
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    description: 'IPv4 addresses',
  },
  {
    name: 'IPv6',
    pattern: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g,
    description: 'IPv6 addresses',
  },
  {
    name: 'Phone',
    pattern: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,
    description: 'Phone numbers (US format)',
  },
  {
    name: 'Date',
    pattern: /\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g,
    description: 'Dates (various formats)',
  },
  {
    name: 'Time',
    pattern: /\b(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:\s?[AP]M)?\b/gi,
    description: 'Time values',
  },
  {
    name: 'UUID',
    pattern: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
    description: 'UUIDs',
  },
  {
    name: 'Hex Color',
    pattern: /#(?:[0-9a-fA-F]{3}){1,2}\b/g,
    description: 'Hex color codes',
  },
  {
    name: 'Credit Card',
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    description: 'Credit card numbers (masked in output)',
  },
  {
    name: 'MAC Address',
    pattern: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
    description: 'MAC addresses',
  },
  {
    name: 'File Path',
    pattern: /(?:\/[\w.-]+)+\/?|(?:[A-Za-z]:\\[\w\\.-]+)/g,
    description: 'File paths (Unix/Windows)',
  },
  {
    name: 'Hashtag',
    pattern: /#[a-zA-Z][a-zA-Z0-9_]*/g,
    description: 'Hashtags',
  },
  {
    name: 'Mention',
    pattern: /@[a-zA-Z][a-zA-Z0-9_]*/g,
    description: '@mentions',
  },
  {
    name: 'Semver',
    pattern: /\bv?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?(?:\+[a-zA-Z0-9.]+)?\b/g,
    description: 'Semantic versions',
  },
  {
    name: 'JWT',
    pattern: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\b/g,
    description: 'JWT tokens',
  },
  {
    name: 'Base64',
    pattern: /\b(?:[A-Za-z0-9+/]{4}){10,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?\b/g,
    description: 'Base64 encoded strings (40+ chars)',
  },
];

export function getAvailablePatterns(): { name: string; description: string }[] {
  return PATTERNS.map(({ name, description }) => ({ name, description }));
}

function maskSensitive(type: string, value: string): string {
  if (type === 'Credit Card') {
    return value.slice(0, 4) + ' **** **** ' + value.slice(-4);
  }
  return value;
}

export function extractEntities(
  text: string,
  enabledTypes: string[]
): ExtractionResult {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const { name, pattern } of PATTERNS) {
    if (!enabledTypes.includes(name)) continue;

    // Reset regex state
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const key = `${name}:${match[0]}:${match.index}`;
      if (seen.has(key)) continue;
      seen.add(key);

      entities.push({
        type: name,
        value: maskSensitive(name, match[0]),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Sort by position in text
  entities.sort((a, b) => a.start - b.start);

  // Generate summary
  const summary: Record<string, number> = {};
  for (const entity of entities) {
    summary[entity.type] = (summary[entity.type] || 0) + 1;
  }

  return { entities, summary };
}

export function exportAsJson(entities: ExtractedEntity[]): string {
  return JSON.stringify(entities, null, 2);
}

export function exportAsCsv(entities: ExtractedEntity[]): string {
  const header = 'Type,Value,Start,End';
  const rows = entities.map(
    (e) => `"${e.type}","${e.value.replace(/"/g, '""')}",${e.start},${e.end}`
  );
  return [header, ...rows].join('\n');
}

export function getUniqueValues(entities: ExtractedEntity[]): Record<string, string[]> {
  const grouped: Record<string, Set<string>> = {};
  for (const entity of entities) {
    if (!grouped[entity.type]) {
      grouped[entity.type] = new Set();
    }
    const set = grouped[entity.type];
    if (set) {
      set.add(entity.value);
    }
  }
  const result: Record<string, string[]> = {};
  for (const [type, values] of Object.entries(grouped)) {
    result[type] = Array.from(values);
  }
  return result;
}

export const SAMPLE_TEXT = `Here's a sample log file with various data types:

User john.doe@example.com logged in from 192.168.1.100 at 2024-03-15 14:30:00
Request ID: 550e8400-e29b-41d4-a716-446655440000
API endpoint: https://api.example.com/v1/users?id=123

Error in /var/log/application/error.log:
Connection timeout from 10.0.0.50 (MAC: 00:1A:2B:3C:4D:5E)

Contact support: +1 (555) 123-4567 or support@company.org
Version: v2.1.0-beta.3

Color theme: #3B82F6, #10B981, #EF4444
Hashtags: #javascript #typescript #webdev
Mentions: @alice @bob @charlie

JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Meeting scheduled for 09:30 AM on 12/25/2024
File uploaded: C:\\Users\\Admin\\Documents\\report.pdf`;
