# Color Picker

> Pick colors, convert between HEX/RGB/HSL/HSV/CMYK, and browse curated palettes (Tailwind, Nord, Solarized, Dracula, and more)

Live tool: https://www.developers.do/tools/color-picker
Category: Code & Schemas

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Pick a color visually on the saturation/brightness field with a hue slider, or type a hex value directly — with or without the #, in 3- or 6-digit form. The tool instantly converts to RGB, HSL, HSV, and CMYK with one-click copy, and generates full harmony palettes from your pick: complementary, analogous, split-complementary, triadic, tetradic, monochromatic, tints, and shades, plus a ready-made web development scale. You can also search and browse curated palettes including Tailwind, Nord, Solarized, and Dracula.

## How to use

1. Drag on the gradient field for saturation and brightness; drag the hue slider for the base hue.
2. Or type a hex value like 7c3aed — shorthand (#abc) and a missing # are handled automatically.
3. Copy any format: HEX, RGB, HSL, HSV, or CMYK.
4. Scroll the generated harmonies and curated palettes for variations and ready-made scales.

## Important details

### Which format to use in CSS

HEX (#7c3aed) is compact and universal. rgb(124, 58, 237) is the same value with room for an alpha channel via rgb(124 58 237 / 0.5). hsl(262, 83%, 58%) is the easiest to adjust by hand — nudge lightness for hover states without touching the hue. CMYK is not a CSS color; it is included for print handoff.

### How the harmony palettes are built

Harmonies rotate the hue wheel by fixed angles: complementary adds 180°, analogous steps ±30°, triadic +120°, split-complementary ±150°, and tetradic +90° steps. Tints mix the color with white, shades with black, and monochromatic varies saturation and lightness at a fixed hue — the same math behind design-system color scales.

### Identifying a hex you found in the wild

Paste any value — say #7c3aed — to see exactly what it is (a violet, and incidentally Tailwind CSS’s violet-600) and to generate matching colors around it. Filtering the curated list by name is a fast way to grab a complete Tailwind, Nord, Solarized, or Dracula ramp.

## Frequently asked questions

### What color is #7c3aed?

A medium-bright violet: rgb(124, 58, 237) or hsl(262, 83%, 58%). It is also the exact value of Tailwind CSS’s violet-600 utility class.

### Is the CMYK conversion exact?

No. It is a mathematical RGB-to-CMYK transform without an ICC profile, so treat it as an estimate. Production print values depend on paper, ink, and the profile your print shop specifies.

### Does the picker support transparency?

The picker works in opaque color space. Add alpha in CSS yourself — rgb(124 58 237 / 0.5) or an 8-digit hex like #7c3aed80 — after copying the base value.

## References

- [MDN: CSS <color> data type](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)


## Related tools

- [JSON to TypeScript](https://www.developers.do/tools/json-to-typescript): Convert JSON to TypeScript interfaces
- [JSON to JSDoc](https://www.developers.do/tools/json-to-jsdoc): Convert JSON to JSDoc type definitions
- [JSON to C#](https://www.developers.do/tools/json-to-csharp): Convert JSON to C# classes
- [JSON to Swift](https://www.developers.do/tools/json-to-swift): Convert JSON to Swift structs
- [JSON to Kotlin](https://www.developers.do/tools/json-to-kotlin): Convert JSON to Kotlin data classes
