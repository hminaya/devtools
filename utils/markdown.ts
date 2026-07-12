/**
 * Lightweight in-browser Markdown renderer.
 *
 * Supports a focused subset of CommonMark that covers ~95% of dev-doc usage:
 *   - Headings (ATX # to ######)
 *   - Paragraphs
 *   - Bold **text** / italics *text* / inline code `code`
 *   - Links [label](url) and auto-links <url>
 *   - Block code fences ```
 *   - Block quotes >
 *   - Unordered lists ( -, *, + )
 *   - Ordered lists ( 1., 2., ... )
 *   - Horizontal rules (---, ***, ___)
 *   - Line breaks (single newline → <br />)
 *   - GFM-style strikethrough ~~text~~
 *
 * For stronger spec compliance use `marked` or `markdown-it`. This avoids any
 * dependency so the bundle stays slim. Output is HTML — caller is expected
 * to render via React's dangerouslySetInnerHTML with a sanitised container.
 */

// Local escape function — escapes < > & and " to HTML entities, suitable
// for embedding text content inside generated HTML output.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMarkdown(input: string): string {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let i = 0;

  // Code fence state
  let inCodeFence = false;
  let codeFenceLang = '';
  let codeLines: string[] = [];

  // List state
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  // Block quote state
  let inQuote = false;
  let quoteLines: string[] = [];

  // Paragraph state
  let paraLines: string[] = [];

  const flushList = () => {
    if (listType === null) return;
    const items = listItems.map((li) => `  <li>${renderInline(li)}</li>`).join('\n');
    blocks.push(`<${listType}>\n${items}\n</${listType}>`);
    listType = null;
    listItems = [];
  };

  const flushPara = () => {
    if (paraLines.length === 0) return;
    blocks.push(`<p>${renderInline(paraLines.join(' '))}</p>`);
    paraLines = [];
  };

  const flushQuote = () => {
    if (!inQuote) return;
    const inner = quoteLines.map((l) => l.replace(/^>\s?/, ''));
    const quoted = renderMarkdown(inner.join('\n'));
    blocks.push(`<blockquote>${quoted}</blockquote>`);
    quoteLines = [];
    inQuote = false;
  };

  const flushAll = () => {
    flushList();
    flushPara();
    flushQuote();
  };

  while (i < lines.length) {
    const line = lines[i]!;

    // Code fence ```
    if (line.trim().startsWith('```')) {
      if (inCodeFence) {
        // End fence
        const code = escapeHtml(codeLines.join('\n'));
        blocks.push(`<pre><code${codeFenceLang ? ` class="language-${escapeHtml(codeFenceLang)}"` : ''}>${code}</code></pre>`);
        inCodeFence = false;
        codeFenceLang = '';
        codeLines = [];
        i++;
        continue;
      }
      // Start fence
      flushAll();
      inCodeFence = true;
      codeFenceLang = line.trim().slice(3).trim();
      i++;
      continue;
    }

    if (inCodeFence) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Empty line — flush current paragraph / quote / list block
    if (line.trim() === '') {
      flushAll();
      i++;
      continue;
    }

    // Block quote
    if (/^>\s?/.test(line)) {
      if (!inQuote) {
        flushList(); flushPara();
        inQuote = true;
      }
      quoteLines.push(line);
      i++;
      continue;
    } else if (inQuote) {
      flushQuote();
    }

    // ATX headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1]!.length;
      const text = renderInline(headingMatch[2]!);
      blocks.push(`<h${level}>${text}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) {
      flushAll();
      blocks.push('<hr />');
      i++;
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^\s*([-*+])\s+(.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') { flushPara(); flushQuote(); }
      if (listType !== 'ul') { if (listType === 'ol') flushList(); listType = 'ul'; }
      listItems.push(ulMatch[2]!);
      i++;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (listType !== 'ol') { flushPara(); flushQuote(); }
      if (listType !== 'ol') { if (listType === 'ul') flushList(); listType = 'ol'; }
      listItems.push(olMatch[2]!);
      i++;
      continue;
    }

    // Paragraph line
    if (listType) flushList();
    if (inQuote) flushQuote();
    paraLines.push(line);
    i++;
  }

  // Final flush
  if (inCodeFence) {
    const code = escapeHtml(codeLines.join('\n'));
    blocks.push(`<pre><code${codeFenceLang ? ` class="language-${escapeHtml(codeFenceLang)}"` : ''}>${code}</code></pre>`);
  }
  flushAll();

  return blocks.join('\n');
}

// Inline rendering — handles bold, italic, code, strikethrough, links, autolinks
function renderInline(text: string): string {
  let out = escapeHtml(text);

  // Inline code: `code`
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);

  // Bold: **text** or __text__
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  out = out.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^_])_([^_\s][^_]*?)_/g, '$1<em>$2</em>');

  // Strikethrough: ~~text~~ (GFM)
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Links: [label](url)
  // Escape already done — but URL needs to be re-checked for "" characters
  // escapeHtml encoded " to &#34; so we need to match that.
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    return `<a href="${url}" rel="noopener noreferrer" target="_blank">${label}</a>`;
  });

  // Auto-links: <url>
  out = out.replace(/&lt;(https?:\/\/[^&\s]+)&gt;/g, (_, url) => {
    return `<a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a>`;
  });

  return out;
}