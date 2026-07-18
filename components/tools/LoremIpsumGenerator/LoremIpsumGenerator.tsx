'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { generateLoremIpsum, type LengthUnit } from '../../../utils/loremIpsum';

function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<LengthUnit>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');

  const generate = () => {
    const text = generateLoremIpsum({ count, unit, startWithLorem });
    setOutput(text);
  };

  const clear = () => {
    setOutput('');
  };

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for your designs and mockups"
    >
      <div className="space-y-6">
        {/* Controls Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Count Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Length
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                aria-label="Length"
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Unit Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unit
              </label>
              <select
                value={unit}
                aria-label="Unit"
                onChange={(e) => setUnit(e.target.value as LengthUnit)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>

            {/* Start with Lorem Checkbox */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Start with "Lorem ipsum"</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button label="Generate" onClick={generate} variant="primary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Generated Text</label>
            {output && <CopyButton text={output} label="Copy Text" />}
          </div>
          <TextArea
            value={output}
            onChange={() => {}}
            label="Generated text"
            placeholder="Click 'Generate' to create Lorem Ipsum text..."
            rows={20}
            readOnly
          />
        </div>

        {/* Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-slate-700 text-sm">
            <strong>Tip:</strong> Lorem ipsum text is commonly used as placeholder text in design
            and publishing to demonstrate the visual form of a document without relying on
            meaningful content.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}

export default LoremIpsumGenerator;
