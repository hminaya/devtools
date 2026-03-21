'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';

interface RegexEntry {
  name: string;
  pattern: string;
  flags?: string;
  description: string;
  example: string;
  category: string;
}

const REGEX_PATTERNS: RegexEntry[] = [
  // Validation
  {
    name: 'Email Address',
    pattern: '^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$',
    flags: 'i',
    description: 'Matches a standard email address format',
    example: 'user@example.com',
    category: 'Validation',
  },
  {
    name: 'URL',
    pattern: 'https?:\\/\\/(www\\.)?[-\\w@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b([-\\w@:%_+.~#?&\\/=]*)',
    description: 'Matches http and https URLs with optional paths and query strings',
    example: 'https://example.com/path?q=1',
    category: 'Validation',
  },
  {
    name: 'IPv4 Address',
    pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    description: 'Matches a valid IPv4 address (0–255 per octet)',
    example: '192.168.1.1',
    category: 'Validation',
  },
  {
    name: 'IPv6 Address',
    pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$',
    description: 'Matches a full-form IPv6 address',
    example: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    category: 'Validation',
  },
  {
    name: 'Phone Number',
    pattern: '^\\+?[\\d\\s\\-().]{7,15}$',
    description: 'Matches international and US phone numbers (loose format)',
    example: '+1 (555) 123-4567',
    category: 'Validation',
  },
  {
    name: 'US ZIP Code',
    pattern: '^\\d{5}(-\\d{4})?$',
    description: 'Matches 5-digit and ZIP+4 US postal codes',
    example: '90210 or 90210-1234',
    category: 'Validation',
  },
  {
    name: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$',
    description: 'Requires uppercase, lowercase, digit, special char, min 8 chars',
    example: 'P@ssw0rd!',
    category: 'Validation',
  },
  {
    name: 'UUID / GUID',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    flags: 'i',
    description: 'Matches RFC 4122 UUID format',
    example: '550e8400-e29b-41d4-a716-446655440000',
    category: 'Validation',
  },
  {
    name: 'Credit Card Number',
    pattern: '^(?:4\\d{12}(?:\\d{3})?|5[1-5]\\d{14}|3[47]\\d{13}|6(?:011|5\\d{2})\\d{12})$',
    description: 'Matches Visa, Mastercard, Amex, and Discover card numbers',
    example: '4111111111111111',
    category: 'Validation',
  },
  {
    name: 'Social Security Number',
    pattern: '^(?!000|666|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0000)\\d{4}$',
    description: 'Matches US SSN format, excluding known invalid prefixes',
    example: '123-45-6789',
    category: 'Validation',
  },
  {
    name: 'Slug',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    description: 'Matches URL-safe slugs (lowercase, hyphens, no leading/trailing hyphens)',
    example: 'my-blog-post-title',
    category: 'Validation',
  },
  {
    name: 'Username',
    pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,19}$',
    description: 'Starts with a letter, 3–20 chars, allows letters, digits, underscores',
    example: 'john_doe42',
    category: 'Validation',
  },
  // Data Extraction
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
    description: 'Extracts ISO 8601 dates',
    example: '2024-03-15',
    category: 'Extraction',
  },
  {
    name: 'Date (MM/DD/YYYY)',
    pattern: '\\b(0?[1-9]|1[0-2])\\/(0?[1-9]|[12]\\d|3[01])\\/(\\d{4})\\b',
    description: 'Extracts US-format dates with capture groups for month, day, year',
    example: '03/15/2024',
    category: 'Extraction',
  },
  {
    name: 'Time (HH:MM)',
    pattern: '\\b([01]\\d|2[0-3]):[0-5]\\d\\b',
    description: 'Extracts 24-hour clock times',
    example: '14:30',
    category: 'Extraction',
  },
  {
    name: 'Time (HH:MM:SS)',
    pattern: '\\b([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\b',
    description: 'Extracts 24-hour times with seconds',
    example: '14:30:59',
    category: 'Extraction',
  },
  {
    name: 'Hex Color',
    pattern: '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b',
    description: 'Extracts 3- or 6-digit hex color codes',
    example: '#ff6600 or #f60',
    category: 'Extraction',
  },
  {
    name: 'Integer',
    pattern: '^-?\\d+$',
    description: 'Matches positive or negative integers',
    example: '-42 or 1000',
    category: 'Extraction',
  },
  {
    name: 'Decimal Number',
    pattern: '^-?\\d+(\\.\\d+)?$',
    description: 'Matches integers and floating-point numbers',
    example: '3.14 or -2.5',
    category: 'Extraction',
  },
  {
    name: 'Scientific Notation',
    pattern: '-?\\d+(\\.\\d+)?([eE][+-]?\\d+)?',
    description: 'Extracts numbers in scientific notation',
    example: '6.022e23 or 1.5E-10',
    category: 'Extraction',
  },
  {
    name: 'Currency (USD)',
    pattern: '\\$\\d{1,3}(,\\d{3})*(\\.\\d{2})?',
    description: 'Extracts US dollar amounts with optional cents',
    example: '$1,234.56',
    category: 'Extraction',
  },
  {
    name: 'Twitter / X Handle',
    pattern: '@[a-zA-Z0-9_]{1,15}',
    description: 'Extracts @mention handles',
    example: '@johndoe',
    category: 'Extraction',
  },
  {
    name: 'Hashtag',
    pattern: '#[a-zA-Z][\\w]*',
    description: 'Extracts hashtags starting with a letter',
    example: '#javascript',
    category: 'Extraction',
  },
  // Text Processing
  {
    name: 'Trim Whitespace',
    pattern: '^\\s+|\\s+$',
    flags: 'g',
    description: 'Matches leading and trailing whitespace for removal',
    example: '  hello world  ',
    category: 'Text Processing',
  },
  {
    name: 'Collapse Multiple Spaces',
    pattern: '\\s{2,}',
    flags: 'g',
    description: 'Matches two or more consecutive whitespace characters',
    example: 'hello   world',
    category: 'Text Processing',
  },
  {
    name: 'Empty Lines',
    pattern: '^\\s*$',
    flags: 'gm',
    description: 'Matches blank or whitespace-only lines',
    example: 'line1\n\nline2',
    category: 'Text Processing',
  },
  {
    name: 'Repeated Words',
    pattern: '\\b(\\w+)\\s+\\1\\b',
    flags: 'gi',
    description: 'Finds accidentally duplicated consecutive words',
    example: 'the the quick brown fox',
    category: 'Text Processing',
  },
  {
    name: 'HTML Tags',
    pattern: '<([a-z][a-z0-9]*)([^>]*)>(.*?)<\\/\\1>',
    flags: 'gis',
    description: 'Matches HTML element open/close pairs with content',
    example: '<p class="foo">Hello</p>',
    category: 'Text Processing',
  },
  {
    name: 'HTML Comments',
    pattern: '<!--[\\s\\S]*?-->',
    flags: 'g',
    description: 'Matches HTML comment blocks',
    example: '<!-- This is a comment -->',
    category: 'Text Processing',
  },
  {
    name: 'Single-Line Comment (//)',
    pattern: '\\/\\/.*$',
    flags: 'gm',
    description: 'Matches C-style single-line comments',
    example: 'const x = 1; // a comment',
    category: 'Text Processing',
  },
  {
    name: 'Single-Line Comment (#)',
    pattern: '#.*$',
    flags: 'gm',
    description: 'Matches shell/Python-style single-line comments',
    example: 'x = 1 # a comment',
    category: 'Text Processing',
  },
  {
    name: 'Multi-Line Comment (/* */)',
    pattern: '\\/\\*[\\s\\S]*?\\*\\/',
    flags: 'g',
    description: 'Matches C-style block comments',
    example: '/* multi\n   line */',
    category: 'Text Processing',
  },
  // Code & Development
  {
    name: 'Semantic Version',
    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(-[a-zA-Z0-9.]+)?(\\+[a-zA-Z0-9.]+)?$',
    description: 'Matches semver strings like 1.2.3, 1.0.0-beta.1',
    example: '2.1.0-alpha.1+build.42',
    category: 'Code & Dev',
  },
  {
    name: 'File Extension',
    pattern: '\\.([a-zA-Z0-9]+)$',
    description: 'Extracts file extension from a filename or path',
    example: 'image.png → png',
    category: 'Code & Dev',
  },
  {
    name: 'Environment Variable Name',
    pattern: '^[A-Z][A-Z0-9_]*$',
    description: 'Matches POSIX-style environment variable names',
    example: 'DATABASE_URL',
    category: 'Code & Dev',
  },
  {
    name: 'SQL Identifier',
    pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
    description: 'Matches valid SQL table and column names',
    example: 'user_id',
    category: 'Code & Dev',
  },
  {
    name: 'CSS Class Selector',
    pattern: '\\.[a-zA-Z][a-zA-Z0-9-_]*',
    flags: 'g',
    description: 'Extracts CSS class selectors from a stylesheet',
    example: '.my-button',
    category: 'Code & Dev',
  },
  {
    name: 'CSS ID Selector',
    pattern: '#[a-zA-Z][a-zA-Z0-9-_]*',
    flags: 'g',
    description: 'Extracts CSS ID selectors from a stylesheet',
    example: '#main-content',
    category: 'Code & Dev',
  },
  {
    name: 'Camel to Snake Case',
    pattern: '([a-z])([A-Z])',
    flags: 'g',
    description: 'Finds camelCase boundaries. Replace with $1_$2 and lowercase.',
    example: 'camelCaseString → camel_case_string',
    category: 'Code & Dev',
  },
  // Security
  {
    name: 'JWT Token',
    pattern: '^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$',
    description: 'Matches a 3-part Base64URL-encoded JWT',
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.abc123',
    category: 'Security',
  },
  {
    name: 'Base64 String',
    pattern: '^[A-Za-z0-9+\\/]+=*$',
    description: 'Matches a standard Base64-encoded string',
    example: 'SGVsbG8gV29ybGQ=',
    category: 'Security',
  },
  {
    name: 'MAC Address',
    pattern: '^([0-9A-Fa-f]{2}[:\\-]){5}([0-9A-Fa-f]{2})$',
    description: 'Matches colon- or hyphen-separated MAC addresses',
    example: 'AA:BB:CC:DD:EE:FF',
    category: 'Security',
  },
  {
    name: 'CIDR Block',
    pattern: '^(\\d{1,3}\\.){3}\\d{1,3}\\/([0-9]|[1-2]\\d|3[0-2])$',
    description: 'Matches IPv4 CIDR notation',
    example: '192.168.0.0/24',
    category: 'Security',
  },
  {
    name: 'AWS Access Key ID',
    pattern: '\\bAKIA[0-9A-Z]{16}\\b',
    description: 'Detects leaked AWS Access Key IDs in text or code',
    example: 'AKIAIOSFODNN7EXAMPLE',
    category: 'Security',
  },
  {
    name: 'PEM Header',
    pattern: '-----BEGIN [\\w ]+-----',
    description: 'Matches PEM-encoded certificate or key headers',
    example: '-----BEGIN CERTIFICATE-----',
    category: 'Security',
  },
];

const CATEGORIES = ['All', 'Validation', 'Extraction', 'Text Processing', 'Code & Dev', 'Security'];

export default function RegexLibrary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const router = useRouter();

  const filtered = REGEX_PATTERNS.filter((entry) => {
    const matchesCategory = activeCategory === 'All' || entry.category === activeCategory;
    if (!matchesCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      entry.name.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.pattern.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q)
    );
  });

  const handleTest = (entry: RegexEntry) => {
    sessionStorage.setItem(
      'regexLibraryPattern',
      JSON.stringify({ pattern: entry.pattern, flags: entry.flags ?? 'g', testString: entry.example })
    );
    router.push('/tools/regex-tester');
  };

  return (
    <ToolLayout
      title="Regex Library"
      description="Browse and copy common regular expressions for validation, extraction, and text processing"
      fullWidth
    >
      <div className="space-y-5">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-blue-200' : 'text-slate-400'}`}>
                  {REGEX_PATTERNS.filter((e) => e.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500">
          {filtered.length} pattern{filtered.length !== 1 ? 's' : ''}
          {search && ` for "${search}"`}
        </p>

        {/* Pattern grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No patterns match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((entry) => (
              <div
                key={`${entry.category}-${entry.name}`}
                className="border border-slate-200 rounded-lg p-4 flex flex-col gap-3 bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{entry.name}</h3>
                    <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {entry.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{entry.description}</p>

                {/* Pattern display */}
                <div className="bg-white border border-slate-200 rounded-md px-3 py-2 font-mono text-xs text-slate-800 break-all">
                  <span className="text-slate-400 select-none">/</span>
                  {entry.pattern}
                  <span className="text-slate-400 select-none">/{entry.flags ?? ''}</span>
                </div>

                {/* Example */}
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Example:</span>{' '}
                  <span className="font-mono">{entry.example}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                  <CopyButton
                    text={entry.pattern}
                    label="Copy Pattern"
                  />
                  <button
                    onClick={() => handleTest(entry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Test in Tester →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
