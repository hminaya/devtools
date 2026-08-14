# SVG Path Visualizer

> Paste an SVG path d attribute and see it rendered instantly — includes presets (curve, star, arc, bezier), adjustable stroke/fill colors, and an optional grid overlay

Live tool: https://www.developers.do/tools/svg-path-visualizer
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Paste just the d attribute of an SVG path — the string of commands and coordinates — and watch it render live as you type. All commands are supported: M, L, H, V, C, S, Q, T, A, Z and their lowercase relative variants. One-click presets (curve, star, rectangle, arc, Bézier) give you shapes to experiment with, and the options panel exposes stroke color and width, fill, a grid overlay, and viewBox size. Copy SVG exports a complete, valid document wrapping your path.

## How to use

1. Paste the d attribute value into the editor — for example M 10 80 C 40 10, 65 10, 95 80.
2. The preview re-renders on every keystroke; keep the grid on to read off coordinates.
3. Open the options panel to tune stroke, width, fill, and viewBox size.
4. Use Copy SVG to get a standalone <svg> document containing your path.

## Important details

### The command cheat sheet

M moves the pen, L draws a line, H and V draw horizontal and vertical lines, C is a cubic Bézier with two control points, S is a smooth cubic that mirrors the previous control point, Q is a quadratic Bézier, T its smooth variant, A draws an elliptical arc, and Z closes the path. Uppercase commands take absolute coordinates; lowercase are relative to the current point.

### Demystifying the arc command

A rx ry x-axis-rotation large-arc-flag sweep-flag x y — the two flags are the confusing part. Between any two points there are four possible arcs of a given ellipse: large-arc-flag picks the longer or shorter way around, and sweep-flag picks the direction. Experiment on the Arc preset to build intuition.

### Why relative commands exist

Lowercase commands express geometry relative to the pen, so an entire shape can be moved by changing only its initial M. Icon and font paths are often exported relative to make them position-independent; this viewer accepts both dialects interchangeably.

## Frequently asked questions

### Why is my path invisible?

The usual suspects: coordinates outside the viewBox (increase the viewBox size in options), a fill of none with no visible stroke, or a malformed command. The note under the editor lists the supported command set.

### Can I paste a whole SVG file?

This page takes only the d attribute. To preview and edit a complete SVG document, use the SVG Editor tool instead.

### Does it support curves exported from Figma or Illustrator?

Yes. Export as SVG, copy the d value from the <path> element, and paste it here to inspect or tweak the geometry command by command.

## References

- [MDN: SVG d attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d)


## Related tools

- [JSON Prettifier](https://www.developers.do/tools/json-prettifier): Format and validate JSON data
- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
