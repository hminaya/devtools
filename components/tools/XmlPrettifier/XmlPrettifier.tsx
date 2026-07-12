'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { prettifyXml, minifyXml, prettifyHtml, minifyHtml } from '../../../utils/xml';

type Format = 'xml' | 'html';

function XmlPrettifier() {
  const [format, setFormat] = useState<Format>('xml');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const prettify = () => {
    const result = format === 'xml' ? prettifyXml(input) : prettifyHtml(input);

    if (result.success && result.output) {
      setOutput(result.output);
      setError('');
    } else {
      setError(result.error || `Failed to prettify ${format.toUpperCase()}`);
      setOutput('');
    }
  };

  const minify = () => {
    const result = format === 'xml' ? minifyXml(input) : minifyHtml(input);

    if (result.success && result.output) {
      setOutput(result.output);
      setError('');
    } else {
      setError(result.error || `Failed to minify ${format.toUpperCase()}`);
      setOutput('');
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const generateSample = () => {
    if (format === 'xml') {
      const sample = `<root><person id="1"><name>John Doe</name><age>30</age><email>john@example.com</email><address><street>123 Main St</street><city>New York</city><zipCode>10001</zipCode></address></person></root>`;
      setInput(sample);
    } else {
      const sample = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Sample Page</title></head><body><header><h1>Welcome</h1><nav><a href="/">Home</a><a href="/about">About</a></nav></header><main><p>This is a <strong>sample</strong> HTML page with<br>line breaks and <img src="logo.png" alt="Logo"> images.</p><ul><li>First</li><li>Second</li><li>Third</li></ul></main><footer>&copy; 2026</footer></body></html>`;
      setInput(sample);
    }
    setOutput('');
    setError('');
  };

  const placeholder = format === 'xml'
    ? '<root><element>paste your XML here</element></root>'
    : '<!DOCTYPE html>\n<html>...paste HTML here...</html>';
  const label = format === 'xml' ? 'Input XML' : 'Input HTML';
  const language = format === 'xml' ? 'xml' : 'html';
  const emptyLabel = `Formatted ${format.toUpperCase()} will appear here`;

  return (
    <ToolLayout
      title="XML/HTML Formatter"
      description="Format, validate, prettify, and minify XML or HTML data"
      fullWidth
    >
      <div className="space-y-4">
        {/* Format Toggle + Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-1">Format:</span>
            {(['xml', 'html'] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => { setFormat(f); setOutput(''); setError(''); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border uppercase transition-colors ${
                  format === f
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button label="Prettify" onClick={prettify} variant="primary" />
            <Button label="Minify" onClick={minify} variant="primary" />
            <Button label="Generate Sample" onClick={generateSample} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Side by Side Input/Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Column */}
          <div className="space-y-2">
            <TextArea
              value={input}
              onChange={setInput}
              label={label}
              placeholder={placeholder}
              rows={30}
            />
          </div>

          {/* Output Column */}
          <div className="space-y-2">
            {output ? (
              <>
                <CodeDisplay
                  code={output}
                  language={language}
                  label="Output"
                />
                <CopyButton text={output} label="Copy Output" />
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Output</label>
                <div className="border border-slate-300 rounded-md bg-slate-50 h-[720px] flex items-center justify-center">
                  <p className="text-slate-400 text-sm">{emptyLabel}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

export default XmlPrettifier;
