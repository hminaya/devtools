'use client';

import { useState } from 'react';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import TextArea from '../../shared/TextArea';
import {
  buildMetadataXml,
  getDefaultMetadataInput,
  BINDINGS,
  NAMEID_FORMAT_OPTIONS,
  CONTACT_TYPES,
  type SamlMetadataInput,
  type MetadataEntityType,
} from '../../../utils/samlMetadataGenerator';

function InputField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      {label}
    </label>
  );
}

function SamlMetadataGenerator() {
  const [formInput, setFormInput] = useState<SamlMetadataInput>(getDefaultMetadataInput());
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const updateField = <K extends keyof SamlMetadataInput>(key: K, value: SamlMetadataInput[K]) => {
    setFormInput(prev => ({ ...prev, [key]: value }));
  };

  const toggleNameIdFormat = (format: string) => {
    setFormInput(prev => ({
      ...prev,
      nameIdFormats: prev.nameIdFormats.includes(format)
        ? prev.nameIdFormats.filter(f => f !== format)
        : [...prev.nameIdFormats, format],
    }));
  };

  const generate = () => {
    try {
      setOutput(buildMetadataXml(formInput));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate metadata');
      setOutput('');
    }
  };

  const download = () => {
    const blob = new Blob([output], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formInput.entityType.toLowerCase()}-metadata.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSp = formInput.entityType === 'SP';

  return (
    <ToolLayout
      title="SAML Metadata Generator"
      description="Generate SAML 2.0 EntityDescriptor metadata XML for Service Providers and Identity Providers from form fields"
    >
      <div className="space-y-6">
        {/* Privacy note */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            Metadata is generated entirely in your browser. Certificates and endpoints you enter never leave this page.
          </p>
        </div>

        {/* Entity Type */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Entity Type</label>
          <div className="flex gap-2">
            {(['SP', 'IdP'] as MetadataEntityType[]).map(type => (
              <button
                key={type}
                onClick={() => updateField('entityType', type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formInput.entityType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {type === 'SP' ? 'Service Provider (SP)' : 'Identity Provider (IdP)'}
              </button>
            ))}
          </div>
        </div>

        {/* Entity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Entity ID"
            value={formInput.entityId}
            onChange={v => updateField('entityId', v)}
            placeholder={isSp ? 'https://sp.example.com/metadata' : 'https://idp.example.com/metadata'}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Validity (days, optional)</label>
            <input
              type="number"
              value={formInput.validityDays}
              onChange={e => updateField('validityDays', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
              min={0}
              placeholder="Omit validUntil"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Endpoints */}
        {isSp ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="ACS URL"
              value={formInput.acsUrl}
              onChange={v => updateField('acsUrl', v)}
              placeholder="https://sp.example.com/acs"
            />
            <SelectField
              label="ACS Binding"
              value={formInput.acsBinding}
              onChange={v => updateField('acsBinding', v)}
              options={BINDINGS}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="SSO URL"
              value={formInput.ssoUrl}
              onChange={v => updateField('ssoUrl', v)}
              placeholder="https://idp.example.com/sso"
            />
            <SelectField
              label="SSO Binding"
              value={formInput.ssoBinding}
              onChange={v => updateField('ssoBinding', v)}
              options={BINDINGS}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Single Logout URL (optional)"
            value={formInput.sloUrl}
            onChange={v => updateField('sloUrl', v)}
            placeholder="https://example.com/slo"
          />
          <SelectField
            label="SLO Binding"
            value={formInput.sloBinding}
            onChange={v => updateField('sloBinding', v)}
            options={BINDINGS}
          />
        </div>

        {/* Signing flags */}
        <div className="flex flex-wrap gap-6">
          {isSp ? (
            <>
              <CheckboxField
                label="AuthnRequestsSigned"
                checked={formInput.authnRequestsSigned}
                onChange={v => updateField('authnRequestsSigned', v)}
              />
              <CheckboxField
                label="WantAssertionsSigned"
                checked={formInput.wantAssertionsSigned}
                onChange={v => updateField('wantAssertionsSigned', v)}
              />
            </>
          ) : (
            <CheckboxField
              label="WantAuthnRequestsSigned"
              checked={formInput.wantAuthnRequestsSigned}
              onChange={v => updateField('wantAuthnRequestsSigned', v)}
            />
          )}
        </div>

        {/* NameID Formats */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">NameID Formats</label>
          <div className="flex flex-wrap gap-4">
            {NAMEID_FORMAT_OPTIONS.map(opt => (
              <CheckboxField
                key={opt.value}
                label={opt.label}
                checked={formInput.nameIdFormats.includes(opt.value)}
                onChange={() => toggleNameIdFormat(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            value={formInput.signingCert}
            onChange={v => updateField('signingCert', v)}
            label="Signing Certificate (PEM or Base64, optional)"
            placeholder="-----BEGIN CERTIFICATE-----&#10;MIIC...&#10;-----END CERTIFICATE-----"
            rows={5}
          />
          <TextArea
            value={formInput.encryptionCert}
            onChange={v => updateField('encryptionCert', v)}
            label="Encryption Certificate (PEM or Base64, optional)"
            placeholder="Leave blank to omit"
            rows={5}
          />
        </div>

        {/* Organization & Contact */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Organization & Contact (optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Organization Name"
              value={formInput.orgName}
              onChange={v => updateField('orgName', v)}
              placeholder="Example Corp"
            />
            <InputField
              label="Display Name"
              value={formInput.orgDisplayName}
              onChange={v => updateField('orgDisplayName', v)}
              placeholder="Example Corporation"
            />
            <InputField
              label="Organization URL"
              value={formInput.orgUrl}
              onChange={v => updateField('orgUrl', v)}
              placeholder="https://example.com"
            />
            <SelectField
              label="Contact Type"
              value={formInput.contactType}
              onChange={v => updateField('contactType', v)}
              options={CONTACT_TYPES}
            />
            <InputField
              label="Contact Email"
              value={formInput.contactEmail}
              onChange={v => updateField('contactEmail', v)}
              placeholder="admin@example.com"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button label="Generate Metadata" onClick={generate} variant="primary" />
          <Button label="Reset" onClick={() => { setFormInput(getDefaultMetadataInput()); setOutput(''); setError(''); }} variant="secondary" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <label className="text-sm font-medium text-slate-700">Metadata XML</label>
              <div className="flex gap-2">
                <CopyButton text={output} label="Copy XML" />
                <Button label="Download .xml" onClick={download} variant="secondary" />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-all max-h-96 overflow-auto">
                {output}
              </pre>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Validate the result with the{' '}
              <a href="/tools/saml-metadata-parser" className="text-blue-600 hover:text-blue-800 underline">SAML Metadata Parser</a>
              {' '}or inspect certificates with the{' '}
              <a href="/tools/saml-cert-inspector" className="text-blue-600 hover:text-blue-800 underline">SAML Certificate Inspector</a>.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SamlMetadataGenerator;
