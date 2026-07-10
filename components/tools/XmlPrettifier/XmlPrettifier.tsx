'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { prettifyXml, minifyXml } from '../../../utils/xml';

function XmlPrettifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const prettify = () => {
    const result = prettifyXml(input);

    if (result.success && result.output) {
      setOutput(result.output);
      setError('');
    } else {
      setError(result.error || 'Failed to prettify XML');
      setOutput('');
    }
  };

  const minify = () => {
    const result = minifyXml(input);

    if (result.success && result.output) {
      setOutput(result.output);
      setError('');
    } else {
      setError(result.error || 'Failed to minify XML');
      setOutput('');
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const generateSample = () => {
    const sample = `<root><person id="1"><name>John Doe</name><age>30</age><email>john@example.com</email><address><street>123 Main St</street><city>New York</city><zipCode>10001</zipCode></address></person></root>`;
    setInput(sample);
    setOutput('');
    setError('');
  };

  return (
    <ToolLayout
      title="XML Prettifier"
      description="Format, validate, and minify XML data"
      fullWidth
    >
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button label="Prettify" onClick={prettify} variant="primary" />
          <Button label="Minify" onClick={minify} variant="primary" />
          <Button label="Generate Sample" onClick={generateSample} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />
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
              label="Input XML"
              placeholder="<root><element>paste your XML here</element></root>"
              rows={30}
            />
          </div>

          {/* Output Column */}
          <div className="space-y-2">
            {output ? (
              <>
                <CodeDisplay
                  code={output}
                  language="xml"
                  label="Output"
                />
                <CopyButton text={output} label="Copy Output" />
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Output</label>
                <div className="border border-slate-300 rounded-md bg-slate-50 h-[720px] flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Formatted XML will appear here</p>
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
