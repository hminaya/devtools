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
    <div className="px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={fullWidth ? 'mx-auto max-w-[1500px]' : 'mx-auto max-w-5xl'}>
        {currentTool && categorySlug && (
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
            <Link className="hover:text-slate-900" href="/" prefetch={false}>Home</Link>
            <span className="text-slate-300" aria-hidden="true">/</span>
            <Link className="hover:text-slate-900" href={`/tools/${categorySlug}`} prefetch={false}>
              {currentTool.category}
            </Link>
            <span className="text-slate-300" aria-hidden="true">/</span>
            <span className="text-slate-700" aria-current="page">{title}</span>
          </nav>
        )}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl leading-7 text-slate-500">{description}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:pt-1">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
              onClick={handleCopyLink}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 [&::-webkit-details-marker]:hidden">
                Share <span aria-hidden="true">⌄</span>
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleShareClick(link.name)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          {children}
        </div>

        {seoContent && (
          <article className="mx-auto mt-12 max-w-4xl space-y-10 border-t border-slate-200 py-10">
            <section aria-labelledby="about-this-tool-heading">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Guide</p>
              <h2 id="about-this-tool-heading" className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                About this {title.toLowerCase()}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{seoContent.overview}</p>
            </section>

            <section aria-labelledby="how-to-use-heading">
              <h2 id="how-to-use-heading" className="text-2xl font-black tracking-tight text-slate-950">
                How to use the {title.toLowerCase()}
              </h2>
              <ol className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
                {seoContent.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 py-4 leading-7 text-slate-600">
                    <span className="w-5 shrink-0 text-sm font-bold text-slate-400">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="important-details-heading">
              <h2 id="important-details-heading" className="text-2xl font-black tracking-tight text-slate-950">
                Important details
              </h2>
              <div className="mt-5 grid gap-8 md:grid-cols-2">
                {seoContent.details.map((detail) => (
                  <div key={detail.title}>
                    <h3 className="text-lg font-bold text-slate-950">{detail.title}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{detail.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="frequently-asked-questions-heading">
              <h2 id="frequently-asked-questions-heading" className="text-2xl font-black tracking-tight text-slate-950">
                Frequently asked questions
              </h2>
              <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
                {seoContent.faqs.map((faq) => (
                  <div key={faq.question} className="py-5">
                    <h3 className="font-bold text-slate-950">{faq.question}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
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

        {relatedTools.length > 0 && (
          <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="related-tools-heading">
            <h2 id="related-tools-heading" className="mb-5 text-2xl font-black tracking-tight text-slate-950">
              Related tools
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {relatedTools.map((tool) => {
                const content = (
                  <>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl">{tool.icon}</div>
                    <div>
                      <h3 className="font-bold text-slate-900">{tool.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{tool.description}</p>
                    </div>
                  </>
                );

                if (tool.external) {
                  return (
                    <a
                      key={tool.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
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
                    prefetch={false}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
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
