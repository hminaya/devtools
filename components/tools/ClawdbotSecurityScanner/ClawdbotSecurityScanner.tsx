"use client";

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import {
  getSampleConfig,
  getSecurityScore,
  sampleConfigs,
  scanClawdbotConfig,
  type SecurityFinding,
} from '../../../utils/clawdbotSecurityScanner';

function ClawdbotSecurityScanner() {
  const [input, setInput] = useState('');
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [error, setError] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const severityCounts = useMemo(() => {
    return findings.reduce(
      (acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 } as Record<SecurityFinding['severity'], number>
    );
  }, [findings]);

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    findings.forEach((item) => {
      map[item.type] = (map[item.type] || 0) + 1;
    });
    return map;
  }, [findings]);

  const securityScore = useMemo(() => {
    return getSecurityScore(findings);
  }, [findings]);

  const handleScan = () => {
    if (!input.trim()) {
      setError('Paste your Clawdbot/Moltbot configuration to scan.');
      setFindings([]);
      setHasScanned(false);
      return;
    }
    const result = scanClawdbotConfig(input);
    setFindings(result);
    setHasScanned(true);
    setError('');
  };

  const handleLoadSample = (id: string) => {
    setInput(getSampleConfig(id));
    setFindings([]);
    setHasScanned(false);
    setError('');
    setShowSamples(false);
  };

  const toggleSamples = () => {
    setShowSamples(!showSamples);
  };

  const handleClear = () => {
    setInput('');
    setFindings([]);
    setHasScanned(false);
    setError('');
    setShowSamples(false);
  };

  const gradeColorSmall = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'text-emerald-600 bg-emerald-100',
      B: 'text-green-600 bg-green-100',
      C: 'text-amber-600 bg-amber-100',
      D: 'text-orange-600 bg-orange-100',
      F: 'text-red-600 bg-red-100',
    };
    return colors[grade] || 'text-slate-600 bg-slate-100';
  };

  const severityBadge = (severity: SecurityFinding['severity']) => {
    const styles: Record<SecurityFinding['severity'], string> = {
      critical: 'bg-purple-100 text-purple-800 border-purple-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return styles[severity];
  };

  const gradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      B: 'text-green-600 bg-green-50 border-green-200',
      C: 'text-amber-600 bg-amber-50 border-amber-200',
      D: 'text-orange-600 bg-orange-50 border-orange-200',
      F: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[grade] || 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <ToolLayout
      title="Clawdbot Security Scanner"
      description="Audit your Clawdbot/Moltbot/OpenClaw configuration for security issues. All analysis runs locally in your browser."
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-sm text-amber-800">
            <strong>Security Notice:</strong> Clawdbot-based agents have shell access and are vulnerable to prompt injection.
            This scanner checks for common misconfigurations that can lead to credential leaks, unauthorized access, and data exfiltration.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button label="Scan" onClick={handleScan} variant="primary" disabled={!input.trim()} />
          <div className="relative">
            <Button label={showSamples ? "Hide Samples" : "Load Sample"} onClick={toggleSamples} variant="secondary" />
            {showSamples && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <p className="text-xs text-slate-500 px-2 py-1 font-medium">Select a sample configuration:</p>
                  {sampleConfigs.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleLoadSample(sample.id)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800">{sample.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${gradeColorSmall(sample.expectedGrade)}`}>
                          {sample.expectedGrade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{sample.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button label="Clear" onClick={handleClear} variant="secondary" />
        </div>

        {/* Input */}
        <TextArea
          value={input}
          onChange={setInput}
          label="Configuration file"
          placeholder="Paste your clawdbot.toml, moltbot.json, config.yaml, or any Clawdbot/Moltbot configuration here..."
          rows={14}
        />

        {/* Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-sm text-slate-700">
            Scanning is entirely client-side. Supports TOML, JSON, YAML, and INI-style configurations.
            Based on security research and known vulnerabilities in Clawdbot/Moltbot deployments.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {hasScanned && (
          <div className="space-y-4">
            {/* Security Score */}
            <div className="bg-white border border-slate-200 rounded-md p-4">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold px-4 py-2 rounded-lg border ${gradeColor(securityScore.grade)}`}>
                  {securityScore.grade}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold text-slate-800">{securityScore.score}/100</span>
                    <span className="text-sm text-slate-500">Security Score</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{securityScore.summary}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">Findings Summary</h3>
                <span className="text-sm text-slate-500">{findings.length} issue(s)</span>
              </div>

              {findings.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(['critical', 'high', 'medium', 'low'] as const).map((level) =>
                    severityCounts[level] > 0 ? (
                      <span
                        key={level}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityBadge(level)}`}
                      >
                        {level.toUpperCase()}: {severityCounts[level]}
                      </span>
                    ) : null
                  )}
                </div>
              ) : (
                <p className="text-sm text-emerald-700">No security issues detected. Your configuration appears secure.</p>
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
                    {finding.reference && (
                      <a
                        href={finding.reference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Learn more
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Export */}
            {findings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">Export findings</h4>
                  <CopyButton text={JSON.stringify({ score: securityScore, findings }, null, 2)} label="Copy JSON" />
                </div>
                <div className="bg-slate-900 rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs text-slate-100 whitespace-pre-wrap break-words">
                    {JSON.stringify({ score: securityScore, findings }, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
              <h4 className="text-sm font-medium text-blue-800">General Recommendations</h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Run <code className="bg-blue-100 px-1 rounded">moltbot security audit --fix</code> to apply safe guardrails</li>
                <li>Set directory permissions: <code className="bg-blue-100 px-1 rounded">chmod 700 ~/.moltbot && chmod 600 ~/.moltbot/config.*</code></li>
                <li>Never expose your control panel to the public internet</li>
                <li>Review and audit all MCP servers and skills before enabling</li>
                <li>Use environment variables for API keys, not config files</li>
                <li>Enable state encryption for sensitive conversation data</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export default ClawdbotSecurityScanner;
