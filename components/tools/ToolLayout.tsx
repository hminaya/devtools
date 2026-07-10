'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS } from '../../config/tools';
import { copyToClipboard } from '../../utils/clipboard';
import { BASE_URL, getCategorySlug } from '../../config/seo';
import { TOOL_SEO_CONTENT } from '../../config/toolSeoContent';
import { getToolIdFromPath, trackToolEvent } from '../../utils/analytics';

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
  const seoContent = currentTool ? TOOL_SEO_CONTENT[currentTool.id] : undefined;
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
    <div className="p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={fullWidth ? 'mx-auto' : 'max-w-4xl mx-auto'}>
        {currentTool && categorySlug && (
          <nav className="mb-5 text-sm text-slate-500" aria-label="Breadcrumb">
            <Link className="hover:text-slate-800" href="/">Developer Tools</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link className="hover:text-slate-800" href={`/tools/${categorySlug}`}>
              {currentTool.category}
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
        )}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {children}
        </div>

        {seoContent && (
          <article className="mt-8 space-y-8 rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
            <section aria-labelledby="about-this-tool-heading">
              <h2 id="about-this-tool-heading" className="text-2xl font-bold text-slate-900">
                About this {title.toLowerCase()}
              </h2>
              <p className="mt-3 leading-7 text-slate-700">{seoContent.overview}</p>
            </section>

            <section aria-labelledby="how-to-use-heading">
              <h2 id="how-to-use-heading" className="text-2xl font-bold text-slate-900">
                How to use the {title.toLowerCase()}
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-6 leading-7 text-slate-700">
                {seoContent.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </section>

            <section aria-labelledby="important-details-heading">
              <h2 id="important-details-heading" className="text-2xl font-bold text-slate-900">
                Important details
              </h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {seoContent.details.map((detail) => (
                  <div key={detail.title}>
                    <h3 className="text-lg font-semibold text-slate-900">{detail.title}</h3>
                    <p className="mt-2 leading-7 text-slate-700">{detail.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="frequently-asked-questions-heading">
              <h2 id="frequently-asked-questions-heading" className="text-2xl font-bold text-slate-900">
                Frequently asked questions
              </h2>
              <div className="mt-4 space-y-5">
                {seoContent.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    <p className="mt-1 leading-7 text-slate-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {seoContent.references && seoContent.references.length > 0 && (
              <p className="border-t border-slate-200 pt-5 text-sm text-slate-600">
                References:{' '}
                {seoContent.references.map((reference, index) => (
                  <span key={reference.href}>
                    {index > 0 && ', '}
                    <a className="font-medium text-blue-700 underline hover:text-blue-900" href={reference.href} target="_blank" rel="noopener noreferrer">
                      {reference.label}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </article>
        )}

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
