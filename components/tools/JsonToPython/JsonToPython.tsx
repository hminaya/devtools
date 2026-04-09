'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { convertJsonToPython, type PythonStyle } from '../../../utils/jsonToPython';

function JsonToPython() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [output, setOutput] = useState('');
  const [example, setExample] = useState('');
  const [error, setError] = useState('');
  const [rootName, setRootName] = useState('Root');
  const [style, setStyle] = useState<PythonStyle>('dataclass');
  const [showMultipleInputs, setShowMultipleInputs] = useState(false);

  useEffect(() => {
    const jsonInput = sessionStorage.getItem('jsonInput');
    if (jsonInput) {
      setInput1(jsonInput);
      setRootName('ApiResponse');
      const result = convertJsonToPython([jsonInput], {
        rootClassName: 'ApiResponse',
        style,
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

    const result = convertJsonToPython(inputs, {
      rootClassName: rootName || 'Root',
      style,
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
      is_active: true,
      tags: ['developer', 'python'],
      address: {
        street: '123 Main St',
        city: 'New York',
        zip_code: '10001',
      },
    });

    const sample2 = showMultipleInputs ? JSON.stringify({
      id: 2,
      name: 'Jane Smith',
      age: 25,
      is_active: false,
      tags: ['designer'],
      address: {
        street: '456 Oak Ave',
        city: 'Boston',
        zip_code: '02101',
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
      title="JSON to Python"
      description="Convert JSON objects to Python dataclasses or Pydantic models with optional field detection"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex gap-3 items-center flex-wrap">
          <Button label="Convert to Python" onClick={convert} variant="primary" />
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
              <span className="text-sm text-slate-700">Multiple JSON samples (detect optional fields)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Class Name:</label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="Root"
              className="w-48 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Style:</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as PythonStyle)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dataclass">dataclass</option>
              <option value="pydantic">Pydantic BaseModel</option>
            </select>
          </div>
        </div>

        {showMultipleInputs && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Provide multiple JSON samples to detect optional fields. Fields that don&apos;t appear in all samples will be marked as <code>Optional</code> with default <code>None</code> values.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
                  language="python"
                  label={style === 'dataclass' ? 'Python Dataclasses' : 'Pydantic Models'}
                />
                <CopyButton text={output} label="Copy Python" />
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  {style === 'dataclass' ? 'Python Dataclasses' : 'Pydantic Models'}
                </label>
                <div className="border border-slate-300 rounded-md bg-slate-50 p-4 text-center text-slate-400" style={{ minHeight: showMultipleInputs ? '640px' : '448px' }}>
                  Output will appear here
                </div>
              </div>
            )}
          </div>
        </div>

        {example && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">Usage Example</label>
              <CopyButton text={example} label="Copy Example" />
            </div>
            <CodeDisplay code={example} language="python" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default JsonToPython;
