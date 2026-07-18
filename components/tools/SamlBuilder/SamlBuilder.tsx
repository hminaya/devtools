'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  buildSamlXml,
  toBase64,
  toBase64Deflate,
  getDefaultInput,
  type SamlBuilderInput,
  type SamlTemplate,
  type OutputFormat,
  type SamlAttribute,
} from '../../../utils/samlBuilder';

const TEMPLATES: { value: SamlTemplate; label: string }[] = [
  { value: 'Response', label: 'SAML Response' },
  { value: 'AuthnRequest', label: 'AuthnRequest' },
  { value: 'LogoutRequest', label: 'LogoutRequest' },
];

const NAMEID_FORMATS = [
  { value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress', label: 'Email Address' },
  { value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent', label: 'Persistent' },
  { value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient', label: 'Transient' },
  { value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified', label: 'Unspecified' },
];

const AUTHN_CONTEXTS = [
  { value: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport', label: 'Password Protected Transport' },
  { value: 'urn:oasis:names:tc:SAML:2.0:ac:classes:Password', label: 'Password' },
  { value: 'urn:oasis:names:tc:SAML:2.0:ac:classes:X509', label: 'X.509 Certificate' },
  { value: 'urn:oasis:names:tc:SAML:2.0:ac:classes:Kerberos', label: 'Kerberos' },
  { value: 'urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified', label: 'Unspecified' },
];

const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'xml', label: 'Raw XML' },
  { value: 'base64', label: 'Base64 (POST binding)' },
  { value: 'base64-deflate', label: 'Base64 + Deflate (Redirect binding)' },
];

function InputField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange, min, max }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function SamlBuilder() {
  const [formInput, setFormInput] = useState<SamlBuilderInput>(getDefaultInput());
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('xml');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = <K extends keyof SamlBuilderInput>(key: K, value: SamlBuilderInput[K]) => {
    setFormInput(prev => ({ ...prev, [key]: value }));
  };

  const updateAttribute = (index: number, field: keyof SamlAttribute, value: string) => {
    setFormInput(prev => {
      const attrs = [...prev.attributes];
      attrs[index] = { ...attrs[index]!, [field]: value };
      return { ...prev, attributes: attrs };
    });
  };

  const addAttribute = () => {
    setFormInput(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }],
    }));
  };

  const removeAttribute = (index: number) => {
    setFormInput(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const generate = async () => {
    setLoading(true);
    try {
      const xml = buildSamlXml(formInput);
      let result: string;
      switch (outputFormat) {
        case 'base64':
          result = toBase64(xml);
          break;
        case 'base64-deflate':
          result = await toBase64Deflate(xml);
          break;
        default:
          result = xml;
      }
      setOutput(result);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate');
      setOutput('');
    }
    setLoading(false);
  };

  const showResponseFields = formInput.template === 'Response';
  const showLogoutFields = formInput.template === 'LogoutRequest';

  return (
    <ToolLayout
      title="SAML Assertion Builder"
      description="Generate SAML Responses, AuthnRequests, and LogoutRequests from form fields"
    >
      <div className="space-y-6">
        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> Generated assertions are UNSIGNED and should only be used for testing, development, or learning purposes. Never use unsigned assertions in production.
          </p>
        </div>

        {/* Template Selection */}
        <SelectField
          label="Template"
          value={formInput.template}
          onChange={v => updateField('template', v as SamlTemplate)}
          options={TEMPLATES}
        />

        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Issuer"
            value={formInput.issuer}
            onChange={v => updateField('issuer', v)}
            placeholder="https://idp.example.com"
          />
          <InputField
            label="Destination"
            value={formInput.destination}
            onChange={v => updateField('destination', v)}
            placeholder="https://sp.example.com/acs"
          />
          <InputField
            label="NameID"
            value={formInput.nameId}
            onChange={v => updateField('nameId', v)}
            placeholder="user@example.com"
          />
          <SelectField
            label="NameID Format"
            value={formInput.nameIdFormat}
            onChange={v => updateField('nameIdFormat', v)}
            options={NAMEID_FORMATS}
          />
        </div>

        {/* Response-specific fields */}
        {showResponseFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Audience"
              value={formInput.audience}
              onChange={v => updateField('audience', v)}
              placeholder="https://sp.example.com"
            />
            <InputField
              label="ACS URL"
              value={formInput.acsUrl}
              onChange={v => updateField('acsUrl', v)}
              placeholder="https://sp.example.com/acs"
            />
            <InputField
              label="InResponseTo"
              value={formInput.inResponseTo}
              onChange={v => updateField('inResponseTo', v)}
              placeholder="_request_abc123"
            />
            <SelectField
              label="AuthnContext"
              value={formInput.authnContext}
              onChange={v => updateField('authnContext', v)}
              options={AUTHN_CONTEXTS}
            />
          </div>
        )}

        {/* Timing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberField
            label="NotBefore offset (minutes)"
            value={formInput.notBeforeMinutes}
            onChange={v => updateField('notBeforeMinutes', v)}
            min={0}
          />
          <NumberField
            label="Validity (minutes)"
            value={formInput.validityMinutes}
            onChange={v => updateField('validityMinutes', v)}
            min={1}
          />
          {showResponseFields && (
            <NumberField
              label="Session duration (minutes)"
              value={formInput.sessionMinutes}
              onChange={v => updateField('sessionMinutes', v)}
              min={1}
            />
          )}
        </div>

        {/* Attributes (Response only) */}
        {showResponseFields && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Attributes</label>
              <button
                onClick={addAttribute}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Attribute
              </button>
            </div>
            <div className="space-y-2">
              {formInput.attributes.map((attr, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <label className="flex-1">
                    <span className="sr-only">Attribute name</span>
                    <input
                      type="text"
                      value={attr.name}
                      onChange={e => updateAttribute(i, 'name', e.target.value)}
                      placeholder="Attribute name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="sr-only">Attribute value</span>
                    <input
                      type="text"
                      value={attr.value}
                      onChange={e => updateAttribute(i, 'value', e.target.value)}
                      placeholder="Value"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <button
                    onClick={() => removeAttribute(i)}
                    aria-label={`Remove attribute ${i + 1}`}
                    className="px-2 py-2 text-red-500 hover:text-red-700 text-sm"
                    title="Remove attribute"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Format & Generate */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-48">
            <SelectField
              label="Output Format"
              value={outputFormat}
              onChange={v => setOutputFormat(v as OutputFormat)}
              options={OUTPUT_FORMATS}
            />
          </div>
          <Button label={loading ? 'Generating...' : 'Generate'} onClick={generate} variant="primary" disabled={loading} />
          <Button label="Reset" onClick={() => { setFormInput(getDefaultInput()); setOutput(''); }} variant="secondary" />
        </div>

        {/* Output */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {output && (
          <div aria-live="polite">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Output</span>
              <CopyButton text={output} label="Copy Output" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-all max-h-96 overflow-auto">
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SamlBuilder;
