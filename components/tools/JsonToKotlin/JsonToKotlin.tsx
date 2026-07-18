'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { convertJsonToKotlin } from '../../../utils/jsonToKotlin';

function JsonToKotlin() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [output, setOutput] = useState('');
  const [example, setExample] = useState('');
  const [error, setError] = useState('');
  const [rootName, setRootName] = useState('Root');
  const [showMultipleInputs, setShowMultipleInputs] = useState(false);

  useEffect(() => {
    const jsonInput = sessionStorage.getItem('jsonInput');
    if (jsonInput) {
      setInput1(jsonInput);
      setRootName('ApiResponse');
      const result = convertJsonToKotlin([jsonInput], {
        rootClassName: 'ApiResponse',
      });
      if (result.success && result.output) {
        setOutput(result.output);
        setExample(result.example || '');
        setError('');
      } else {
        setError(result.error || 'Failed to convert JSON');
      }
      sessionStorage.removeItem('jsonInput');
    }
  }, []);

  const convert = () => {
    const inputs = [input1, input2, input3].filter(i => i.trim());

    const result = convertJsonToKotlin(inputs, {
      rootClassName: rootName || 'Root',
    });

    if (result.success && result.output) {
      setOutput(result.output);
      setExample(result.example || '');
      setError('');
    } else {
      setError(result.error || 'Failed to convert JSON');
      setOutput('');
      setExample('');
    }
  };

  const clear = () => {
    setInput1('');
    setInput2('');
    setInput3('');
    setOutput('');
    setExample('');
    setError('');
    setRootName('Root');
  };

  const generateSample = () => {
    const sample1 = JSON.stringify({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      tags: ['developer', 'kotlin'],
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
      },
    });

    const sample2 = showMultipleInputs ? JSON.stringify({
      id: 2,
      name: 'Jane Smith',
      age: 25,
      isActive: false,
      tags: ['designer'],
      address: {
        street: '456 Oak Ave',
        city: 'Boston',
        zipCode: '02101',
        country: 'USA',
      },
    }) : '';

    setInput1(sample1);
    setInput2(sample2);
    setInput3('');
    setOutput('');
    setError('');
  };

  return (
    <ToolLayout
      title="JSON to Kotlin"
      description="Convert JSON objects to Kotlin data classes with nullable field detection"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex gap-3 items-center flex-wrap">
          <Button label="Convert to Kotlin" onClick={convert} variant="primary" />
          <Button label="Generate Sample" onClick={generateSample} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />

          <div className="flex items-center gap-2 ml-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMultipleInputs}
                onChange={(e) => setShowMultipleInputs(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Multiple JSON samples (detect nullable fields)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-slate-700">
            Data Class Name:
          </label>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            placeholder="Root"
            aria-label="Data Class Name"
            className="w-48 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showMultipleInputs && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Provide multiple JSON samples to detect nullable fields. Fields that don't appear in all samples will be marked as nullable with default null values.
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <TextArea
              value={input1}
              onChange={setInput1}
              label="JSON Input 1"
              placeholder='{"name": "John", "age": 30}'
              rows={showMultipleInputs ? 12 : 28}
            />

            {showMultipleInputs && (
              <>
                <TextArea
                  value={input2}
                  onChange={setInput2}
                  label="JSON Input 2 (Optional)"
                  placeholder='{"name": "Jane"}'
                  rows={12}
                />
                <TextArea
                  value={input3}
                  onChange={setInput3}
                  label="JSON Input 3 (Optional)"
                  placeholder='{"name": "Bob", "age": 25}'
                  rows={12}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            {output ? (
              <>
                <CodeDisplay
                  code={output}
                  language="kotlin"
                  label="Kotlin Data Classes"
                />
                <CopyButton text={output} label="Copy Kotlin" />
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Kotlin Data Classes</label>
                <div className="border border-slate-300 rounded-md bg-slate-50 p-4 text-center text-slate-400" style={{ minHeight: showMultipleInputs ? '640px' : '448px' }}>
                  Output will appear here
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Example */}
        {example && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">Usage Example</label>
              <CopyButton text={example} label="Copy Example" />
            </div>
            <CodeDisplay code={example} language="kotlin" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default JsonToKotlin;
