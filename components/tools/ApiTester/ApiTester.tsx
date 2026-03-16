'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToolLayout from '../ToolLayout';
import Button from '../../shared/Button';
import CopyButton from '../../shared/CopyButton';
import { testApi } from '../../../utils/apiTester';
import type { ApiResponse, HttpMethod } from '../../../utils/apiTester';

type LanguageOption = 'typescript' | 'jsdoc' | 'csharp' | 'swift' | 'kotlin' | 'go' | 'rust';
type KeyValuePair = { key: string; value: string };
type RequestTab = 'params' | 'headers' | 'body';
type BodyType = 'json' | 'text' | 'form-urlencoded';

function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  const updatePair = (index: number, field: 'key' | 'value', val: string) => {
    const updated = pairs.map((p, i) => (i === index ? { ...p, [field]: val } : p));
    onChange(updated);
  };

  const removePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  const addPair = () => {
    onChange([...pairs, { key: '', value: '' }]);
  };

  return (
    <div className="space-y-2">
      {pairs.map((pair, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={pair.key}
            onChange={(e) => updatePair(i, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={pair.value}
            onChange={(e) => updatePair(i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => removePair(i)}
            className="px-2 py-1.5 text-slate-400 hover:text-red-500 transition-colors"
            title="Remove"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={addPair}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        + Add Row
      </button>
    </div>
  );
}

function ApiTester() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('typescript');

  const [activeTab, setActiveTab] = useState<RequestTab>('params');
  const [params, setParams] = useState<KeyValuePair[]>([{ key: '', value: '' }]);
  const [requestHeaders, setRequestHeaders] = useState<KeyValuePair[]>([{ key: '', value: '' }]);
  const [requestBody, setRequestBody] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>('json');

  const supportsBody = ['POST', 'PUT', 'PATCH'].includes(method);

  const buildUrl = (): string => {
    const filledParams = params.filter((p) => p.key.trim());
    if (filledParams.length === 0) return url;

    const separator = url.includes('?') ? '&' : '?';
    const queryString = filledParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return `${url}${separator}${queryString}`;
  };

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    for (const h of requestHeaders) {
      if (h.key.trim()) {
        headers[h.key.trim()] = h.value;
      }
    }
    if (supportsBody && requestBody.trim()) {
      const contentTypes: Record<BodyType, string> = {
        'json': 'application/json',
        'text': 'text/plain',
        'form-urlencoded': 'application/x-www-form-urlencoded',
      };
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = contentTypes[bodyType];
      }
    }
    return headers;
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      setResponse({
        success: false,
        error: 'Please enter a URL',
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    const finalUrl = buildUrl();
    const customHeaders = buildHeaders();
    const body = supportsBody && requestBody.trim() ? requestBody : undefined;

    const result = await testApi(finalUrl, method, customHeaders, body);
    setResponse(result);
    setLoading(false);
  };

  const clear = () => {
    setUrl('');
    setMethod('GET');
    setResponse(null);
    setParams([{ key: '', value: '' }]);
    setRequestHeaders([{ key: '', value: '' }]);
    setRequestBody('');
    setBodyType('json');
  };

  const loadSampleApi = () => {
    const resources = ['posts', 'comments', 'albums', 'photos', 'todos', 'users'];
    const randomResource = resources[Math.floor(Math.random() * resources.length)];
    const randomId = Math.floor(Math.random() * 10) + 1;

    const sampleBody = JSON.stringify({ title: 'Sample Title', body: 'Sample body content', userId: 1 }, null, 2);

    const samples: { url: string; method: HttpMethod; headers: KeyValuePair[]; body: string; bodyType: BodyType; params: KeyValuePair[] }[] = [
      { url: `https://jsonplaceholder.typicode.com/${randomResource}/${randomId}`, method: 'GET', headers: [{ key: '', value: '' }], body: '', bodyType: 'json', params: [{ key: '', value: '' }] },
      { url: `https://jsonplaceholder.typicode.com/${randomResource}`, method: 'POST', headers: [{ key: 'Content-Type', value: 'application/json' }], body: sampleBody, bodyType: 'json', params: [{ key: '', value: '' }] },
      { url: `https://jsonplaceholder.typicode.com/${randomResource}/${randomId}`, method: 'PUT', headers: [{ key: 'Content-Type', value: 'application/json' }], body: sampleBody, bodyType: 'json', params: [{ key: '', value: '' }] },
      { url: `https://jsonplaceholder.typicode.com/${randomResource}/${randomId}`, method: 'PATCH', headers: [{ key: 'Content-Type', value: 'application/json' }], body: JSON.stringify({ title: 'Updated Title' }, null, 2), bodyType: 'json', params: [{ key: '', value: '' }] },
      { url: `https://jsonplaceholder.typicode.com/${randomResource}/${randomId}`, method: 'DELETE', headers: [{ key: '', value: '' }], body: '', bodyType: 'json', params: [{ key: '', value: '' }] },
      { url: `https://jsonplaceholder.typicode.com/${randomResource}`, method: 'HEAD', headers: [{ key: '', value: '' }], body: '', bodyType: 'json', params: [{ key: '', value: '' }] },
      { url: `https://jsonplaceholder.typicode.com/${randomResource}`, method: 'GET', headers: [{ key: '', value: '' }], body: '', bodyType: 'json', params: [{ key: '_limit', value: '5' }, { key: '_page', value: '1' }] },
      { url: `https://jsonplaceholder.typicode.com/${randomResource}`, method: 'OPTIONS', headers: [{ key: '', value: '' }], body: '', bodyType: 'json', params: [{ key: '', value: '' }] },
    ];

    const sample = samples[Math.floor(Math.random() * samples.length)]!;
    setUrl(sample.url);
    setMethod(sample.method);
    setRequestHeaders(sample.headers);
    setRequestBody(sample.body);
    setBodyType(sample.bodyType);
    setParams(sample.params);
    setResponse(null);

    if (sample.body) {
      setActiveTab('body');
    } else if (sample.params.some((p) => p.key.trim())) {
      setActiveTab('params');
    }
  };

  const languageRoutes: Record<LanguageOption, string> = {
    typescript: '/tools/json-to-typescript',
    jsdoc: '/tools/json-to-jsdoc',
    csharp: '/tools/json-to-csharp',
    swift: '/tools/json-to-swift',
    kotlin: '/tools/json-to-kotlin',
    go: '/tools/json-to-go',
    rust: '/tools/json-to-rust',
  };

  const languageNames: Record<LanguageOption, string> = {
    typescript: 'TypeScript',
    jsdoc: 'JSDoc',
    csharp: 'C#',
    swift: 'Swift',
    kotlin: 'Kotlin',
    go: 'Go',
    rust: 'Rust',
  };

  const generateCode = () => {
    if (!response?.body) return;

    try {
      JSON.parse(response.body);
      sessionStorage.setItem('jsonInput', response.body);
      router.push(languageRoutes[selectedLanguage]);
    } catch (error) {
      alert(`Response is not valid JSON. ${languageNames[selectedLanguage]} code can only be generated from JSON responses.`);
    }
  };

  const filledParamsCount = params.filter((p) => p.key.trim()).length;
  const filledHeadersCount = requestHeaders.filter((h) => h.key.trim()).length;

  const tabs: { id: RequestTab; label: string; badge?: number; disabled?: boolean }[] = [
    { id: 'params', label: 'Params', badge: filledParamsCount || undefined },
    { id: 'headers', label: 'Headers', badge: filledHeadersCount || undefined },
    { id: 'body', label: 'Body', disabled: !supportsBody },
  ];

  return (
    <ToolLayout
      title="API Tester"
      description="Test API endpoints and view responses"
      fullWidth
    >
      <div className="space-y-6">
        {/* URL Input and Method */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                API URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendRequest();
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className={`px-4 py-2 border border-slate-300 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  method === 'GET' ? 'text-green-600' :
                  method === 'DELETE' ? 'text-red-600' :
                  method === 'HEAD' || method === 'OPTIONS' ? 'text-slate-600' :
                  'text-blue-600'
                }`}
              >
                <option value="GET" className="text-green-600">GET</option>
                <option value="POST" className="text-blue-600">POST</option>
                <option value="PUT" className="text-blue-600">PUT</option>
                <option value="PATCH" className="text-blue-600">PATCH</option>
                <option value="DELETE" className="text-red-600">DELETE</option>
                <option value="HEAD" className="text-slate-600">HEAD</option>
                <option value="OPTIONS" className="text-slate-600">OPTIONS</option>
              </select>
            </div>
          </div>

          {/* Tabs: Params / Headers / Body */}
          <div className="border border-slate-200 rounded-md">
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    tab.disabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                  {tab.badge ? (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'params' && (
                <KeyValueEditor
                  pairs={params}
                  onChange={setParams}
                  keyPlaceholder="Parameter name"
                  valuePlaceholder="Value"
                />
              )}

              {activeTab === 'headers' && (
                <KeyValueEditor
                  pairs={requestHeaders}
                  onChange={setRequestHeaders}
                  keyPlaceholder="Header name"
                  valuePlaceholder="Value"
                />
              )}

              {activeTab === 'body' && supportsBody && (
                <div className="space-y-3">
                  <div className="flex gap-3 items-center">
                    <label className="text-sm font-medium text-slate-700">Content Type:</label>
                    {(['json', 'text', 'form-urlencoded'] as BodyType[]).map((type) => (
                      <label key={type} className="flex items-center gap-1.5 text-sm text-slate-600">
                        <input
                          type="radio"
                          name="bodyType"
                          value={type}
                          checked={bodyType === type}
                          onChange={() => setBodyType(type)}
                          className="accent-blue-600"
                        />
                        {type === 'json' ? 'JSON' : type === 'text' ? 'Text' : 'Form URL-Encoded'}
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder={
                      bodyType === 'json'
                        ? '{\n  "key": "value"\n}'
                        : bodyType === 'form-urlencoded'
                          ? 'key1=value1&key2=value2'
                          : 'Request body...'
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              label={loading ? 'Sending...' : 'Send Request'}
              onClick={sendRequest}
              variant="primary"
              disabled={loading}
            />
            <Button label="Load Sample API" onClick={loadSampleApi} variant="secondary" />
            <Button label="Clear" onClick={clear} variant="secondary" />
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className="space-y-4">
            {/* Status and Metadata */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Status</p>
                  <p className={`text-lg font-semibold ${response.success && response.status && response.status < 400
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}>
                    {response.status ? `${response.status} ${response.statusText}` : 'Error'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Response Time</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {response.responseTime}ms
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {!response.success && response.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-700 font-medium">Error:</p>
                <p className="text-red-600 text-sm">{response.error}</p>
              </div>
            )}

            {/* Response Headers */}
            {response.headers && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Response Headers
                  </label>
                  <CopyButton
                    text={JSON.stringify(response.headers, null, 2)}
                    label="Copy Headers"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 max-h-48 overflow-auto">
                  <pre className="text-xs font-mono text-slate-700">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Response Body */}
            {response.body && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Response Body
                  </label>
                  <CopyButton text={response.body} label="Copy Body" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                    {response.body}
                  </pre>
                </div>
                <div className="flex gap-2 items-center mt-3">
                  <label className="text-sm font-medium text-slate-700">
                    Generate code from response:
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as LanguageOption)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="jsdoc">JSDoc</option>
                    <option value="csharp">C#</option>
                    <option value="swift">Swift</option>
                    <option value="kotlin">Kotlin</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                  <button
                    onClick={generateCode}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    Generate Code →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> CORS restrictions may prevent requests to some APIs. Use APIs that allow cross-origin requests or test with public APIs.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}

export default ApiTester;
