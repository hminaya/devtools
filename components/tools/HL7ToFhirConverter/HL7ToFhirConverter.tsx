'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { HL7_SAMPLES } from '../../../utils/hl7';
import { convertHl7ToFhir } from '../../../utils/hl7ToFhir';
import type { Hl7ToFhirResult } from '../../../utils/hl7ToFhir';

const RESOURCE_COLORS: Record<string, string> = {
  Patient: 'bg-blue-100 text-blue-800',
  Encounter: 'bg-green-100 text-green-800',
  DiagnosticReport: 'bg-purple-100 text-purple-800',
  Observation: 'bg-amber-100 text-amber-800',
  ServiceRequest: 'bg-cyan-100 text-cyan-800',
  Immunization: 'bg-rose-100 text-rose-800',
  Appointment: 'bg-indigo-100 text-indigo-800',
};

function HL7ToFhirConverter() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Hl7ToFhirResult | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState(HL7_SAMPLES[0]?.id || '');
  const selectedSample = HL7_SAMPLES.find((s) => s.id === selectedSampleId) || HL7_SAMPLES[0];

  const bundleJson = result?.bundle ? JSON.stringify(result.bundle, null, 2) : '';

  const convert = () => {
    const res = convertHl7ToFhir(input);
    setResult(res);
  };

  const clear = () => {
    setInput('');
    setResult(null);
  };

  const loadSample = () => {
    if (!selectedSample) return;
    setInput(selectedSample.message);
    setResult(null);
  };

  const resourceTypeCounts = result?.resourceSummary
    ? result.resourceSummary.reduce<Record<string, number>>((acc, r) => {
        acc[r.resourceType] = (acc[r.resourceType] || 0) + 1;
        return acc;
      }, {})
    : null;

  const uniqueResourceTypes = resourceTypeCounts ? Object.keys(resourceTypeCounts) : [];

  return (
    <ToolLayout
      title="HL7 to FHIR Converter"
      description="Convert HL7 v2 messages to FHIR R4 Bundles"
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button label="Convert" onClick={convert} variant="primary" disabled={!input.trim()} />
          <select
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

        {result && !result.success && result.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{result.error}</p>
          </div>
        )}

        {result?.warnings && result.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 font-medium mb-1">Warnings:</p>
            <ul className="list-disc pl-5 text-amber-700 text-sm space-y-1">
              {result.warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {result?.success && result.bundle && (
          <>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Message Type</p>
                  <p className="font-mono text-slate-900">
                    {result.bundle.entry[0]?.resource?.resourceType === 'Patient'
                      ? (() => {
                          const mshEntry = input.trim().split(/\r?\n/)[0] || '';
                          const parts = mshEntry.split('|');
                          return parts[8] || '-';
                        })()
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Resources Generated</p>
                  <p className="font-mono text-slate-900">{result.bundle.entry.length}</p>
                </div>
                <div>
                  <p className="text-slate-500">Resource Types</p>
                  <p className="font-mono text-slate-900">{uniqueResourceTypes.length}</p>
                </div>
                <div>
                  <p className="text-slate-500">Bundle Type</p>
                  <p className="font-mono text-slate-900">{result.bundle.type}</p>
                </div>
              </div>
            </div>

            {result.resourceSummary && result.resourceSummary.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Resources</p>
                <div className="flex flex-wrap gap-2">
                  {result.resourceSummary.map((r) => (
                    <span
                      key={r.id}
                      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${RESOURCE_COLORS[r.resourceType] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {r.resourceType}: {r.description}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <TextArea
          value={input}
          onChange={setInput}
          label="Input HL7 Message"
          placeholder="Paste your HL7 v2 message here..."
          rows={14}
        />

        {result?.success && bundleJson ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CopyButton text={bundleJson} label="Copy FHIR Bundle" />
            </div>
            <CodeDisplay
              code={bundleJson}
              language="json"
              label="FHIR R4 Bundle"
            />
          </div>
        ) : (
          !result && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">FHIR R4 Bundle Output</label>
              <div className="border border-slate-300 rounded-md bg-slate-50 h-[420px] flex items-center justify-center">
                <p className="text-slate-400 text-sm">FHIR R4 Bundle JSON will appear here</p>
              </div>
            </div>
          )
        )}
      </div>
    </ToolLayout>
  );
}

export default HL7ToFhirConverter;
