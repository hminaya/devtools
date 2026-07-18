'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  parseHl7Message,
  HL7_SAMPLES,
  getSegmentLabel,
  getFieldLabel,
  getComponentLabel,
} from '../../../utils/hl7';
import { trackToolEvent } from '../../../utils/analytics';
import type { ParsedHl7Message, Hl7Field } from '../../../utils/hl7';

function HL7Parser() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedHl7Message | null>(null);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showJson, setShowJson] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(HL7_SAMPLES[0]?.id || '');
  const selectedSample = HL7_SAMPLES.find((sample) => sample.id === selectedSampleId) || HL7_SAMPLES[0];

  const jsonOutput = parsed ? JSON.stringify(parsed, null, 2) : '';

  const parse = () => {
    const result = parseHl7Message(input);

    if (result.success && result.data) {
      trackToolEvent('tool_success', {
        tool_id: 'hl7-parser',
        action: 'Parse HL7 message',
        method: result.data.messageType || 'unknown',
        value: result.data.segments.length,
      });
      setParsed(result.data);
      setError('');
      setWarnings(result.warnings || []);
    } else {
      trackToolEvent('tool_error', {
        tool_id: 'hl7-parser',
        action: 'Parse HL7 message',
        label: result.error || 'Failed to parse HL7 message',
      });
      setParsed(null);
      setError(result.error || 'Failed to parse HL7 message');
      setWarnings([]);
    }
  };

  const clear = () => {
    setInput('');
    setParsed(null);
    setError('');
    setWarnings([]);
    setShowJson(false);
  };

  const loadSample = () => {
    if (!selectedSample) {
      return;
    }

    setInput(selectedSample.message);
    setParsed(null);
    setError('');
    setWarnings([]);
    setShowJson(false);
  };

  const hasComponentDetails = (field: Hl7Field): boolean => {
    return field.repetitions.some(
      (repetition) =>
        repetition.components.length > 1 ||
        repetition.components.some((component) => component.subcomponents.length > 1)
    );
  };

  return (
    <ToolLayout
      title="HL7 Parser"
      description="Read and parse HL7 v2 messages into structured JSON"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button label="Parse" onClick={parse} variant="primary" disabled={!input.trim()} />
          <select
            aria-label="Sample message"
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {HL7_SAMPLES.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.label}
              </option>
            ))}
          </select>
          <Button label="Load Sample" onClick={loadSample} variant="secondary" />
          <Button label="Clear" onClick={clear} variant="secondary" />
        </div>

        {selectedSample && (
          <p className="text-xs text-slate-500">
            Sample: {selectedSample.description}
          </p>
        )}

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {warnings.length > 0 && (
          <div aria-live="polite" className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 font-medium mb-1">Warnings:</p>
            <ul className="list-disc pl-5 text-amber-700 text-sm space-y-1">
              {warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {parsed && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Message Type</p>
                <p className="font-mono text-slate-900">
                  {parsed.messageType || '-'}
                  {parsed.triggerEvent ? `^${parsed.triggerEvent}` : ''}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Version</p>
                <p className="font-mono text-slate-900">{parsed.version || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Control ID</p>
                <p className="font-mono text-slate-900">{parsed.controlId || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Segments</p>
                <p className="font-mono text-slate-900">{parsed.segments.length}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(parsed.segmentCounts).map(([segment, count]) => (
                <span
                  key={segment}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {segment}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            label="Input HL7 Message"
            placeholder="Paste your HL7 v2 message here..."
            rows={18}
          />

          {parsed ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={showJson}
                  onClick={() => setShowJson((prev) => !prev)}
                  className="min-h-10 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-100"
                >
                  {showJson ? 'Show Labeled View' : 'Show JSON'}
                </button>
                <CopyButton text={jsonOutput} label="Copy JSON" />
              </div>

              {showJson ? (
                <CodeDisplay
                  code={jsonOutput}
                  language="json"
                  label="Parsed Output (JSON)"
                />
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Parsed Output (Labeled)</label>
                  {parsed.segments.map((segment) => (
                    <div key={`${segment.name}-${segment.index}`} className="border border-slate-200 rounded-md bg-white">
                      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-900">{segment.name}</span>
                          <span className="text-sm text-slate-600">{getSegmentLabel(segment.name)}</span>
                        </div>
                        <span className="text-xs text-slate-500">Segment #{segment.index}</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {segment.fields
                          .filter((field) => field.value !== '')
                          .map((field) => (
                            <div key={`${segment.name}-${segment.index}-field-${field.position}`} className="p-3 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  {segment.name}-{field.position}
                                </span>
                                <span className="text-sm font-medium text-slate-700">
                                  {getFieldLabel(segment.name, field.position)}
                                </span>
                              </div>

                              <div className="font-mono text-sm text-slate-900 break-all">
                                {field.value}
                              </div>

                              {hasComponentDetails(field) && (
                                <div className="bg-slate-50 border border-slate-200 rounded p-2 space-y-2">
                                  {field.repetitions.map((repetition) => (
                                    <div key={`${segment.name}-${field.position}-rep-${repetition.position}`} className="space-y-1">
                                      {field.repetitions.length > 1 && (
                                        <div className="text-xs font-medium text-slate-600">
                                          Repetition {repetition.position}
                                        </div>
                                      )}
                                      {repetition.components
                                        .filter((component) => component.value !== '')
                                        .map((component) => (
                                          <div key={`${segment.name}-${field.position}-rep-${repetition.position}-comp-${component.position}`} className="text-sm">
                                            <span className="font-mono text-xs text-slate-500 mr-2">
                                              C{component.position}
                                            </span>
                                            <span className="text-slate-600 mr-2">
                                              {getComponentLabel(segment.name, field.position, component.position)}:
                                            </span>
                                            <span className="font-mono text-slate-900 break-all">
                                              {component.value}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Parsed Output</label>
              <div className="border border-slate-300 rounded-md bg-slate-50 h-[420px] flex items-center justify-center">
                <p className="text-slate-400 text-sm">Parsed HL7 JSON will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

export default HL7Parser;
