import type { Metadata } from 'next';
import Link from 'next/link';
import RandomToolCard from '../components/home/RandomToolCard';
import Card from '../components/shared/Card';
import { TOOLS } from '../config/tools';
import { TOOL_CATEGORIES } from '../config/seo';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Developer Tools</h1>
          <p className="text-slate-600 text-lg">A collection of useful utilities for developers</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950"
              href={`/tools/${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <RandomToolCard />

          {TOOLS.map((tool) => (
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
