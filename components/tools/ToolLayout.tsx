'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const BASE_URL = 'https://developers.do';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  fullWidth?: boolean;
}

function ToolLayout({ title, description, children, fullWidth = false }: ToolLayoutProps) {
  const pathname = usePathname();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url: `${BASE_URL}${pathname}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'developers.do',
      url: BASE_URL,
    },
  };

  return (
    <div className="p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={fullWidth ? 'mx-auto' : 'max-w-4xl mx-auto'}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ToolLayout;
