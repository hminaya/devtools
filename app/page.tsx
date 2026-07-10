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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Free developer tools that work in your browser</h1>
          <p className="text-slate-600 text-lg leading-8">
            Format data, test patterns and APIs, inspect authentication payloads, and generate code without creating an account.
            Most tools process pasted data locally; tools that retrieve external data make requests only when you run them.
          </p>
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

        <section className="mb-10 grid gap-4 md:grid-cols-3" aria-label="Why use developers.do">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Privacy-conscious by design</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Formatting, conversion, generation, and inspection happen in the browser wherever the tool supports local processing.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Useful without signup</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Open a tool, paste or generate input, and copy the result. There is no account wall around core functionality.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-900">Built for debugging</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Actionable errors, samples, format controls, and related utilities help you move from an invalid input to a usable result.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
