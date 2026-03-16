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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-slate-600">
          We use analytics to improve this site. By default, analytics are anonymized — no cookies, no personal data.
          You can accept full analytics or reject all tracking.{' '}
          <a href="/privacy-policy" className="underline hover:text-slate-800">Learn more</a>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleConsent('rejected')}
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 transition-colors"
          >
            Reject All
          </button>
          <button
            onClick={() => handleConsent('anonymized')}
            className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Keep Anonymized
          </button>
          <button
            onClick={() => handleConsent('full')}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
