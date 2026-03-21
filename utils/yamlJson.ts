import yaml from 'js-yaml';

export type InputFormat = 'yaml' | 'json' | 'unknown';
export type Indent = 2 | 4;

export function detectFormat(input: string): InputFormat {
  const trimmed = input.trim();
  if (!trimmed) return 'unknown';

  // If it starts with { or [, try JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // fall through to YAML attempt
    }
  }

  // Try YAML
  try {
    const result = yaml.load(trimmed);
    // yaml.load returns a primitive for simple strings, so require an object/array
    if (result !== null && result !== undefined && typeof result === 'object') {
      return 'yaml';
    }
  } catch {
    // not valid yaml
  }

  // Try JSON as fallback
  try {
    JSON.parse(trimmed);
    return 'json';
  } catch {
    // not json either
  }

  return 'unknown';
}

export interface ConvertResult {
  output: string;
  detectedFormat: InputFormat;
  outputFormat: 'yaml' | 'json';
  error?: string;
}

export function convert(
  input: string,
  manualFormat: 'auto' | 'yaml' | 'json',
  indent: Indent
): ConvertResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { output: '', detectedFormat: 'unknown', outputFormat: 'json' };
  }

  const detectedFormat = manualFormat === 'auto' ? detectFormat(trimmed) : manualFormat;

  if (detectedFormat === 'unknown') {
    return {
      output: '',
      detectedFormat: 'unknown',
      outputFormat: 'json',
      error: 'Could not detect format. Make sure input is valid JSON or YAML.',
    };
  }

  if (detectedFormat === 'json') {
    try {
      const parsed = JSON.parse(trimmed);
      const output = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
      return { output: output.trimEnd(), detectedFormat: 'json', outputFormat: 'yaml' };
    } catch (e) {
      return {
        output: '',
        detectedFormat: 'json',
        outputFormat: 'yaml',
        error: `JSON parse error: ${(e as Error).message}`,
      };
    }
  }

  // YAML → JSON
  try {
    const parsed = yaml.load(trimmed);
    const output = JSON.stringify(parsed, null, indent);
    return { output, detectedFormat: 'yaml', outputFormat: 'json' };
  } catch (e) {
    return {
      output: '',
      detectedFormat: 'yaml',
      outputFormat: 'json',
      error: `YAML parse error: ${(e as Error).message}`,
    };
  }
}

export const SAMPLES: { label: string; format: 'yaml' | 'json'; value: string }[] = [
  {
    label: 'Docker Compose (YAML)',
    format: 'yaml',
    value: `version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    environment:
      NODE_ENV: production
      PORT: "3000"
    volumes:
      - ./dist:/usr/share/nginx/html
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret`,
  },
  {
    label: 'API Response (JSON)',
    format: 'json',
    value: JSON.stringify({
      user: {
        id: 42,
        name: 'Jane Doe',
        email: 'jane@example.com',
        roles: ['admin', 'editor'],
        settings: {
          theme: 'dark',
          notifications: true,
          timezone: 'America/New_York',
        },
      },
      pagination: { page: 1, perPage: 20, total: 143 },
    }, null, 2),
  },
];
