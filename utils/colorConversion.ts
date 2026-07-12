export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorFormats {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  cmyk: CMYK;
}

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number, g: number, b: number;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

export function cmykToRgb(cmyk: CMYK): RGB {
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

export function getAllFormats(hex: string): ColorFormats {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const cmyk = rgbToCmyk(rgb);

  return {
    hex,
    rgb,
    hsl,
    hsv,
    cmyk,
  };
}

export interface PaletteColor {
  hex: string;
  name: string;
}

export interface ColorPalette {
  type: string;
  colors: PaletteColor[];
}

// Generate complementary colors (opposite on color wheel)
export function generateComplementary(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));
  const complementHue = (hsl.h + 180) % 360;
  const complementRgb = hslToRgb({ h: complementHue, s: hsl.s, l: hsl.l });

  return [
    { hex, name: 'Base' },
    { hex: rgbToHex(complementRgb), name: 'Complementary' },
  ];
}

// Generate analogous colors (adjacent on color wheel)
export function generateAnalogous(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));

  const analog1Hue = (hsl.h + 30) % 360;
  const analog2Hue = (hsl.h - 30 + 360) % 360;

  return [
    { hex: rgbToHex(hslToRgb({ h: analog2Hue, s: hsl.s, l: hsl.l })), name: 'Analogous -30°' },
    { hex, name: 'Base' },
    { hex: rgbToHex(hslToRgb({ h: analog1Hue, s: hsl.s, l: hsl.l })), name: 'Analogous +30°' },
  ];
}

// Generate triadic colors (120° apart)
export function generateTriadic(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));

  const triad1Hue = (hsl.h + 120) % 360;
  const triad2Hue = (hsl.h + 240) % 360;

  return [
    { hex, name: 'Base' },
    { hex: rgbToHex(hslToRgb({ h: triad1Hue, s: hsl.s, l: hsl.l })), name: 'Triadic +120°' },
    { hex: rgbToHex(hslToRgb({ h: triad2Hue, s: hsl.s, l: hsl.l })), name: 'Triadic +240°' },
  ];
}

// Generate tetradic/square colors (90° apart)
export function generateTetradic(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));

  const tetrad1Hue = (hsl.h + 90) % 360;
  const tetrad2Hue = (hsl.h + 180) % 360;
  const tetrad3Hue = (hsl.h + 270) % 360;

  return [
    { hex, name: 'Base' },
    { hex: rgbToHex(hslToRgb({ h: tetrad1Hue, s: hsl.s, l: hsl.l })), name: '+90°' },
    { hex: rgbToHex(hslToRgb({ h: tetrad2Hue, s: hsl.s, l: hsl.l })), name: '+180°' },
    { hex: rgbToHex(hslToRgb({ h: tetrad3Hue, s: hsl.s, l: hsl.l })), name: '+270°' },
  ];
}

// Generate split complementary colors
export function generateSplitComplementary(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));

  const complementHue = (hsl.h + 180) % 360;
  const split1Hue = (complementHue + 30) % 360;
  const split2Hue = (complementHue - 30 + 360) % 360;

  return [
    { hex, name: 'Base' },
    { hex: rgbToHex(hslToRgb({ h: split2Hue, s: hsl.s, l: hsl.l })), name: 'Split -30°' },
    { hex: rgbToHex(hslToRgb({ h: split1Hue, s: hsl.s, l: hsl.l })), name: 'Split +30°' },
  ];
}

// Generate monochromatic palette (varying lightness)
export function generateMonochromatic(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));

  return [
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: Math.min(90, hsl.l + 30) })), name: 'Lightest' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: Math.min(80, hsl.l + 15) })), name: 'Lighter' },
    { hex, name: 'Base' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: Math.max(20, hsl.l - 15) })), name: 'Darker' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: Math.max(10, hsl.l - 30) })), name: 'Darkest' },
  ];
}

// Generate shades (mixing with black)
export function generateShades(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));

  return [
    { hex, name: '100%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: hsl.l * 0.75 })), name: '75%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: hsl.l * 0.5 })), name: '50%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: hsl.l * 0.25 })), name: '25%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: 0 })), name: 'Black' },
  ];
}

// Generate tints (mixing with white)
export function generateTints(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));
  const lightnessRange = 100 - hsl.l;

  return [
    { hex, name: '100%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: hsl.l + lightnessRange * 0.25 })), name: '75%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: hsl.l + lightnessRange * 0.5 })), name: '50%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: hsl.l + lightnessRange * 0.75 })), name: '25%' },
    { hex: rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: 100 })), name: 'White' },
  ];
}

// Generate web development palette
export function generateWebDevelopment(hex: string): PaletteColor[] {
  const hsl = rgbToHsl(hexToRgb(hex));

  // Primary - the selected color
  const primary = hex;

  // Secondary - triadic color (120° away)
  const secondaryHue = (hsl.h + 120) % 360;
  const secondary = rgbToHex(hslToRgb({ h: secondaryHue, s: hsl.s, l: hsl.l }));

  // Accent - split complementary for contrast
  const accentHue = (hsl.h + 150) % 360;
  const accent = rgbToHex(hslToRgb({ h: accentHue, s: Math.min(100, hsl.s + 20), l: hsl.l }));

  // Success - green tones (120° is green)
  const success = rgbToHex(hslToRgb({ h: 140, s: 65, l: 45 }));

  // Warning - orange/yellow tones (40° is orange)
  const warning = rgbToHex(hslToRgb({ h: 40, s: 90, l: 55 }));

  // Error - red tones (0° is red)
  const error = rgbToHex(hslToRgb({ h: 0, s: 75, l: 50 }));

  // Info - blue tones (210° is blue)
  const info = rgbToHex(hslToRgb({ h: 210, s: 70, l: 55 }));

  // Background - very light version of primary
  const background = rgbToHex(hslToRgb({ h: hsl.h, s: Math.max(10, hsl.s - 40), l: 96 }));

  // Text - dark color with slight hint of primary hue
  const text = rgbToHex(hslToRgb({ h: hsl.h, s: Math.min(20, hsl.s), l: 15 }));

  return [
    { hex: primary, name: 'Primary' },
    { hex: secondary, name: 'Secondary' },
    { hex: accent, name: 'Accent' },
    { hex: success, name: 'Success' },
    { hex: warning, name: 'Warning' },
    { hex: error, name: 'Error' },
    { hex: info, name: 'Info' },
    { hex: background, name: 'Background' },
    { hex: text, name: 'Text' },
  ];
}

// Generate all palette types
export function generateAllPalettes(hex: string): ColorPalette[] {
  return [
    { type: 'Web Development', colors: generateWebDevelopment(hex) },
    { type: 'Complementary', colors: generateComplementary(hex) },
    { type: 'Analogous', colors: generateAnalogous(hex) },
    { type: 'Triadic', colors: generateTriadic(hex) },
    { type: 'Tetradic', colors: generateTetradic(hex) },
    { type: 'Split Complementary', colors: generateSplitComplementary(hex) },
    { type: 'Monochromatic', colors: generateMonochromatic(hex) },
    { type: 'Shades', colors: generateShades(hex) },
    { type: 'Tints', colors: generateTints(hex) },
  ];
}

/**
 * Curated, name-based design palettes. Each palette is a fixed collection
 * of labeled swatches (e.g. Tailwind, Nord, Solarized) rather than
 * the algorithmic derivations above.
 */
export interface CuratedPalette {
  name: string;
  description?: string;
  colors: PaletteColor[];
}

const tailwindShades = [
  '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950',
];

function tailwindFamily(name: string, shades: Record<string, string>): CuratedPalette {
  return {
    name: `Tailwind ${name}`,
    description: `Tailwind CSS ${name} family — 11 shades from 50 (lightest) to 950 (darkest).`,
    colors: tailwindShades.map((s) => ({
      hex: shades[s] ?? '#000000',
      name: `${name.toLowerCase()}-${s}`,
    })),
  };
}

const TAILWIND_FAMILIES: Record<string, Record<string, string>> = {
  Slate:    { '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0', '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b', '600': '#475569', '700': '#334155', '800': '#1e293b', '900': '#0f172a', '950': '#020617' },
  Gray:     { '50': '#f9fafb', '100': '#f3f4f6', '200': '#e5e7eb', '300': '#d1d5db', '400': '#9ca3af', '500': '#6b7280', '600': '#4b5563', '700': '#374151', '800': '#1f2937', '900': '#111827', '950': '#030712' },
  Zinc:     { '50': '#fafafa', '100': '#f4f4f5', '200': '#e4e4e7', '300': '#d4d4d8', '400': '#a1a1aa', '500': '#71717a', '600': '#52525b', '700': '#3f3f46', '800': '#27272a', '900': '#18181b', '950': '#09090b' },
  Neutral:  { '50': '#fafafa', '100': '#f5f5f5', '200': '#e5e5e5', '300': '#d4d4d4', '400': '#a3a3a3', '500': '#737373', '600': '#525252', '700': '#404040', '800': '#262626', '900': '#171717', '950': '#0a0a0a' },
  Stone:    { '50': '#fafaf9', '100': '#f5f5f4', '200': '#e7e5e4', '300': '#d6d3d1', '400': '#a8a29e', '500': '#78716c', '600': '#57534e', '700': '#44403c', '800': '#292524', '900': '#1c1917', '950': '#0c0a09' },
  Red:      { '50': '#fef2f2', '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5', '400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c', '800': '#991b1b', '900': '#7f1d1d', '950': '#450a0a' },
  Orange:   { '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74', '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c', '800': '#9a3412', '900': '#7c2d12', '950': '#431407' },
  Amber:    { '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f', '950': '#451a03' },
  Yellow:   { '50': '#fefce8', '100': '#fef9c3', '200': '#fef08a', '300': '#fde047', '400': '#facc15', '500': '#eab308', '600': '#ca8a04', '700': '#a16207', '800': '#854d0e', '900': '#713f12', '950': '#422006' },
  Lime:     { '50': '#f7fee7', '100': '#ecfccb', '200': '#d9f99d', '300': '#bef264', '400': '#a3e635', '500': '#84cc16', '600': '#65a30d', '700': '#4d7c0f', '800': '#3f6212', '900': '#365314', '950': '#1a2e05' },
  Green:    { '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac', '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d', '800': '#166534', '900': '#14532d', '950': '#052e16' },
  Emerald:  { '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22' },
  Teal:     { '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4', '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e', '800': '#115e59', '900': '#134e4a', '950': '#042f2e' },
  Cyan:     { '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9', '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63', '950': '#083344' },
  Sky:      { '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1', '800': '#075985', '900': '#0c4a6e', '950': '#082f49' },
  Blue:     { '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554' },
  Indigo:   { '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca', '800': '#3730a3', '900': '#312e81', '950': '#1e1b4b' },
  Violet:   { '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065' },
  Purple:   { '50': '#faf5ff', '100': '#f3e8ff', '200': '#e9d5ff', '300': '#d8b4fe', '400': '#c084fc', '500': '#a855f7', '600': '#9333ea', '700': '#7e22ce', '800': '#6b21a8', '900': '#581c87', '950': '#3b0764' },
  Fuchsia:  { '50': '#fdf4ff', '100': '#fae8ff', '200': '#f5d0fe', '300': '#f0abfc', '400': '#e879f9', '500': '#d946ef', '600': '#c026d3', '700': '#a21caf', '800': '#86198f', '900': '#701a75', '950': '#4a044e' },
  Pink:     { '50': '#fdf2f8', '100': '#fce7f3', '200': '#fbcfe8', '300': '#f9a8d4', '400': '#f472b6', '500': '#ec4899', '600': '#db2777', '700': '#be185d', '800': '#9d174d', '900': '#831843', '950': '#500724' },
  Rose:     { '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519' },
};

const NORD: CuratedPalette = {
  name: 'Nord',
  description: 'Arctic, north-bluish color palette inspired by the polar regions.',
  colors: [
    { hex: '#2e3440', name: 'nord0  — polar night' },
    { hex: '#3b4252', name: 'nord1  — polar night' },
    { hex: '#434c5e', name: 'nord2  — polar night' },
    { hex: '#4c566a', name: 'nord3  — polar night' },
    { hex: '#d8dee9', name: 'nord4  — snow storm' },
    { hex: '#e5e9f0', name: 'nord5  — snow storm' },
    { hex: '#eceff4', name: 'nord6  — snow storm' },
    { hex: '#8fbcbb', name: 'nord7  — frost' },
    { hex: '#88c0d0', name: 'nord8  — frost' },
    { hex: '#81a1c1', name: 'nord9  — frost' },
    { hex: '#5e81ac', name: 'nord10 — frost' },
    { hex: '#bf616a', name: 'nord11 — aurora (red)' },
    { hex: '#d08770', name: 'nord12 — aurora (orange)' },
    { hex: '#ebcb8b', name: 'nord13 — aurora (yellow)' },
    { hex: '#a3be8c', name: 'nord14 — aurora (green)' },
    { hex: '#b48ead', name: 'nord15 — aurora (purple)' },
  ],
};

const SOLARIZED: CuratedPalette[] = [
  {
    name: 'Solarized Light',
    description: 'Ethan Schoonover\'s precision palette for dark-on-light UIs.',
    colors: [
      { hex: '#002b36', name: 'base03' },
      { hex: '#073642', name: 'base02' },
      { hex: '#586e75', name: 'base01' },
      { hex: '#657b83', name: 'base00' },
      { hex: '#839496', name: 'base0' },
      { hex: '#93a1a1', name: 'base1' },
      { hex: '#eee8d5', name: 'base2' },
      { hex: '#fdf6e3', name: 'base3' },
      { hex: '#b58926', name: 'yellow' },
      { hex: '#cb4b16', name: 'orange' },
      { hex: '#dc322f', name: 'red' },
      { hex: '#d33682', name: 'magenta' },
      { hex: '#6c71c4', name: 'violet' },
      { hex: '#268bd2', name: 'blue' },
      { hex: '#2aa198', name: 'cyan' },
      { hex: '#859900', name: 'green' },
    ],
  },
  {
    name: 'Solarized Dark',
    description: 'Precision palette flipped for light-on-dark UIs.',
    colors: [
      { hex: '#fdf6e3', name: 'base3' },
      { hex: '#eee8d5', name: 'base2' },
      { hex: '#93a1a1', name: 'base1' },
      { hex: '#839496', name: 'base0' },
      { hex: '#657b83', name: 'base00' },
      { hex: '#586e75', name: 'base01' },
      { hex: '#073642', name: 'base02' },
      { hex: '#002b36', name: 'base03' },
      { hex: '#b58926', name: 'yellow' },
      { hex: '#cb4b16', name: 'orange' },
      { hex: '#dc322f', name: 'red' },
      { hex: '#d33682', name: 'magenta' },
      { hex: '#6c71c4', name: 'violet' },
      { hex: '#268bd2', name: 'blue' },
      { hex: '#2aa198', name: 'cyan' },
      { hex: '#859900', name: 'green' },
    ],
  },
];

const DRACULA: CuratedPalette = {
  name: 'Dracula',
  description: 'Dark theme palette for code editors and terminals.',
  colors: [
    { hex: '#282a36', name: 'background' },
    { hex: '#44475a', name: 'current line' },
    { hex: '#f8f8f2', name: 'foreground' },
    { hex: '#6272a4', name: 'comment' },
    { hex: '#ff79c6', name: 'pink' },
    { hex: '#bd93f9', name: 'purple' },
    { hex: '#50fa7b', name: 'green' },
    { hex: '#ffb86c', name: 'orange' },
    { hex: '#ff5555', name: 'red' },
    { hex: '#f1fa8c', name: 'yellow' },
    { hex: '#8be9fd', name: 'cyan' },
  ],
};

const GITHUB: CuratedPalette = {
  name: 'GitHub',
  description: 'GitHub\'s default light and accent palette.',
  colors: [
    { hex: '#ffffff', name: 'canvas (white)' },
    { hex: '#f6f8fa', name: 'canvas subtle' },
    { hex: '#eaeef2', name: 'border' },
    { hex: '#d0d7de', name: 'border muted' },
    { hex: '#57606a', name: 'fg muted' },
    { hex: '#24292f', name: 'fg default' },
    { hex: '#0969da', name: 'accent (blue)' },
    { hex: '#1a7f37', name: 'success (green)' },
    { hex: '#9a6700', name: 'attention (amber)' },
    { hex: '#bc4c00', name: 'severe (orange)' },
    { hex: '#cf222e', name: 'danger (red)' },
    { hex: '#8250df', name: 'done (purple)' },
  ],
};

const MATERIAL: CuratedPalette = {
  name: 'Material Design',
  description: 'Google Material Design base color palette.',
  colors: [
    { hex: '#f44336', name: 'Red 500' },
    { hex: '#e91e63', name: 'Pink 500' },
    { hex: '#9c27b0', name: 'Purple 500' },
    { hex: '#673ab7', name: 'Deep Purple 500' },
    { hex: '#3f51b5', name: 'Indigo 500' },
    { hex: '#2196f3', name: 'Blue 500' },
    { hex: '#03a9f4', name: 'Light Blue 500' },
    { hex: '#00bcd4', name: 'Cyan 500' },
    { hex: '#009688', name: 'Teal 500' },
    { hex: '#4caf50', name: 'Green 500' },
    { hex: '#8bc34a', name: 'Light Green 500' },
    { hex: '#cddc39', name: 'Lime 500' },
    { hex: '#ffeb3b', name: 'Yellow 500' },
    { hex: '#ffc107', name: 'Amber 500' },
    { hex: '#ff9800', name: 'Orange 500' },
    { hex: '#795548', name: 'Brown 500' },
    { hex: '#9e9e9e', name: 'Grey 500' },
    { hex: '#607d8b', name: 'Blue Grey 500' },
  ],
};

const ONE_DARK: CuratedPalette = {
  name: 'One Dark',
  description: 'Atom One Dark theme palette, popular in code editors.',
  colors: [
    { hex: '#282c34', name: 'bg' },
    { hex: '#abb2bf', name: 'fg' },
    { hex: '#5c6370', name: 'comment' },
    { hex: '#e06c75', name: 'red' },
    { hex: '#d19a66', name: 'orange' },
    { hex: '#e5c07b', name: 'yellow' },
    { hex: '#98c379', name: 'green' },
    { hex: '#56b6c2', name: 'cyan' },
    { hex: '#61afef', name: 'blue' },
    { hex: '#c678dd', name: 'purple' },
  ],
};

export const CURATED_PALETTES: CuratedPalette[] = [
  tailwindFamily('Slate', TAILWIND_FAMILIES.Slate!),
  tailwindFamily('Gray', TAILWIND_FAMILIES.Gray!),
  tailwindFamily('Zinc', TAILWIND_FAMILIES.Zinc!),
  tailwindFamily('Neutral', TAILWIND_FAMILIES.Neutral!),
  tailwindFamily('Stone', TAILWIND_FAMILIES.Stone!),
  tailwindFamily('Red', TAILWIND_FAMILIES.Red!),
  tailwindFamily('Orange', TAILWIND_FAMILIES.Orange!),
  tailwindFamily('Amber', TAILWIND_FAMILIES.Amber!),
  tailwindFamily('Yellow', TAILWIND_FAMILIES.Yellow!),
  tailwindFamily('Lime', TAILWIND_FAMILIES.Lime!),
  tailwindFamily('Green', TAILWIND_FAMILIES.Green!),
  tailwindFamily('Emerald', TAILWIND_FAMILIES.Emerald!),
  tailwindFamily('Teal', TAILWIND_FAMILIES.Teal!),
  tailwindFamily('Cyan', TAILWIND_FAMILIES.Cyan!),
  tailwindFamily('Sky', TAILWIND_FAMILIES.Sky!),
  tailwindFamily('Blue', TAILWIND_FAMILIES.Blue!),
  tailwindFamily('Indigo', TAILWIND_FAMILIES.Indigo!),
  tailwindFamily('Violet', TAILWIND_FAMILIES.Violet!),
  tailwindFamily('Purple', TAILWIND_FAMILIES.Purple!),
  tailwindFamily('Fuchsia', TAILWIND_FAMILIES.Fuchsia!),
  tailwindFamily('Pink', TAILWIND_FAMILIES.Pink!),
  tailwindFamily('Rose', TAILWIND_FAMILIES.Rose!),
  NORD,
  ...SOLARIZED,
  DRACULA,
  GITHUB,
  MATERIAL,
  ONE_DARK,
];
