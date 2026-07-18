'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CopyButton from '../../shared/CopyButton';
import { renderMarkdown } from '../../../utils/markdown';

const SAMPLE = `# Hello, World!

This is **bold** and *italic* and \`inline code\`.

## Subsection

- Item 1
- Item 2 with ~~strikethrough~~
- Item 3

1. First
2. Second

> Block quote
> Second line of quote

---

[Link to Google](https://google.com)

<https://example.com>

\`\`\`js
function f() {
  return 42;
}
\`\`\`
`;

function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE);

  const html = useMemo(() => renderMarkdown(input), [input]);

  return (
    <ToolLayout
      title="Markdown Live Preview"
      description="Write Markdown on the left, see the rendered HTML preview on the right — supports headings, bold, italic, code, lists, quotes, links, autolinks, horizontal rules, and code fences"
      fullWidth
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Markdown"
            placeholder="Type Markdown here..."
            rows={24}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Preview</label>
              <CopyButton text={html} label="Copy HTML" />
            </div>
            <div aria-live="polite" className="prose prose-slate max-w-none rounded-xl border border-slate-300 bg-white p-6 overflow-y-auto min-h-[400px] max-h-[640px]">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
            <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                Show raw HTML
              </summary>
              <pre className="mt-2 font-mono text-xs text-slate-900 whitespace-pre-wrap break-words">{html}</pre>
            </details>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Supports a focused subset of CommonMark plus GFM strikethrough. Inline HTML is escaped,
          so it renders as text rather than as live HTML — safe in browser-based preview.
        </p>
      </div>
    </ToolLayout>
  );
}

export default MarkdownPreview;