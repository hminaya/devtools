import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BASE_URL,
  DEFAULT_OG_IMAGE,
  TOOL_CATEGORIES,
  getCategoryBySlug,
  getInternalCategoryTools,
  getToolsByCategory,
} from '../../../config/seo';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export function generateStaticParams() {
  return TOOL_CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  const title = `${category.name} Developer Tools`;
  const url = `/tools/${category.slug}`;
  const hasInternalTools = getInternalCategoryTools(category.name).length > 0;

  return {
    title,
    description: category.description,
    alternates: {
      canonical: url,
    },
    robots: hasInternalTools ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'website',
      url,
      title,
      description: category.description,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${category.name} developer tools` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: category.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const tools = getToolsByCategory(category.name);
  const internalTools = getInternalCategoryTools(category.name);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Developer Tools',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: `${BASE_URL}/tools/${category.slug}`,
      },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Developer Tools`,
    description: category.description,
    url: `${BASE_URL}/tools/${category.slug}`,
    mainEntity: internalTools.map((tool) => ({
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: `${BASE_URL}${tool.route}`,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    })),
  };

  return (
    <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="mx-auto max-w-5xl">
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
          <Link className="hover:text-slate-900" href="/" prefetch={false}>Home</Link>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-slate-700">{category.name}</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950">{category.name} tools</h1>
            <span className="text-sm tabular-nums text-slate-400">{tools.length}</span>
          </div>
          <p className="mt-3 max-w-3xl leading-7 text-slate-500">{category.description}</p>
        </div>

        <div className="grid border-t border-slate-200 sm:grid-cols-2 sm:gap-x-8">
          {tools.map((tool) => {
            const content = (
              <>
                <span className="w-7 shrink-0 text-center text-lg" aria-hidden="true">{tool.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-800 group-hover:text-slate-950">{tool.name}</span>
                  <span className="mt-0.5 block truncate text-sm text-slate-500">{tool.description}</span>
                </span>
                <span className="text-slate-300 group-hover:text-slate-600" aria-hidden="true">{tool.external ? '↗' : '→'}</span>
              </>
            );

            return tool.external ? (
              <a key={tool.id} href={tool.route} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 border-b border-slate-200 py-4">
                {content}
              </a>
            ) : (
              <Link key={tool.id} href={tool.route} prefetch={false} className="group flex items-center gap-3 border-b border-slate-200 py-4">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
