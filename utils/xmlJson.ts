/**
 * XML ↔ JSON converter.
 *
 * Supports two-way conversion using the DOMParser available in the browser:
 *   - xmlToJson: parses XML, produces a JSON tree that uses:
 *     - one object per element with the tag name as the key
 *     - text content stored under the reserved "_text" key
 *     - attributes prefixed with "@" (e.g., "@id") — common XmlToJson convention
 *     - repeated child tags collapsed into a single-key array
 *   - jsonToXml: reverses the above, restoring attributes, text, and arrays.
 *
 * Output format intentionally mirrors the popular "fast-xml-parser" / "xml-js"
 * convention so it's familiar to developers who already know one of those libs.
 */

const TEXT_KEY = '_text';
const ATTR_PREFIX = '@';
const DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

export type XmlNode = string | number | boolean | null | { [k: string]: XmlNode | XmlNode[] };

export interface XmlToJsonResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

export function xmlToJson(xmlString: string): XmlToJsonResult {
  try {
    if (!xmlString.trim()) return { success: false, error: 'Empty input' };
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) return { success: false, error: parseError.textContent || 'Invalid XML' };
    if (!doc.documentElement) return { success: false, error: 'No root element' };

    const output: Record<string, unknown> = {};
    output[doc.documentElement.tagName] = elementToObject(doc.documentElement);
    return { success: true, output };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to parse XML' };
  }
}

function elementToObject(el: Element): unknown {
  // If only text content and no children, collapse to a primitive string.
  const children = Array.from(el.children);
  if (children.length === 0) {
    const text = (el.textContent ?? '').trim();
    const obj: Record<string, string> = {};
    if (text) obj[TEXT_KEY] = text;
    // Attributes prefixed with @
    for (let i = 0; i < el.attributes.length; i++) {
      const a = el.attributes[i]!;
      obj[ATTR_PREFIX + a.name] = a.value;
    }
    if (Object.keys(obj).length === 0) return '';
    if (Object.keys(obj).length === 1 && obj[TEXT_KEY] !== undefined) return obj[TEXT_KEY]!;
    return obj;
  }

  const obj: Record<string, unknown> = {};

  // Attributes
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i]!;
    obj[ATTR_PREFIX + a.name] = a.value;
  }

  // Text content (combined adjacent text nodes) — collect aside from element children
  let wholeText = '';
  for (let i = 0; i < el.childNodes.length; i++) {
    const node = el.childNodes[i]!;
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent?.trim() ?? '';
      if (t) wholeText += (wholeText ? ' ' : '') + t;
    }
  }
  if (wholeText) obj[TEXT_KEY] = wholeText;

  // Children — repeated tags become arrays
  const counts: Record<string, number> = {};
  for (const child of children) counts[child.tagName] = (counts[child.tagName] ?? 0) + 1;
  const seenOnce = new Set<string>();
  for (const child of children) {
    const tag = child.tagName;
    const value = elementToObject(child);
    if ((counts[tag] ?? 0) > 1) {
      if (!seenOnce.has(tag)) {
        obj[tag] = [];
        seenOnce.add(tag);
      }
      (obj[tag] as unknown[]).push(value);
    } else {
      obj[tag] = value;
    }
  }

  return obj;
}

export interface JsonToXmlResult {
  success: boolean;
  output?: string;
  error?: string;
}

export function jsonToXml(jsonString: string): JsonToXmlResult {
  try {
    if (!jsonString.trim()) return { success: false, error: 'Empty input' };
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      return { success: false, error: 'JSON parse error: ' + (e instanceof Error ? e.message : String(e)) };
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { success: false, error: 'Input must be a JSON object with one root element' };
    }

    const rootObj = parsed as Record<string, unknown>;
    const rootTag = Object.keys(rootObj)[0];
    if (!rootTag) return { success: false, error: 'No root element found' };

    let output = DECLARATION + '\n';
    output += renderElement(rootTag, rootObj[rootTag]);
    return { success: true, output };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to convert JSON to XML' };
  }
}

function escapeXmlValue(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderElement(tag: string, value: unknown, indent: number = 0): string {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return `${pad}<${tag}/>\n`;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${pad}<${tag}>${escapeXmlValue(String(value))}</${tag}>\n`;
  }

  if (Array.isArray(value)) {
    return value.map((v) => renderElement(tag, v, indent)).join('');
  }

  // Object: separate attrs, text, and children
  const obj = value as Record<string, unknown>;
  const attrs: string[] = [];
  const children: { tag: string; value: unknown }[] = [];
  let text: string | null = null;

  for (const [k, v] of Object.entries(obj)) {
    if (k === TEXT_KEY) {
      text = typeof v === 'string' ? v : String(v);
    } else if (k.startsWith(ATTR_PREFIX)) {
      attrs.push(`${k.slice(1)}="${escapeXmlValue(String(v))}"`);
    } else {
      children.push({ tag: k, value: v });
    }
  }

  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
  if (children.length === 0) {
    if (text === null) return `${pad}<${tag}${attrStr}/>\n`;
    return `${pad}<${tag}${attrStr}>${escapeXmlValue(text)}</${tag}>\n`;
  }

  let out = `${pad}<${tag}${attrStr}>\n`;
  if (text !== null) out += `${pad}  ${escapeXmlValue(text)}\n`;
  for (const child of children) out += renderElement(child.tag, child.value, indent + 1);
  out += `${pad}</${tag}>\n`;
  return out;
}