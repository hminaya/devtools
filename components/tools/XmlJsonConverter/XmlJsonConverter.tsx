'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import { xmlToJson, jsonToXml } from '../../../utils/xmlJson';

function XmlJsonConverter() {
  const [direction, setDirection] = useState<'xml-to-json' | 'json-to-xml'>('xml-to-json');
  const [input, setInput] = useState(
    '<books>\n  <book id="1" lang="en">\n    <title>XML in 10 minutes</title>\n    <author>John Doe</author>\n    <tags>\n      <tag>xml</tag>\n      <tag>beginner</tag>\n    </tags>\n  </book>\n  <book id="2">\n    <title>JSON for Pros</title>\n    <author>Jane Smith</author>\n  </book>\n</books>'
  );

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (direction === 'xml-to-json') {
      const r = xmlToJson(input);
      return r.success && r.output !== undefined
        ? { ok: true, output: JSON.stringify(r.output, null, 2), error: null }
        : { ok: false, output: null, error: r.error ?? 'Failed' };
    } else {
      const r = jsonToXml(input);
      return r.success && r.output
        ? { ok: true, output: r.output, error: null }
        : { ok: false, output: null, error: r.error ?? 'Failed' };
    }
  }, [direction, input]);

  return (
    <ToolLayout
      title="XML ↔ JSON Converter"
      description="Bi-directional converter between XML and JSON using a familiar convention: @attr for attributes and _text for content; repeated tags collapse to arrays"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setDirection('xml-to-json')}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              direction === 'xml-to-json'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            XML → JSON
          </button>
          <button
            onClick={() => setDirection('json-to-xml')}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              direction === 'json-to-xml'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            JSON → XML
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextArea
            value={input}
            onChange={setInput}
            label={direction === 'xml-to-json' ? 'Input XML' : 'Input JSON'}
            placeholder={direction === 'xml-to-json' ? '<root><child>...</child></root>' : '{\n  "root": {\n    "child": "..."\n  }\n}'}
            rows={20}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                {direction === 'xml-to-json' ? 'Output JSON' : 'Output XML'}
              </label>
              {result?.ok && result.output && <CopyButton text={result.output} label="Copy" />}
            </div>
            {result?.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 text-sm">
                {result.error}
              </div>
            ) : result?.ok && result.output ? (
              <CodeDisplay code={result.output} language={direction === 'xml-to-json' ? 'json' : 'xml'} />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-md p-8 text-center text-slate-400 text-sm">
                {direction === 'xml-to-json' ? 'JSON will appear here' : 'XML will appear here'}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Convention: attributes become <code>@attr</code> keys, text content becomes <code>_text</code>,
          and repeated child tags become arrays. Whitespace-only mixed content between elements is trimmed.
          Round-tripping JSON output back to XML produces equivalent structure.
        </p>
      </div>
    </ToolLayout>
  );
}

export default XmlJsonConverter;