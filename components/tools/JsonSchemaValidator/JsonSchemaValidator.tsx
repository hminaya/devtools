'use client';

import { useMemo, useState } from 'react';
import Ajv, { type ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import type { ErrorObject } from 'ajv';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  inferSchema,
  serializeSchema,
  isValidJson,
  type JsonSchemaDraft,
} from '../../../utils/jsonSchema';

type Mode = 'generate' | 'validate';

const SAMPLE_JSON = JSON.stringify(
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    tags: ['developer', 'typescript'],
    address: {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001',
    },
  },
  null,
  2,
);

const SAMPLE_SCHEMA = JSON.stringify(
  {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['id', 'name'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 0 },
      isActive: { type: 'boolean' },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      address: {
        type: 'object',
        required: ['street', 'city'],
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          zipCode: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  null,
  2,
);

function JsonSchemaValidator() {
  const [mode, setMode] = useState<Mode>('generate');
  const [draft, setDraft] = useState<JsonSchemaDraft>('2020-12');

  // Generate state
  const [genInput1, setGenInput1] = useState('');
  const [genInput2, setGenInput2] = useState('');
  const [genInput3, setGenInput3] = useState('');
  const [showMultipleInputs, setShowMultipleInputs] = useState(false);
  const [additionalPropertiesFalse, setAdditionalPropertiesFalse] = useState(false);
  const [rootName, setRootName] = useState('Root');
  const [genOutput, setGenOutput] = useState('');
  const [genError, setGenError] = useState('');

  // Validate state
  const [valJson, setValJson] = useState('');
  const [valSchema, setValSchema] = useState('');
  const [valResult, setValResult] = useState<'valid' | 'invalid' | null>(null);
  const [valErrors, setValErrors] = useState<ErrorObject[]>([]);
  const [valErrorNotes, setValErrorNotes] = useState<string[]>([]);
  const [valParsedCount, setValParsedCount] = useState<number | null>(null);

  const ajv = useMemo(() => {
    try {
      if (draft === '2020-12') {
        return new Ajv2020({ allErrors: true, strict: false });
      }
      return new Ajv({ allErrors: true, strict: false });
    } catch {
      return null;
    }
  }, [draft]);

  const handleGenerate = () => {
    const inputs = [genInput1, genInput2, genInput3].filter((i) => i.trim());
    if (inputs.length === 0) {
      setGenError('Provide at least one JSON sample');
      setGenOutput('');
      return;
    }

    const samples: unknown[] = [];
    for (const text of inputs) {
      const { value, error } = isValidJson(text);
      if (error) {
        setGenError(`Invalid JSON: ${error}`);
        setGenOutput('');
        return;
      }
      samples.push(value);
    }

    const { schema, error } = inferSchema(samples[0], {
      draft,
      rootName: rootName || 'Root',
      additionalProperties: additionalPropertiesFalse ? false : undefined,
      samples: showMultipleInputs ? samples : [samples[0]],
    });

    if (error || !schema) {
      setGenError(error || 'Failed to infer schema');
      setGenOutput('');
      return;
    }

    setGenError('');
    setGenOutput(serializeSchema(schema));
  };

  const handleClearGenerate = () => {
    setGenInput1('');
    setGenInput2('');
    setGenInput3('');
    setGenOutput('');
    setGenError('');
    setRootName('Root');
  };

  const handleLoadSampleGenerate = () => {
    setGenInput1(JSON.stringify(JSON.parse(SAMPLE_JSON), null, 2));
    setGenInput2('');
    setGenInput3('');
    setGenOutput('');
    setGenError('');
  };

  const handleValidate = () => {
    const { value: jsonValue, error: jsonErr } = isValidJson(valJson);
    if (jsonErr) {
      setValResult('invalid');
      setValErrors([]);
      setValErrorNotes([`JSON parse error: ${jsonErr}`]);
      setValParsedCount(null);
      return;
    }

    const { value: schemaValue, error: schemaErr } = isValidJson(valSchema);
    if (schemaErr) {
      setValResult('invalid');
      setValErrors([]);
      setValErrorNotes([`Schema JSON parse error: ${schemaErr}`]);
      setValParsedCount(null);
      return;
    }

    if (!ajv) {
      setValResult('invalid');
      setValErrors([]);
      setValErrorNotes(['Failed to initialize validator for the selected draft']);
      setValParsedCount(null);
      return;
    }

    try {
      const validate = ajv.compile(
        schemaValue as Record<string, unknown>,
      ) as ValidateFunction;
      const ok = validate(jsonValue);
      setValResult(ok ? 'valid' : 'invalid');
      setValErrors(ok ? [] : (validate.errors ?? []) as ErrorObject[]);
      if (ok) setValParsedCount(Array.isArray(jsonValue) ? jsonValue.length : 1);
    } catch (e) {
      setValResult('invalid');
      setValErrors([]);
      setValErrorNotes([`Schema compile error: ${e instanceof Error ? e.message : String(e)}`]);
      setValParsedCount(null);
    }
  };

  const handleClearValidate = () => {
    setValJson('');
    setValSchema('');
    setValResult(null);
    setValErrors([]);
    setValErrorNotes([]);
    setValParsedCount(null);
  };

  const handleLoadSampleValidate = () => {
    setValJson(JSON.stringify(JSON.parse(SAMPLE_JSON), null, 2));
    setValSchema(SAMPLE_SCHEMA);
    setValResult(null);
    setValErrors([]);
    setValErrorNotes([]);
    setValParsedCount(null);
  };

  return (
    <ToolLayout
      title="JSON Schema Validator & Generator"
      description="Generate a JSON Schema from JSON and validate JSON against a schema — supports draft 2020-12 and draft-07"
      fullWidth
    >
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('generate')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === 'generate'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Generate
          </button>
          <button
            type="button"
            onClick={() => setMode('validate')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === 'validate'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Validate
          </button>

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="schema-draft-select" className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
              Draft
            </label>
            <select
              id="schema-draft-select"
              value={draft}
              onChange={(e) => setDraft(e.target.value as JsonSchemaDraft)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2020-12">2020-12</option>
              <option value="draft-07">draft-07</option>
            </select>
          </div>
        </div>

        {mode === 'generate' ? (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Button label="Generate Schema" onClick={handleGenerate} variant="primary" />
              <Button label="Load Sample" onClick={handleLoadSampleGenerate} variant="secondary" />
              <Button label="Clear" onClick={handleClearGenerate} variant="secondary" />

              <label className="ml-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={showMultipleInputs}
                  onChange={(e) => setShowMultipleInputs(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                />
                Multiple samples (detect optional fields)
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={additionalPropertiesFalse}
                  onChange={(e) => setAdditionalPropertiesFalse(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                />
                additionalProperties: false
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-sm font-medium text-slate-700">Root Name:</span>
                <input
                  type="text"
                  value={rootName}
                  onChange={(e) => setRootName(e.target.value)}
                  placeholder="Root"
                  className="w-40 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            {showMultipleInputs && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Provide multiple JSON samples to detect optional fields. Fields that don&apos;t appear in all samples will be omitted from the <code className="rounded bg-blue-100 px-1">required</code> array.
                </p>
              </div>
            )}

            {genError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-red-700">Error:</p>
                <p className="text-sm text-red-600">{genError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Inputs */}
              <div className="space-y-4">
                <TextArea
                  value={genInput1}
                  onChange={setGenInput1}
                  label="JSON Sample 1"
                  placeholder='{"name": "John", "age": 30}'
                  rows={showMultipleInputs ? 10 : 26}
                />
                {showMultipleInputs && (
                  <>
                    <TextArea
                      value={genInput2}
                      onChange={setGenInput2}
                      label="JSON Sample 2 (Optional)"
                      placeholder='{"name": "Jane"}'
                      rows={10}
                    />
                    <TextArea
                      value={genInput3}
                      onChange={setGenInput3}
                      label="JSON Sample 3 (Optional)"
                      placeholder='{"name": "Bob", "age": 25}'
                      rows={10}
                    />
                  </>
                )}
              </div>

              {/* Output */}
              <div className="space-y-2">
                {genOutput ? (
                  <>
                    <div className="flex items-center justify-between">
                      <CodeDisplay code={genOutput} language="json" label="Generated JSON Schema" />
                    </div>
                    <div className="flex gap-2">
                      <CopyButton text={genOutput} label="Copy Schema" />
                      <Button
                        label="Send to Validate"
                        onClick={() => {
                          setValSchema(genOutput);
                          setValJson(genInput1);
                          setMode('validate');
                        }}
                        variant="secondary"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                      Generated JSON Schema
                    </span>
                    <div
                      className="flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 p-4 text-center text-slate-400"
                      style={{ minHeight: showMultipleInputs ? '560px' : '420px' }}
                    >
                      Output will appear here
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Validate controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Button label="Validate" onClick={handleValidate} variant="primary" />
              <Button label="Load Sample" onClick={handleLoadSampleValidate} variant="secondary" />
              <Button label="Clear" onClick={handleClearValidate} variant="secondary" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TextArea
                value={valJson}
                onChange={setValJson}
                label="JSON Instance"
                placeholder='{"name": "John", "age": 30}'
                rows={18}
              />
              <div className="space-y-2">
                <TextArea
                  value={valSchema}
                  onChange={setValSchema}
                  label="JSON Schema"
                  placeholder='{ "$schema": "...", "type": "object", ... }'
                  rows={12}
                />
                {valSchema && <CopyButton text={valSchema} label="Copy Schema" />}
              </div>
            </div>

            {/* Result */}
            {valResult && (
              <div
                className={`rounded-md border p-4 ${
                  valResult === 'valid'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                {valResult === 'valid' ? (
                  <p className="font-semibold text-green-700">
                    ✓ Valid{valParsedCount !== null ? ` · ${valParsedCount} item${valParsedCount === 1 ? '' : 's'} parsed` : ''}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold text-red-700">✗ Invalid</p>
                    {valErrorNotes.length > 0 && (
                      <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                        {valErrorNotes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    )}
                    {valErrors.length > 0 && (
                      <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                        {valErrors.map((err, i) => (
                          <li key={i}>
                            <code className="rounded bg-red-100 px-1">{err.instancePath || '/'}</code>
                            {' — '}
                            {err.message}
                            {err.keyword === 'enum' && err.params?.allowedValues
                              ? ` (${(err.params as Record<string, unknown>).allowedValues})`
                              : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}

export default JsonSchemaValidator;