'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS } from '../../config/tools';
import { copyToClipboard } from '../../utils/clipboard';
import { getCategorySlug } from '../../config/seo';
import { getToolIdFromPath, trackToolEvent } from '../../utils/analytics';

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
  const [copied, setCopied] = useState(false);
  const toolUrl = `${BASE_URL}${pathname}`;
  const toolId = getToolIdFromPath(pathname);
  const shareText = `${title} - ${description}`;
  const encodedUrl = encodeURIComponent(toolUrl);
  const encodedText = encodeURIComponent(shareText);
  const shareLinks = [
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${toolUrl}`)}`,
    },
    {
      name: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    },
  ];

  const handleCopyLink = async () => {
    const success = await copyToClipboard(toolUrl);

    if (success) {
      trackToolEvent('tool_copy', {
        tool_id: toolId,
        action: 'Copy link',
      });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareClick = (network: string) => {
    trackToolEvent('tool_action', {
      tool_id: toolId,
      action: 'Share tool',
      label: network,
    });
  };

  const categorySlug = currentTool ? getCategorySlug(currentTool.category) : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
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
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Developer Tools',
            item: BASE_URL,
          },
          ...(currentTool && categorySlug
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: currentTool.category,
                  item: `${BASE_URL}/tools/${categorySlug}`,
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: currentTool && categorySlug ? 3 : 2,
            name: title,
            item: `${BASE_URL}${pathname}`,
          },
        ],
      },
    ],
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

        <section
          className="mt-4 flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          aria-label={`Share ${title}`}
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Share this tool</h2>
            <p className="text-sm text-slate-500">Send the direct link or post it to your network.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShareClick(link.name)}
              >
                {link.name}
              </a>
            ))}
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleCopyLink}
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </section>

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
