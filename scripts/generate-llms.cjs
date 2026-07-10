const fs = require('fs');
const path = require('path');

const toolsSource = fs.readFileSync(path.join(process.cwd(), 'config/tools.ts'), 'utf8');

function parseTools(source) {
  const blocks = source.match(/  \{[\s\S]*?\n  \}/g) || [];
  const readField = (block, field) => block.match(new RegExp(`${field}: (['"])([\\s\\S]*?)\\1`))?.[2];

  return blocks.map((block) => {
    const id = readField(block, 'id');
    const name = readField(block, 'name');
    const description = readField(block, 'description');
    const route = readField(block, 'route');
    const icon = readField(block, 'icon');
    const category = readField(block, 'category');

    if (!id || !name || !description || !route || !icon || !category) {
      return undefined;
    }

    return {
      id,
      name,
      description,
      route,
      icon,
      category,
      external: block.includes('external: true'),
    };
  }).filter(Boolean);
}

function publicUrl(route) {
  return route.startsWith('/') ? `https://www.developers.do${route}` : route;
}

const tools = parseTools(toolsSource);
const categories = Array.from(new Set(tools.map((tool) => tool.category)));

const llms = [
  '# DevTools by developers.do',
  '',
  '> A collection of free developer tools that run 100% client-side in your browser. No backend. All processing happens locally. Anonymized analytics used to improve the site.',
  '',
  'DevTools provides utilities for developers including formatters, converters, generators, AI-powered text tools, SAML utilities, and security tools. User-entered data is processed locally in the browser and is not uploaded to a server.',
  '',
  '## Tools',
  '',
  ...categories.flatMap((category) => [
    `### ${category}`,
    '',
    ...tools
      .filter((tool) => tool.category === category)
      .map((tool) => `- [${tool.name}](${publicUrl(tool.route)}): ${tool.description}`),
    '',
  ]),
].join('\n');

const llmsFull = [
  '# DevTools by developers.do - Complete Documentation',
  '',
  '> A collection of free developer tools that run 100% client-side in your browser. No backend. All tool processing happens locally on the user device. Anonymized analytics are used to improve the site.',
  '',
  '## About DevTools',
  '',
  'DevTools is a suite of browser-based utilities for software developers built with privacy as a core principle.',
  '',
  '- 100% client-side: tools run in the browser using JavaScript, WebAssembly, and Web APIs.',
  '- No upload required: tool input is not transmitted to a backend.',
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
      `Category URL: https://www.developers.do/tools/${categorySlug}`,
      '',
      ...tools
        .filter((tool) => tool.category === category)
        .flatMap((tool) => [
          `#### ${tool.name}`,
          `URL: ${publicUrl(tool.route)}`,
          '',
          tool.description,
          '',
        ]),
    ];
  }),
].join('\n');

fs.writeFileSync(path.join(process.cwd(), 'public/llms.txt'), `${llms.trim()}\n`);
fs.writeFileSync(path.join(process.cwd(), 'public/llms-full.txt'), `${llmsFull.trim()}\n`);

console.log(`Generated llms.txt and llms-full.txt for ${tools.length} tools.`);
