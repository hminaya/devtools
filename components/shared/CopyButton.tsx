"use client";

import { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md font-medium hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}

export default CopyButton;
