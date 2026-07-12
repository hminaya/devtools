/**
 * TOML parsing and serialization utilities.
 * Wraps the `smol-toml` library so the rest of the app doesn't bind directly
 * to the package; provides a stable interface for parsing, formatting, and
 * round-tripping to/from JSON for tool use.
 */
import { parse as tomlParse, stringify as tomlStringify } from 'smol-toml';

export interface TomlParseResult {
  ok: boolean;
  output?: unknown; // parsed JS value
  error?: string;
}

/**
 * Parse TOML into a JS object. Returns a structured result so the UI can
 * surface friendly errors without try/catch.
 */
export function parseToml(input: string): TomlParseResult {
  if (!input.trim()) return { ok: false, error: 'Empty input' };
  try {
    return { ok: true, output: tomlParse(input) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to parse TOML' };
  }
}

/**
 * Serialize a JS object to TOML. Accepts objects and arrays of objects.
 */
export function toToml(value: unknown): TomlParseResult {
  try {
    return { ok: true, output: tomlStringify(value as Record<string, unknown>) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to serialize TOML' };
  }
}

/**
 * Convert JSON to TOML. Parses the JSON first, then stringifies to TOML.
 */
export function jsonToToml(jsonString: string): TomlParseResult & { output?: string } {
  if (!jsonString.trim()) return { ok: false, error: 'Empty input' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { ok: false, error: 'JSON parse error: ' + (e instanceof Error ? e.message : String(e)) };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'TOML root must be a table (object). JSON arrays or primitives are not directly representable.' };
  }
  const r = toToml(parsed);
  return { ...r, output: r.ok ? (r.output as string) : undefined };
}

/**
 * Convert TOML to JSON. Parses TOML, then JSON-stringifies with optional indent.
 */
export function tomlToJson(tomlString: string, indent: number = 2): TomlParseResult & { output?: string } {
  const r = parseToml(tomlString);
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, output: JSON.stringify(r.output, null, indent) };
}

/**
 * Quick syntax validation — returns true/false with an optional error message.
 */
export function validateToml(input: string): { valid: boolean; error?: string } {
  const r = parseToml(input);
  return r.ok ? { valid: true } : { valid: false, error: r.error };
}

/**
 * Re-format (beautify) TOML by parsing and re-serializing.
 */
export function formatToml(input: string): TomlParseResult & { output?: string } {
  const r = parseToml(input);
  if (!r.ok) return { ok: false, error: r.error, output: undefined };
  const out = toToml(r.output);
  return { ok: out.ok, error: out.error, output: out.ok ? (out.output as string) : undefined };
}