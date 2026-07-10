'use client';

import { useState, useEffect } from 'react';

type ConsentValue = 'full' | 'anonymized' | 'rejected';

const CONSENT_KEY = 'cookie_consent';

function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    };

    checkConsent();
    window.addEventListener('show_cookie_preferences', checkConsent);
    return () => window.removeEventListener('show_cookie_preferences', checkConsent);
  }, []);

  const handleConsent = (value: ConsentValue) => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent('cookie_consent_changed', { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-950/15 backdrop-blur sm:bottom-5">
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
        <p className="flex-1 text-sm leading-6 text-slate-600">
          Analytics are anonymized by default—no cookies or personal data.{' '}
          <a href="/privacy-policy" className="font-medium underline decoration-slate-300 underline-offset-2 hover:text-slate-900">Details</a>
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            onClick={() => handleConsent('rejected')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            Reject All
          </button>
          <button
            onClick={() => handleConsent('anonymized')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Keep Anonymized
          </button>
          <button
            onClick={() => handleConsent('full')}
            className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
