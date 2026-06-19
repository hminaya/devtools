'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS } from '../../config/tools';

const BASE_URL = 'https://developers.do';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  fullWidth?: boolean;
}

function ToolLayout({ title, description, children, fullWidth = false }: ToolLayoutProps) {
  const pathname = usePathname();
  const currentTool = TOOLS.find((tool) => tool.route === pathname);
  const relatedTools = currentTool
    ? TOOLS.filter((tool) => tool.category === currentTool.category && tool.route !== currentTool.route).slice(0, 5)
    : [];

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

        {relatedTools.length > 0 && (
          <section className="mt-8" aria-labelledby="related-tools-heading">
            <h2 id="related-tools-heading" className="text-xl font-bold text-slate-900 mb-4">
              Related tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedTools.map((tool) => {
                const content = (
                  <>
                    <div className="text-2xl">{tool.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{tool.description}</p>
                    </div>
                  </>
                );

                if (tool.external) {
                  return (
                    <a
                      key={tool.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
                      href={tool.route}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={tool.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
                    href={tool.route}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ToolLayout;
