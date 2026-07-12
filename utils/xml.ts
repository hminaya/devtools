/**
 * XML formatting utilities
 */

function formatXmlNode(node: Node, indent: string = '', indentSize: number = 2): string {
  const indentStr = ' '.repeat(indentSize);
  let result = '';

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (text) {
      result = indent + text + '\n';
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    result = indent + '<' + element.nodeName;

    // Add attributes
    if (element.attributes.length > 0) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]!;
        result += ` ${attr.name}="${attr.value}"`;
      }
    }

    if (element.childNodes.length === 0) {
      result += '/>\n';
    } else {
      result += '>\n';

      // Process children
      for (let i = 0; i < element.childNodes.length; i++) {
        result += formatXmlNode(element.childNodes[i]!, indent + indentStr, indentSize);
      }

      result += indent + '</' + element.nodeName + '>\n';
    }
  } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
    result = indent + '<![CDATA[' + node.textContent + ']]>\n';
  } else if (node.nodeType === Node.COMMENT_NODE) {
    result = indent + '<!--' + node.textContent + '-->\n';
  }

  return result;
}

export function prettifyXml(xmlString: string, indentSize: number = 2): { success: boolean; output?: string; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      return {
        success: false,
        error: parseError.textContent || 'Invalid XML',
      };
    }

    // Add XML declaration if not present
    let result = '';
    if (!xmlString.trim().startsWith('<?xml')) {
      result = '<?xml version="1.0" encoding="UTF-8"?>\n';
    }

    // Format the document
    if (xmlDoc.documentElement) {
      result += formatXmlNode(xmlDoc.documentElement, '', indentSize).trim();
    }

    return {
      success: true,
      output: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse XML',
    };
  }
}

export function minifyXml(xmlString: string): { success: boolean; output?: string; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      return {
        success: false,
        error: parseError.textContent || 'Invalid XML',
      };
    }

    const serializer = new XMLSerializer();
    const minified = serializer.serializeToString(xmlDoc);

    return {
      success: true,
      output: minified,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse XML',
    };
  }
}

/**
 * Prettify HTML using the browser's HTML parser. Unlike XML mode, this
 * correctly handles void elements (<br>, <img>), unquoted attributes,
 * named entities, and other real-HTML quirks.
 */
export function prettifyHtml(htmlString: string, indentSize: number = 2): { success: boolean; output?: string; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // HTML parser never throws parsererror the way the XML parser does,
    // but malformed input produces an empty body. Surface that as an error.
    if (!doc.body || doc.body.childNodes.length === 0 && htmlString.trim().length > 0) {
      const errEl = doc.querySelector('parsererror');
      if (errEl?.textContent) {
        return { success: false, error: errEl.textContent };
      }
    }

    const parts: string[] = [];
    // Optional doctype
    if (htmlString.trim().toLowerCase().startsWith('<!doctype')) {
      const dt = doc.doctype;
      parts.push(
        dt
          ? `<!DOCTYPE ${dt.name}${dt.publicId ? ` PUBLIC "${dt.publicId}"` : ''}${dt.systemId ? ` "${dt.systemId}"` : ''}>`
          : '<!DOCTYPE html>'
      );
    }
    // Walk children of <html> (head, body) — preserves document structure
    for (let i = 0; i < doc.documentElement.childNodes.length; i++) {
      formatHtmlNode(doc.documentElement.childNodes[i]!, '', indentSize, parts);
    }
    const output = parts.join('\n').replace(/\n{2,}/g, '\n').trim();
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse HTML',
    };
  }
}

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function formatHtmlNode(node: Node, indent: string, indentSize: number, out: string[]): void {
  const indentStr = ' '.repeat(indentSize);
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (text) out.push(indent + text);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tagLower = el.tagName.toLowerCase();
    let line = indent + '<' + el.tagName.toLowerCase();
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i]!;
      line += ` ${attr.name}="${attr.value}"`;
    }
    const isVoid = VOID_TAGS.has(tagLower);
    if (isVoid) {
      out.push(line + '>');
      return;
    }
    // Inline short text content on one line (e.g. <title>Hi</title>)
    const children = Array.from(el.childNodes);
    const onlyText = children.length === 1 && children[0]!.nodeType === Node.TEXT_NODE;
    if (onlyText) {
      const text = (children[0]!.textContent || '').trim();
      if (text) {
        out.push(`${line}>${text}</${tagLower}>`);
        return;
      }
    }
    out.push(line + '>');
    for (let i = 0; i < el.childNodes.length; i++) {
      formatHtmlNode(el.childNodes[i]!, indent + indentStr, indentSize, out);
    }
    out.push(indent + '</' + tagLower + '>');
  } else if (node.nodeType === Node.COMMENT_NODE) {
    out.push(indent + '<!--' + node.textContent + '-->');
  }
}

/**
 * Minify HTML by parsing to a DOM and serializing via innerHTML.
 * Strips comments and collapses insignificant whitespace; preserves
 * <pre>/<textarea> whitespace via the browser's serializer.
 */
export function minifyHtml(htmlString: string): { success: boolean; output?: string; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Remove comments
    const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_COMMENT);
    const toRemove: Comment[] = [];
    while (walker.nextNode()) toRemove.push(walker.currentNode as Comment);
    toRemove.forEach((c) => c.parentNode?.removeChild(c));

    // Serialize body for fragment input; full document otherwise
    const hadDoctype = /<!doctype/i.test(htmlString);
    const serializer = new XMLSerializer();
    let minified = serializer.serializeToString(doc.body);

    // Collapse whitespace between tags, preserve inside <pre>/<textarea>
    minified = minified
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (hadDoctype) {
      minified = '<!DOCTYPE html>' + minified;
    }

    return { success: true, output: minified };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse HTML',
    };
  }
}
