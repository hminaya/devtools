'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';
import TextArea from '../../shared/TextArea';

type PromptType = 'security' | 'production' | 'tests' | 'refactor' | 'threat-model' | 'assumptions';
type AppType = 'web-app' | 'api' | 'mobile-app' | 'browser-extension' | 'automation' | 'library';
type DataSensitivity = 'low' | 'moderate' | 'high';

const PROMPT_TYPES: Array<{ value: PromptType; label: string; focus: string }> = [
  {
    value: 'security',
    label: 'Security Review',
    focus: 'security vulnerabilities, auth mistakes, unsafe defaults, leaked secrets, dependency risks, and data exposure',
  },
  {
    value: 'production',
    label: 'Production Readiness',
    focus: 'release blockers, observability, failure handling, deployment assumptions, performance issues, and operational gaps',
  },
  {
    value: 'tests',
    label: 'Test Plan',
    focus: 'unit, integration, end-to-end, regression, accessibility, and edge-case coverage',
  },
  {
    value: 'refactor',
    label: 'Refactor Plan',
    focus: 'maintainability, duplicated logic, fragile abstractions, unclear ownership, and complexity hot spots',
  },
  {
    value: 'threat-model',
    label: 'Threat Model',
    focus: 'assets, trust boundaries, attackers, abuse paths, mitigations, and unresolved risk',
  },
  {
    value: 'assumptions',
    label: 'Hidden Assumptions',
    focus: 'unstated requirements, missing error states, optimistic AI-generated shortcuts, and ambiguous product behavior',
  },
];

const APP_TYPES: Array<{ value: AppType; label: string }> = [
  { value: 'web-app', label: 'Web app' },
  { value: 'api', label: 'API service' },
  { value: 'mobile-app', label: 'Mobile app' },
  { value: 'browser-extension', label: 'Browser extension' },
  { value: 'automation', label: 'Automation script' },
  { value: 'library', label: 'Library/package' },
];

const STACK_OPTIONS = [
  'Next.js',
  'React',
  'Node.js',
  'Python',
  'Swift',
  'Postgres',
  'Supabase',
  'Firebase',
  'Stripe',
  'OpenAI API',
];

const RISK_OPTIONS = [
  'Authentication',
  'Payments',
  'File uploads',
  'User-generated content',
  'Admin dashboard',
  'Public API',
  'Background jobs',
  'Third-party webhooks',
  'Secrets or tokens',
  'PII or sensitive data',
];

const DATA_SENSITIVITY_LABELS: Record<DataSensitivity, string> = {
  low: 'Low: public or disposable data',
  moderate: 'Moderate: user accounts, saved settings, or business data',
  high: 'High: PII, payments, credentials, health, legal, or regulated data',
};

const DEFAULT_CONTEXT = [
  'App summary:',
  'Primary user flow:',
  'Recent AI-generated changes:',
  'Known weak spots:',
  'Files or modules to inspect:',
].join('\n');

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function VibeCheck() {
  const [promptType, setPromptType] = useState<PromptType>('security');
  const [appType, setAppType] = useState<AppType>('web-app');
  const [dataSensitivity, setDataSensitivity] = useState<DataSensitivity>('moderate');
  const [selectedStack, setSelectedStack] = useState<string[]>(['Next.js', 'React']);
  const [selectedRisks, setSelectedRisks] = useState<string[]>(['Authentication', 'Secrets or tokens']);
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [includeCommands, setIncludeCommands] = useState(true);
  const [includePatchPlan, setIncludePatchPlan] = useState(true);

  const selectedPrompt = PROMPT_TYPES.find((item) => item.value === promptType) || PROMPT_TYPES[0]!;
  const selectedApp = APP_TYPES.find((item) => item.value === appType) || APP_TYPES[0]!;

  const generatedPrompt = useMemo(() => {
    const stack = selectedStack.length > 0 ? selectedStack.join(', ') : 'Unknown stack';
    const riskAreas = selectedRisks.length > 0 ? selectedRisks.join(', ') : 'No specific risk areas selected';
    const commandRequest = includeCommands
      ? '- Include exact commands I should run to verify the findings when possible.'
      : '- Do not include shell commands unless they are necessary to explain a blocker.';
    const patchRequest = includePatchPlan
      ? '- For each actionable issue, propose a minimal patch plan with file-level scope.'
      : '- Focus on findings and verification, not implementation steps.';

    return [
      `Act as a senior engineer reviewing a vibe-coded ${selectedApp.label.toLowerCase()}.`,
      '',
      `Review focus: ${selectedPrompt.label}`,
      `Prioritize: ${selectedPrompt.focus}.`,
      '',
      'Project profile:',
      `- App type: ${selectedApp.label}`,
      `- Stack: ${stack}`,
      `- Data sensitivity: ${DATA_SENSITIVITY_LABELS[dataSensitivity]}`,
      `- Risk areas: ${riskAreas}`,
      '',
      'Context:',
      context.trim() || 'No extra context provided.',
      '',
      'Review requirements:',
      '- Be concrete and skeptical. Assume some code was generated quickly by AI and may contain hidden shortcuts.',
      '- Identify real defects, not generic best-practice advice.',
      '- Call out security, privacy, reliability, and maintainability risks that could block shipping.',
      '- Separate confirmed issues from assumptions that need verification.',
      '- Prefer small, reviewable fixes over broad rewrites.',
      commandRequest,
      patchRequest,
      '',
      'Output format:',
      '1. Critical blockers',
      '2. High-confidence issues',
      '3. Missing tests',
      '4. Questions or assumptions',
      '5. Suggested next patch',
    ].join('\n');
  }, [
    appType,
    context,
    dataSensitivity,
    includeCommands,
    includePatchPlan,
    promptType,
    selectedApp,
    selectedPrompt,
    selectedRisks,
    selectedStack,
  ]);

  return (
    <ToolLayout
      title="Vibe Check"
      description="Generate AI review prompts for vibe-coded apps"
      fullWidth
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Prompt type</label>
            <div role="group" aria-label="Prompt type" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PROMPT_TYPES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={promptType === item.value}
                  onClick={() => setPromptType(item.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    promptType === item.value
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">App type</span>
              <select
                value={appType}
                onChange={(event) => setAppType(event.target.value as AppType)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {APP_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Data sensitivity</span>
              <select
                value={dataSensitivity}
                onChange={(event) => setDataSensitivity(event.target.value as DataSensitivity)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(DATA_SENSITIVITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div role="group" aria-label="Stack">
            <label className="mb-2 block text-sm font-medium text-slate-700">Stack</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STACK_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedStack.includes(item)}
                    onChange={() => setSelectedStack((current) => toggleValue(current, item))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div role="group" aria-label="Risk areas">
            <label className="mb-2 block text-sm font-medium text-slate-700">Risk areas</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {RISK_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedRisks.includes(item)}
                    onChange={() => setSelectedRisks((current) => toggleValue(current, item))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeCommands}
                onChange={() => setIncludeCommands((current) => !current)}
                className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              Include verification commands
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includePatchPlan}
                onChange={() => setIncludePatchPlan((current) => !current)}
                className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              Include a minimal patch plan
            </label>
          </div>

          <TextArea
            label="Project context"
            value={context}
            onChange={setContext}
            rows={8}
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Generated prompt</h2>
            <CopyButton text={generatedPrompt} label="Copy Prompt" />
          </div>
          <TextArea value={generatedPrompt} readOnly rows={30} label="Generated prompt" />
        </div>
      </div>
    </ToolLayout>
  );
}

export default VibeCheck;
