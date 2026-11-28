'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ToolLayout from '../ToolLayout';
import TextArea from '../../shared/TextArea';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import Button from '../../shared/Button';
import {
  generateCode,
  parseCurlCommand,
  type CodeTarget,
  type ParsedCurlRequest,
} from '../../../utils/curlConverter';
import { trackToolEvent } from '../../../utils/analytics';

interface TargetOption {
  id: CodeTarget;
  label: string;
  language: string;
}

const TARGET_OPTIONS: TargetOption[] = [
  { id: 'javascript-fetch', label: 'JS (fetch)', language: 'javascript' },
  { id: 'typescript-fetch', label: 'TS (fetch)', language: 'typescript' },
  { id: 'node-axios', label: 'Node (axios)', language: 'javascript' },
  { id: 'python-requests', label: 'Python (requests)', language: 'python' },
  { id: 'python-httpx', label: 'Python (httpx)', language: 'python' },
  { id: 'go-http', label: 'Go (net/http)', language: 'go' },
  { id: 'rust-reqwest', label: 'Rust (reqwest)', language: 'rust' },
  { id: 'curl', label: 'Formatted cURL', language: 'bash' },
];

const SAMPLE_PRESETS: Array<{ label: string; value: string }> = [
  {
    label: 'POST JSON + Auth',
    value: `curl -X POST 'https://api.example.com/v1/projects?env=production' \\
  -H 'Accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer example-token-not-real' \\
  -d '{"name":"developers-do","visibility":"private","tags":["networking","devtools"]}'`,
  },
  {
    label: 'GET + Query Params',
    value: `curl -G 'https://api.example.com/v1/search' \\
  -H 'Accept: application/json' \\
  -H 'X-Request-Id: req_94f1c2' \\
  --data-urlencode 'q=http status codes' \\
  --data-urlencode 'limit=25' \\
  -L`,
  },
  {
    label: 'Multipart Upload',
    value: `curl -X POST 'https://api.example.com/v1/uploads' \\
  -H 'Authorization: Bearer upload-token-demo' \\
  -F 'purpose=avatar' \\
  -F 'file=@./avatar.png'`,
  },
  {
    label: 'Basic Auth + Cookies',
    value: `curl 'https://api.example.com/v1/session' \\
  -u 'dev_user:demo_pass' \\
  -b 'session_id=abc123; theme=light' \\
  --compressed \\
  --max-time 10`,
  },
];

const DEFAULT_INPUT = SAMPLE_PRESETS[0]!.value;

const METHOD_BADGE_STYLES: Record<string, string> = {
  GET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  POST: 'bg-blue-50 text-blue-700 border-blue-200',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200',
  PATCH: 'bg-purple-50 text-purple-700 border-purple-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  HEAD: 'bg-slate-100 text-slate-700 border-slate-300',
};

function formatInspectorBody(request: ParsedCurlRequest): string {
  if (request.bodyType === 'json' && request.jsonBody !== undefined) {
    return JSON.stringify(request.jsonBody, null, 2);
  }
  if (request.bodyType === 'multipart' && request.formData) {
    return request.formData
      .map((f) => `${f.key}: ${f.isFile ? `@${f.value} (file)` : f.value}`)
      .join('\n');
  }
  return request.body ?? '';
}

function CurlConverter() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [target, setTarget] = useState<CodeTarget>('javascript-fetch');
  const [redactSecrets, setRedactSecrets] = useState(false);
  const lastTrackedInput = useRef('');

  const parsedResult = useMemo(() => parseCurlCommand(input), [input]);

  useEffect(() => {
    if (parsedResult.ok && lastTrackedInput.current !== input) {
      trackToolEvent('tool_success', {
        tool_id: 'curl-converter',
        action: 'Parse cURL',
        method: parsedResult.request.method,
      });
      lastTrackedInput.current = input;
    }
  }, [input, parsedResult]);

  const activeTarget = TARGET_OPTIONS.find((item) => item.id === target) ?? TARGET_OPTIONS[0]!;

  const generatedCode = useMemo(() => {
    if (!parsedResult.ok) return '';
    return generateCode(parsedResult.request, target, { redactSecrets });
  }, [parsedResult, target, redactSecrets]);

  const handleLoadSample = (label: string, value: string) => {
    trackToolEvent('tool_sample', {
      tool_id: 'curl-converter',
      action: 'Load sample',
      label,
    });
    setInput(value);
  };

  const handleSelectTarget = (nextTarget: CodeTarget) => {
    setTarget(nextTarget);
    trackToolEvent('tool_action', {
      tool_id: 'curl-converter',
      action: 'Select target language',
      label: nextTarget,
    });
  };

  const request = parsedResult.ok ? parsedResult.request : null;

  return (
    <ToolLayout
      title="cURL Converter & Parser"
      description="Parse cURL commands locally and convert them to fetch, axios, Python, Go, Rust, or formatted cURL."
      fullWidth
    >
      <div className="space-y-6">
        {/* Preset bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
            Samples:
          </span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleLoadSample(preset.label, preset.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {preset.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={redactSecrets}
                onChange={(e) => setRedactSecrets(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Redact secrets in output
            </label>
            <Button
              label="Clear"
              variant="secondary"
              onClick={() => setInput('')}
              disabled={!input}
            />
          </div>
        </div>

        {/* Input */}
        <TextArea
          label="cURL Command (Bash, Zsh, PowerShell, or Chrome DevTools Copy as cURL)"
          value={input}
          onChange={setInput}
          rows={7}
          placeholder="curl -X POST 'https://api.example.com/v1/items' -H 'Content-Type: application/json' -d '{&quot;hello&quot;:&quot;world&quot;}'"
          error={!parsedResult.ok && input.trim() ? parsedResult.error : undefined}
        />

        {!parsedResult.ok && !input.trim() && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Paste a <code className="font-mono text-slate-800">curl</code> command above or pick a sample to inspect headers, query parameters, and body payloads.
          </div>
        )}

        {/* Secret detection notice */}
        {request && request.secrets.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            role="status"
          >
            <div>
              <strong className="font-semibold">Credentials detected:</strong>{' '}
              {request.secrets.map((s) => `${s.location} (${s.label})`).join(', ')}.
              <span className="block text-xs text-amber-800">
                Everything runs locally in your browser and is never sent to a server. Enable redaction before sharing generated snippets.
              </span>
            </div>
            {!redactSecrets && (
              <button
                type="button"
                onClick={() => setRedactSecrets(true)}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                Redact secrets
              </button>
            )}
          </div>
        )}

        {/* Warnings */}
        {request && request.warnings.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <strong className="font-semibold text-slate-700">Parser notes:</strong>{' '}
            {request.warnings.join(' ')}
          </div>
        )}

        {/* Main output grid */}
        {request && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Generated Code Column */}
            <div className="space-y-3 xl:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div
                  role="tablist"
                  aria-label="Target language"
                  className="flex flex-wrap gap-1.5"
                >
                  {TARGET_OPTIONS.map((option) => {
                    const isSelected = option.id === target;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => handleSelectTarget(option.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <CopyButton text={generatedCode} label={`Copy ${activeTarget.label}`} />
              </div>

              <CodeDisplay
                code={generatedCode}
                language={activeTarget.language}
                showLineNumbers
              />
            </div>

            {/* Parsed Request Inspector Column */}
            <div className="space-y-4 xl:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                  Parsed Request
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${
                      METHOD_BADGE_STYLES[request.method] ?? 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {request.method}
                  </span>
                  <span className="break-all font-mono text-sm text-slate-900">
                    {request.baseUrl}
                  </span>
                </div>

                {(request.followRedirects ||
                  request.insecure ||
                  request.compressed ||
                  request.timeoutSeconds !== undefined ||
                  request.proxy) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {request.followRedirects && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        Follow redirects (-L)
                      </span>
                    )}
                    {request.insecure && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                        Skip TLS verify (-k)
                      </span>
                    )}
                    {request.compressed && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        Compressed
                      </span>
                    )}
                    {request.timeoutSeconds !== undefined && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        Timeout: {request.timeoutSeconds}s
                      </span>
                    )}
                    {request.proxy && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                        Proxy: {request.proxy}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Query Parameters */}
              {request.queryParams.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                    Query Parameters ({request.queryParams.length})
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {request.queryParams.map((param, idx) => (
                      <div key={`${param.key}-${idx}`} className="flex items-start gap-3 py-1.5">
                        <span className="w-1/3 shrink-0 break-all font-mono font-semibold text-slate-700">
                          {param.key}
                        </span>
                        <span className="break-all font-mono text-slate-900">
                          {param.value || <em className="text-slate-400">(empty)</em>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Headers */}
              {request.headers.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                    Headers ({request.headers.length})
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {request.headers.map((header, idx) => (
                      <div key={`${header.key}-${idx}`} className="flex items-start gap-3 py-1.5">
                        <span className="w-1/3 shrink-0 break-all font-mono font-semibold text-slate-700">
                          {header.key}
                        </span>
                        <span className="break-all font-mono text-slate-900">
                          {header.value || <em className="text-slate-400">(empty)</em>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cookies */}
              {request.cookies.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                    Cookies ({request.cookies.length})
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {request.cookies.map((cookie, idx) => (
                      <div key={`${cookie.key}-${idx}`} className="flex items-start gap-3 py-1.5">
                        <span className="w-1/3 shrink-0 break-all font-mono font-semibold text-slate-700">
                          {cookie.key}
                        </span>
                        <span className="break-all font-mono text-slate-900">{cookie.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Auth */}
              {request.auth && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                    Basic Authentication (-u)
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    <div>
                      <span className="font-semibold text-slate-600">Username:</span>{' '}
                      <span className="text-slate-900">{request.auth.username}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">Password:</span>{' '}
                      <span className="text-slate-900">
                        {redactSecrets ? '<REDACTED>' : request.auth.password}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Body */}
              {request.bodyType !== 'none' && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                      Body ({request.bodyType})
                    </span>
                    <CopyButton text={formatInspectorBody(request)} label="Copy body" />
                  </div>
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-900">
                    {formatInspectorBody(request)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <strong className="font-semibold">100% Local Only:</strong>{' '}
          This tool parses your cURL command and generates code entirely in your browser. It never executes the request or transmits headers, cookies, tokens, or payloads to any server.
        </div>
      </div>
    </ToolLayout>
  );
}

export default CurlConverter;
