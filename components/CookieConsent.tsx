'use client';

import { useState, useEffect, useRef } from 'react';

type ConsentValue = 'full' | 'anonymized' | 'rejected';

const CONSENT_KEY = 'cookie_consent';

function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (visible && regionRef.current) {
      const focusable = regionRef.current.querySelector<HTMLElement>('button, a');
      focusable?.focus();
    }
  }, [visible]);

  const handleConsent = (value: ConsentValue) => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent('cookie_consent_changed', { detail: value }));
    setVisible(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !regionRef.current) return;
    const focusable = regionRef.current.querySelectorAll<HTMLElement>('button, a[href]');
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={regionRef}
      role="region"
      aria-label="Cookie consent"
      onKeyDown={onKeyDown}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-950/15 backdrop-blur sm:bottom-5"
    >
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
        <p className="flex-1 text-sm leading-6 text-slate-600">
          Analytics are anonymized by default—no cookies or personal data.{' '}
          <a href="/privacy-policy" className="font-medium underline decoration-slate-300 underline-offset-2 hover:text-slate-900">Details</a>
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleConsent('rejected')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={() => handleConsent('anonymized')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Keep Anonymized
          </button>
          <button
            type="button"
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
