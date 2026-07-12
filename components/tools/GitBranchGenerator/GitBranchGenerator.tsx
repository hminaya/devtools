'use client';

import { useMemo, useState } from 'react';
import ToolLayout from '../ToolLayout';
import CopyButton from '../../shared/CopyButton';
import {
  BRANCH_PREFIXES,
  generateBranchName,
  generateVariants,
  slugifyBranchText,
  type BranchPrefix,
} from '../../../utils/gitBranch';

function GitBranchGenerator() {
  const [text, setText] = useState('Add OAuth2 login with Google');
  const [prefix, setPrefix] = useState<BranchPrefix>('feat');
  const [ticketId, setTicketId] = useState('PROJ-1234');
  const [suffix, setSuffix] = useState('');

  const primary = useMemo(
    () => generateBranchName(text, { prefix, ticketId: ticketId.trim() || undefined, includeId: suffix.trim() || undefined, maxBranchLength: 60 }),
    [text, prefix, ticketId, suffix]
  );

  const variants = useMemo(
    () => generateVariants(text, ticketId.trim() || undefined),
    [text, ticketId]
  );

  const slug = useMemo(() => slugifyBranchText(text), [text]);

  return (
    <ToolLayout
      title="Git Branch Name Generator"
      description="Convert a feature description into a clean, git-safe branch name with optional prefix (feat, fix, etc.) and ticket id"
      fullWidth
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Feature description</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Add OAuth2 login with Google"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">
              Slug preview: <code className="font-mono">{slug || '—'}</code>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prefix</label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as BranchPrefix)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BRANCH_PREFIXES.map((p) => (
                  <option key={p} value={p} className="capitalize">{p === 'none' ? '(none)' : p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ticket id</label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g. JIRA-456"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Optional suffix</label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="e.g. v2 or 1234"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Primary result */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Your branch name</div>
              <code className="font-mono text-lg sm:text-xl font-bold text-slate-900 break-all">{primary || <span className="text-slate-400">(enter text)</span>}</code>
            </div>
            {primary && <CopyButton text={primary} label="Copy" />}
          </div>
        </div>

        {/* Copy-paste commands */}
        {primary && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Create branch</div>
              <code className="font-mono text-sm text-slate-900 break-all">git checkout -b {primary}</code>
              <div className="mt-2"><CopyButton text={`git checkout -b ${primary}`} label="Copy command" /></div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Push to remote</div>
              <code className="font-mono text-sm text-slate-900 break-all">git push -u origin {primary}</code>
              <div className="mt-2"><CopyButton text={`git push -u origin ${primary}`} label="Copy command" /></div>
            </div>
          </div>
        )}

        {/* Variants */}
        {variants.length > 0 && (
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">
              Try other prefixes ({variants.length} variants)
            </summary>
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {variants.map((v) => (
                <div
                  key={v}
                  className="group flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <code className="font-mono text-sm text-slate-900 break-all flex-1 min-w-0">{v}</code>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={v} label="" />
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </ToolLayout>
  );
}

export default GitBranchGenerator;