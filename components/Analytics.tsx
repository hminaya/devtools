'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GA_ID = 'G-M9WYKE9S07';

function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('config', GA_ID, { page_path: pathname });
  }, [pathname]);

  useEffect(() => {
    const handleConsentChange = (e: Event) => {
      const value = (e as CustomEvent<string>).detail;
      if (typeof window.gtag !== 'function') return;
      if (value === 'full') {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      } else {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
    };

    window.addEventListener('cookie_consent_changed', handleConsentChange);
    return () => window.removeEventListener('cookie_consent_changed', handleConsentChange);
  }, []);

  return null;
}

export default Analytics;
