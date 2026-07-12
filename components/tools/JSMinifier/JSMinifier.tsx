'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import { minifyJs } from '../../../utils/jsMinifier';

function JSMinifier() {
  const [input, setInput] = useState(
    '// Greet the user\nfunction sayHello(name) {\n  const greeting = "Hello, " + name;\n  /* log it */\n  console.log(greeting + "!");\n  return true;\n}\n\nsayHello("World");'
  );

  const result = useMemo(() => minifyJs(input), [input]);
  const savedChars = input.length - (result.output?.length ?? 0);
  const savedPct = input.length > 0 ? Math.round((savedChars / input.length) * 100) : 0;

  return (
    <ToolLayout
      title="JavaScript Minifier"
      description="Strip comments and whitespace from JavaScript while preserving string literals, template literals, and regex syntax — no AST, no variable renaming, just fast cosmetic minification"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 text-xs">
          {result.ok && (
            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
              Saved {savedChars} chars ({savedPct}%)
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-slate-100">
            Input: {input.length} chars
          </span>
          {result.ok && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100">
              Output: {result.output?.length} chars
            </span>
          )}
        </div>

        <TextArea
          value={input}
          onChange={setInput}
          label="Input JavaScript"
          placeholder="Paste JavaScript to minify"
          rows={10}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Minified output</label>
            {result.ok && result.output && <CopyButton text={result.output} label="Copy" />}
          </div>
          {result.error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{result.error}</div>
          ) : (
            <CodeDisplay code={result.output ?? ''} language="javascript" />
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
          <strong>Note:</strong> This is a regex-based minifier — it strips comments and whitespace but does <em>not</em>
          rename variables, eliminate dead code, or do any AST traversal. For production minification use{' '}
          <code>esbuild --minify</code> or <code>terser</code>. Useful for quick dev-time compressing of doc-snippets
          and inline scripts.
        </div>
      </div>
    </ToolLayout>
  );
}

export default JSMinifier;