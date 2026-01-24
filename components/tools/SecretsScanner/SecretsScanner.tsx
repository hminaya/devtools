"use client";

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { getSampleSecrets, scanSecrets, type SecretFinding } from '../../../utils/secretsScanner';

function SecretsScanner() {
  const [input, setInput] = useState('');
  const [findings, setFindings] = useState<SecretFinding[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [error, setError] = useState('');

  const severityCounts = useMemo(() => {
    return findings.reduce(
      (acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 } as Record<SecretFinding['severity'], number>
    );
  }, [findings]);

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    findings.forEach((item) => {
      map[item.type] = (map[item.type] || 0) + 1;
    });
    return map;
  }, [findings]);

  const handleScan = () => {
    if (!input.trim()) {
      setError('Paste some text, config, or logs to scan.');
      setFindings([]);
      setHasScanned(false);
      return;
    }
    const result = scanSecrets(input);
    setFindings(result);
    setHasScanned(true);
    setError('');
  };

  const handleLoadSample = () => {
    setInput(getSampleSecrets());
    setFindings([]);
    setHasScanned(false);
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setFindings([]);
    setHasScanned(false);
    setError('');
  };

  const severityBadge = (severity: SecretFinding['severity']) => {
    const styles: Record<SecretFinding['severity'], string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return styles[severity];
  };

  return (
    <ToolLayout
      title="Secrets Scanner"
      description="Detect leaked API keys, tokens, and secrets directly in your browser. Nothing leaves your device."
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button label="Scan" onClick={handleScan} variant="primary" disabled={!input.trim()} />
          <Button label="Load Sample" onClick={handleLoadSample} variant="secondary" />
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {/* Input */}
        <TextArea
          value={input}
          onChange={setInput}
          label="Text, logs, or config"
          placeholder="Paste environment files, logs, or snippets here. Processing stays local."
          rows={14}
        />

        {/* Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-sm text-slate-700">
            Scanning is entirely client-side. Rotate any real credentials found and move them to a secret manager.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {hasScanned && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">Summary</h3>
                <span className="text-sm text-slate-500">{findings.length} finding(s)</span>
              </div>

              {findings.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <span
                      key={level}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityBadge(level)}`}
                    >
                      {level.toUpperCase()}: {severityCounts[level]}
                    </span>
                  ))}
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <span key={type} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {type}: {count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-700">No secrets detected in the scanned text.</p>
              )}
            </div>

            {/* Results */}
            {findings.length > 0 && (
              <div className="space-y-3">
                {findings.map((finding, idx) => (
                  <div key={`${finding.type}-${idx}`} className="bg-white border border-slate-200 rounded-md p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${severityBadge(finding.severity)}`}>
                          {finding.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-slate-800">{finding.type}</span>
                      </div>
                      <span className="text-xs text-slate-500">Line {finding.line}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                      <code className="text-sm font-mono text-slate-900 break-all">{finding.match}</code>
                    </div>
                    <p className="text-xs text-slate-600">{finding.advice}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Export */}
            {findings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">Export findings</h4>
                  <CopyButton text={JSON.stringify(findings, null, 2)} label="Copy JSON" />
                </div>
                <div className="bg-slate-900 rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs text-slate-100 whitespace-pre-wrap break-words">
                    {JSON.stringify(findings, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default SecretsScanner;
