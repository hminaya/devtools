'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import Button from '../../shared/Button';
import { formatGraphQL, validateGraphQL } from '../../../utils/graphqlFormatter';

function GraphQLFormatter() {
  const [input, setInput] = useState(
    'query GetUser($id: ID!) { user(id: $id) { id name email posts { title createdAt } } }'
  );

  const validation = useMemo(() => validateGraphQL(input), [input]);
  const formatted = useMemo(() => formatGraphQL(input), [input]);

  return (
    <ToolLayout
      title="GraphQL Formatter"
      description="Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals and handles args, blocks, lists, comments, and descriptions"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button label="Format" onClick={() => {
            if (formatted.ok && formatted.output) setInput(formatted.output);
          }} variant="primary" />
          <div className="flex-1" />
          {validation.valid ? (
            <span role="status" className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              ✓ Valid
            </span>
          ) : (
            <span role="status" className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
              ✗ {validation.error}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Input"
            placeholder="Paste GraphQL query, mutation, or fragment"
            rows={20}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Formatted</label>
              {formatted.ok && formatted.output && <CopyButton text={formatted.output} label="Copy" />}
            </div>
            {formatted.error ? (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
                {formatted.error}
              </div>
            ) : formatted.ok && formatted.output ? (
              <CodeDisplay code={formatted.output} language="javascript" />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-md p-8 text-center text-slate-400 text-sm">
                Output will appear here
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
          <strong>Note:</strong> This is a fast formatting pass using a regex-driven walker — not a
          full spec-compliant GraphQL parser. It preserves string literals and structural tokens
          but may not match <code>prettier-plugin-graphql</code> output for every stylistic edge
          case (e.g. inline vs. multi-line args).
        </div>
      </div>
    </ToolLayout>
  );
}

export default GraphQLFormatter;