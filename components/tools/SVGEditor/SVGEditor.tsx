'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import CodeDisplay from '../../shared/CodeDisplay';
import CopyButton from '../../shared/CopyButton';
import Button from '../../shared/Button';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100">
  <rect x="10" y="10" width="180" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="60" cy="50" r="20" fill="#3b82f6"/>
  <text x="100" y="55" fill="#1e3a8a" font-family="sans-serif" font-size="14" text-anchor="middle">SVG Editor</text>
</svg>`;

function sanitizeSvg(svg: string): { ok: boolean; html?: string; error?: string } {
  const trimmed = svg.trim();
  if (!trimmed) return { ok: false, error: 'Empty input' };
  // Strip XML processing instructions and DOCTYPE for safety.
  let clean = trimmed.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '');
  // Quick sanity: must start with <svg or contain <svg ...>
  if (!/<svg[\s>]/i.test(clean)) return { ok: false, error: 'No <svg> root element found' };
  // Reject obviously malicious content.
  if (/<script[\s>]/i.test(clean) || /on\w+\s*=/i.test(clean)) {
    return { ok: false, error: 'SVG contains forbidden tags (script/event handlers) for safety.' };
  }
  // Ensure top-level <svg> has xmlns.
  if (!/xmlns\s*=/.test(clean)) {
    clean = clean.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return { ok: true, html: clean };
}

function SVGEditor() {
  const [code, setCode] = useState(SAMPLE);
  const [showBorder, setShowBorder] = useState(true);

  const rendered = useMemo(() => sanitizeSvg(code), [code]);

  return (
    <ToolLayout
      title="SVG Editor"
      description="Edit SVG code on the left, see the live preview on the right. Strips scripts and event handlers for safety; adjusts missing xmlns attributes."
      fullWidth
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button label="Load Sample" onClick={() => setCode(SAMPLE)} variant="secondary" />
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showBorder}
              onChange={(e) => setShowBorder(e.target.checked)}
              className="rounded border-slate-300"
            />
            Border around preview
          </label>
          <div className="flex-1" />
          {rendered.ok && rendered.html && <CopyButton text={rendered.html} label="Copy SVG" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SVG code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={20}
              spellCheck={false}
              className="w-full resize-y rounded-xl border px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 border-slate-300 bg-white"
              placeholder="<svg viewBox='0 0 100 100'>...</svg>"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Live preview</label>
            <div
              className={`rounded-xl bg-white p-6 min-h-[300px] flex items-center justify-center ${
                showBorder ? 'border border-slate-300' : ''
              }`}
            >
              {rendered.ok ? (
                <div dangerouslySetInnerHTML={{ __html: rendered.html! }} className="max-w-full max-h-[480px] overflow-auto" />
              ) : (
                <div className="text-red-700 text-sm">{rendered.error}</div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          The preview strips <code>&lt;script&gt;</code> tags and event-handler attributes (e.g. <code>onclick=</code>) for safety.
          Inline XML declarations and DOCTYPE are dropped. Missing <code>xmlns</code> is added automatically.
        </p>
      </div>
    </ToolLayout>
  );
}

export default SVGEditor;