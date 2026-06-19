const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const toolsSource = fs.readFileSync(path.join(process.cwd(), 'config/tools.ts'), 'utf8');
const outputDir = path.join(process.cwd(), 'public/og/tools');
const svgDir = path.join(outputDir, 'svg');

fs.mkdirSync(svgDir, { recursive: true });

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

    return { id, name, description, route, icon, category };
  }).filter((tool) => tool && tool.route.startsWith('/'));
}

function truncate(value, maxLength) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function createSvg(tool) {
  const title = escapeHtml(truncate(tool.name, 34));
  const description = escapeHtml(truncate(tool.description, 82));
  const category = escapeHtml(tool.category);
  const route = escapeHtml(`developers.do${tool.route}`);

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0f172a"/>
  <rect x="72" y="72" width="1056" height="486" rx="32" fill="#f8fafc"/>
  <rect x="164" y="150" width="132" height="132" rx="28" fill="#dbeafe"/>
  <text x="230" y="237" text-anchor="middle" fill="#1e293b" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="800">${escapeHtml(tool.icon)}</text>
  <text x="336" y="180" fill="#2563eb" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800">${category}</text>
  <text x="336" y="250" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="800">${title}</text>
  <text x="336" y="318" fill="#334155" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600">${description}</text>
  <rect x="164" y="408" width="872" height="70" rx="16" fill="#e2e8f0"/>
  <text x="196" y="453" fill="#1e293b" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">${route}</text>
  <text x="164" y="528" fill="#475569" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600">Free browser-based developer tool. No upload required.</text>
</svg>`;
}

const tools = parseTools(toolsSource);

for (const tool of tools) {
  const svgPath = path.join(svgDir, `${tool.id}.svg`);
  const pngPath = path.join(outputDir, `${tool.id}.png`);

  fs.writeFileSync(svgPath, createSvg(tool));
  execFileSync('rsvg-convert', ['-w', '1200', '-h', '630', svgPath, '-o', pngPath]);
}

console.log(`Generated ${tools.length} tool OG images.`);
