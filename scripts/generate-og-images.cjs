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
    const route = readField(block, 'route');
    const category = readField(block, 'category');

    if (!id || !name || !route || !category) {
      return undefined;
    }

    return { id, name, route, category };
  }).filter((tool) => tool && tool.route.startsWith('/'));
}

function wrapText(value, maxLineLength, maxLines = 2) {
  const words = value.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxLineLength || !currentLine) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  if (lines.length <= maxLines) return lines;

  const visibleLines = lines.slice(0, maxLines);
  visibleLines[maxLines - 1] = `${visibleLines[maxLines - 1].slice(0, maxLineLength - 1)}…`;
  return visibleLines;
}

function createSvg(tool) {
  const titleLines = wrapText(tool.name, 27).map(escapeHtml);
  const category = escapeHtml(tool.category);
  const route = escapeHtml(`developers.do${tool.route}`);
  const titleStartY = titleLines.length === 1 ? 286 : 252;
  const titleMarkup = titleLines
    .map((line, index) => `<tspan x="296" y="${titleStartY + index * 68}">${line}</tspan>`)
    .join('');
  const subtitleY = titleLines.length === 1 ? 338 : 382;

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#020617"/>
  <rect x="120" y="219" width="128" height="128" rx="32" fill="#2563EB"/>
  <path d="M151 257L177 283L151 309" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M190 309H220" stroke="white" stroke-width="11" stroke-linecap="round"/>
  <text x="296" y="196" fill="#60A5FA" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">${category}</text>
  <text fill="white" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="800">${titleMarkup}</text>
  <text x="298" y="${subtitleY}" fill="#94A3B8" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="500">Free browser-based developer tool. No signup.</text>
  <text x="120" y="536" fill="#64748B" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="500">${route}</text>
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
