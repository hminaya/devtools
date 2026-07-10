import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Card from '../../../components/shared/Card';
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
    <div className="p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link className="hover:text-slate-800" href="/">Developer Tools</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span>{category.name}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{category.name} Developer Tools</h1>
          <p className="text-slate-600 text-lg max-w-3xl">{category.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              icon={tool.icon}
              title={tool.name}
              description={tool.description}
              href={tool.route}
              external={tool.external}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
