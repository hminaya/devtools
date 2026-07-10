import { TOOLS, type Tool } from './tools';

export const BASE_URL = 'https://www.developers.do';
export const DEFAULT_OG_IMAGE = '/og-image.png';
export const LAST_MODIFIED = new Date('2026-07-10');

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
    description: 'Developer utilities for regex testing, string similarity, number conversion, and reusable patterns.',
  },
  {
    name: 'Formatting',
    slug: 'formatting',
    description: 'Format, validate, convert, and inspect JSON, XML, CSV, YAML, SQL, timestamps, stack traces, and structured data.',
  },
  {
    name: 'Generators',
    slug: 'generators',
    description: 'Generate passwords, UUIDs, QR codes, random numbers, hashes, placeholder text, and other developer fixtures.',
  },
  {
    name: 'Code & Schemas',
    slug: 'code-and-schemas',
    description: 'Convert JSON into typed models and schemas for TypeScript, Python, C#, Swift, Kotlin, Go, Rust, and JSDoc.',
  },
  {
    name: 'Networking',
    slug: 'networking',
    description: 'Test APIs and look up HTTP status codes with practical developer-focused networking utilities.',
  },
  {
    name: 'Security',
    slug: 'security',
    description: 'Client-side security tools for JWTs, hashes, certificates, CSRs, secrets scanning, and configuration audits.',
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
