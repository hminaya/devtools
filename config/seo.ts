import { TOOLS, type Tool } from './tools';

export const BASE_URL = 'https://www.developers.do';
export const DEFAULT_OG_IMAGE = '/og-image.png';
export const LAST_MODIFIED = new Date('2026-07-12');

export interface ToolCategory {
  name: string;
  slug: string;
  description: string;
}

export const TOOL_CATEGORY_ORDER = [
  'SAML',
  'AI Tools',
  'Algorithms',
  'Formatting',
  'Generators',
  'Code & Schemas',
  'Networking',
  'Security',
  'Data',
  'Apps',
] as const;

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: 'SAML',
    slug: 'saml',
    description: 'Decode, inspect, validate, generate, and troubleshoot SAML assertions, metadata, certificates, and SSO flows.',
  },
  {
    name: 'AI Tools',
    slug: 'ai-tools',
    description: 'Browser-based AI utilities for tokenization, summarization, classification, similarity, and text analysis.',
  },
  {
    name: 'Algorithms',
    slug: 'algorithms',
    description: 'Developer utilities for regex testing, string similarity, number conversion, SemVer comparison, and reusable patterns.',
  },
  {
    name: 'Formatting',
    slug: 'formatting',
    description: 'Format, validate, convert, and inspect JSON, XML, HTML, CSV, YAML, TOML, SQL, GraphQL, timestamps, stack traces, CSS, JavaScript, Markdown, SVG, and structured data. Includes string case conversion, text statistics, line sorting, escape/unescape, whitespace cleanup, HTML entities, Unicode escapes, Morse code, JSONPath, and data URI tools.',
  },
  {
    name: 'Generators',
    slug: 'generators',
    description: 'Generate passwords, UUIDs (all RFC 9562 versions), ULIDs, QR codes, random numbers, git branch names, ASCII art, placeholder text, and other developer fixtures.',
  },
  {
    name: 'Code & Schemas',
    slug: 'code-and-schemas',
    description: 'Convert JSON into typed models and schemas for TypeScript, Python, C#, Swift, Kotlin, Go, Rust, and JSDoc. Pick colors and browse curated palettes (Tailwind, Nord, Solarized, Dracula, and more).',
  },
  {
    name: 'Networking',
    slug: 'networking',
    description: 'Test APIs, look up HTTP status codes, MIME types, and common TCP/UDP port numbers with practical developer-focused networking references.',
  },
  {
    name: 'Security',
    slug: 'security',
    description: 'Client-side security tools for JWTs, hashes (MD5, SHA-1, SHA-256/384/512), HMAC, certificates, CSRs, secrets scanning, and configuration audits.',
  },
  {
    name: 'Data',
    slug: 'data',
    description: 'Open-source data utilities and resources for developers.',
  },
  {
    name: 'Apps',
    slug: 'apps',
    description: 'Developer-made apps and App Store lookup utilities from developers.do.',
  },
];

export function getCategorySlug(category: string): string {
  const configuredCategory = TOOL_CATEGORIES.find((item) => item.name === category);

  if (configuredCategory) {
    return configuredCategory.slug;
  }

  return category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getCategoryBySlug(slug: string): ToolCategory | undefined {
  return TOOL_CATEGORIES.find((category) => category.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getInternalCategoryTools(category: string): Tool[] {
  return getToolsByCategory(category).filter((tool) => !tool.external);
}
