import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { TOOLS } from '../config/tools';
import { TOOL_SEO_CONTENT } from '../config/toolSeoContent';

const BASE_URL = 'https://www.developers.do';

function publicUrl(route: string): string {
  return route.startsWith('/') ? `${BASE_URL}${route}` : route;
}

function toolMarkdown(tool: (typeof TOOLS)[number]): string {
  const seo = TOOL_SEO_CONTENT[tool.id];
  const lines = [
    `# ${tool.name}`,
    '',
    `> ${tool.description}`,
    '',
    `Live tool: ${publicUrl(tool.route)}`,
    `Category: ${tool.category}`,
    '',
    tool.sendsDataTo
      ? `Free and browser-based, but not fully offline: input is sent from the browser to ${tool.sendsDataTo}. It is not sent to a developers.do server.`
      : 'Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.',
  ];

  if (seo) {
    lines.push('', '## Overview', '', seo.overview, '', '## How to use', '');
    seo.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    lines.push('', '## Important details', '');
    for (const detail of seo.details) {
      lines.push(`### ${detail.title}`, '', detail.body, '');
    }
    if (seo.faqs.length > 0) {
      lines.push('## Frequently asked questions', '');
      for (const faq of seo.faqs) {
        lines.push(`### ${faq.question}`, '', faq.answer, '');
      }
    }
    if (seo.references && seo.references.length > 0) {
      lines.push('## References', '');
      for (const reference of seo.references) {
        lines.push(`- [${reference.label}](${reference.href})`);
      }
      lines.push('');
    }
  }

  const related = TOOLS.filter((item) => item.category === tool.category && item.id !== tool.id && !item.external).slice(0, 5);
  if (related.length > 0) {
    lines.push('', '## Related tools', '');
    for (const item of related) {
      lines.push(`- [${item.name}](${publicUrl(item.route)}): ${item.description}`);
    }
    lines.push('');
  }

  return `${lines.join('\n').trim()}\n`;
}

const categories = Array.from(new Set(TOOLS.map((tool) => tool.category)));

const llms = [
  '# DevTools by developers.do',
  '',
  '> A collection of free developer tools that run client-side in your browser. No backend. Anonymized analytics used to improve the site.',
  '',
  'DevTools provides utilities for developers including formatters, converters, generators, AI-powered text tools, SAML utilities, and security tools. User-entered data is processed locally in the browser and is not uploaded to a developers.do server. A few tools exist to call an external API (iOS App Lookup, API Tester) and send input from the browser directly to that third party.',
  '',
  'Markdown mirrors of every tool page hosted on this site are available for AI consumption by appending .md to the tool URL (for example, https://www.developers.do/tools/json-prettifier.md). Tools listed below with an off-site URL have no mirror.',
  '',
  '## Tools',
  '',
  ...categories.flatMap((category) => [
    `### ${category}`,
    '',
    ...TOOLS.filter((tool) => tool.category === category).map(
      (tool) => `- [${tool.name}](${publicUrl(tool.route)}): ${tool.description}`
    ),
    '',
  ]),
].join('\n');

const llmsFull = [
  '# DevTools by developers.do - Complete Documentation',
  '',
  '> A collection of free developer tools that run client-side in your browser. No backend. Anonymized analytics are used to improve the site.',
  '',
  '## About DevTools',
  '',
  'DevTools is a suite of browser-based utilities for software developers built with privacy as a core principle.',
  '',
  '- Client-side: tools run in the browser using JavaScript, WebAssembly, and Web APIs.',
  '- No backend: tool input is never transmitted to a developers.do server. The few tools whose purpose is to call an external API (iOS App Lookup, API Tester) send input directly from the browser to that third party.',
  '- Open source: built with Next.js, React, TypeScript, and Tailwind CSS.',
  '- Website: https://www.developers.do',
  '',
  '## Tool Categories',
  '',
  ...categories.flatMap((category) => {
    const categorySlug = category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return [
      `### ${category}`,
      '',
      `Category URL: ${BASE_URL}/tools/${categorySlug}`,
      '',
      ...TOOLS.filter((tool) => tool.category === category).flatMap((tool) => {
        const lines = [`#### ${tool.name}`, `URL: ${publicUrl(tool.route)}`];
        if (!tool.external) {
          lines.push(`Markdown: ${publicUrl(tool.route)}.md`);
        }
        lines.push('', tool.description, '');
        const seo = TOOL_SEO_CONTENT[tool.id];

        if (seo) {
          lines.push(seo.overview, '', 'How to use:');
          seo.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
          lines.push('');
          for (const detail of seo.details) {
            lines.push(`${detail.title}: ${detail.body}`, '');
          }
          if (seo.faqs.length > 0) {
            lines.push('FAQs:');
            for (const faq of seo.faqs) {
              lines.push(`- Q: ${faq.question}`, `  A: ${faq.answer}`);
            }
            lines.push('');
          }
          if (seo.references && seo.references.length > 0) {
            lines.push(`References: ${seo.references.map((ref) => `${ref.label} (${ref.href})`).join(', ')}`, '');
          }
        }

        return lines;
      }),
    ];
  }),
].join('\n');

writeFileSync(join(process.cwd(), 'public/llms.txt'), `${llms.trim()}\n`);
writeFileSync(join(process.cwd(), 'public/llms-full.txt'), `${llmsFull.trim()}\n`);

// Per-tool markdown mirrors at /tools/<id>.md
const markdownDir = join(process.cwd(), 'public/tools');
mkdirSync(markdownDir, { recursive: true });
const internalTools = TOOLS.filter((tool) => !tool.external);
const markdownFiles = new Set(internalTools.map((tool) => `${tool.id}.md`));
for (const tool of internalTools) {
  writeFileSync(join(markdownDir, `${tool.id}.md`), toolMarkdown(tool));
}
for (const file of readdirSync(markdownDir)) {
  if (file.endsWith('.md') && !markdownFiles.has(file)) {
    unlinkSync(join(markdownDir, file));
  }
}

const enriched = TOOLS.filter((tool) => TOOL_SEO_CONTENT[tool.id]).length;
console.log(`Generated llms.txt and llms-full.txt for ${TOOLS.length} tools (${enriched} with full documentation).`);
console.log(`Generated ${markdownFiles.size} per-tool markdown files in public/tools/.`);
