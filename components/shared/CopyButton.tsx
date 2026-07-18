"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { copyToClipboard } from '../../utils/clipboard';
import { getToolIdFromPath, trackToolEvent } from '../../utils/analytics';

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const accessibleLabel = label || 'Copy';

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      trackToolEvent('tool_copy', {
        tool_id: getToolIdFromPath(pathname),
        action: accessibleLabel || 'Copy',
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${accessibleLabel} (copied)` : accessibleLabel}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}

export default CopyButton;
