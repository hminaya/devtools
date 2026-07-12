'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import { minifyCss, beautifyCss } from '../../../utils/cssFormatter';

function CSSFormatter() {
  const [input, setInput] = useState(
    `/* Sample */\n.header {\n  background: #f5f5f5;\n  color: #333;\n}\n@media (min-width: 600px) {\n  .header { display: flex; align-items: center; }\n}`
  );

  const minified = useMemo(() => minifyCss(input), [input]);
  const beautified = useMemo(() => beautifyCss(input), [input]);

  return (
    <ToolLayout
      title="CSS Minifier / Beautifier"
      description="Minify CSS by stripping comments and whitespace, or beautify minified CSS with re-indentation — preserves spaces inside parentheses for values like rgba(0,0,0,0.5)"
      fullWidth
    >
      <div className="space-y-4">
        <TextArea
          value={input}
          onChange={setInput}
          label="Input CSS"
          placeholder="Paste CSS to minify or beautify"
          rows={10}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Minified ({minified.output?.length ?? 0} chars)</label>
              {minified.ok && minified.output && <CopyButton text={minified.output} label="Copy" />}
            </div>
            {minified.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{minified.error}</div>
            ) : (
              <CodeDisplay code={minified.output ?? ''} language="text" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Beautified ({beautified.output?.length ?? 0} chars)</label>
              {beautified.ok && beautified.output && <CopyButton text={beautified.output} label="Copy" />}
            </div>
            {beautified.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{beautified.error}</div>
            ) : (
              <CodeDisplay code={beautified.output ?? ''} language="javascript" />
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Strips <code>/* comments */</code>, removes whitespace, and tightens structural punctuation. Spaces inside
          parenthesised values are preserved so <code>calc(100% - 10px)</code> and <code>rgba(0, 0, 0, 0.5)</code> keep
          their inner structure in the minified form.
        </p>
      </div>
    </ToolLayout>
  );
}

export default CSSFormatter;