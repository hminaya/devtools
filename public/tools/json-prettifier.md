# JSON Prettifier

> Format and validate JSON data

Live tool: https://www.developers.do/tools/json-prettifier
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

This formatter parses JSON with the browser’s built-in JSON parser, then serializes it with consistent two-space indentation. It can also remove insignificant whitespace for compact storage or transport. Your input is processed in the current browser tab and is not uploaded by this tool.

## How to use

1. Paste a JSON object, array, string, number, boolean, or null value into the input field.
2. Choose Prettify to format and validate the value, or Minify to produce compact JSON.
3. Review any parser error or suggestion, then copy the output when the input is valid.

## Important details

### JSON versus JavaScript objects

Valid JSON requires double-quoted property names and strings. It does not allow comments, trailing commas, undefined values, functions, or single-quoted strings. The prettifier can repair simple unquoted property names, but it deliberately reports other syntax problems instead of silently changing data.

### Formatting does not change values

Prettifying changes whitespace only after parsing succeeds. Object keys, array order, strings, numbers, booleans, and null values are preserved according to JSON.parse and JSON.stringify behavior.

## Frequently asked questions

### Why is my JSON invalid even though it works in JavaScript?

JavaScript object literals support syntax that JSON does not, including comments, trailing commas, single quotes, and unquoted keys. Convert those constructs to strict JSON syntax first.

### Does the formatter send JSON to a server?

No. Formatting, validation, minification, and the sample generator run in your browser.

## References

- [RFC 8259: The JSON Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259)


## Related tools

- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
- [TOML Parser](https://www.developers.do/tools/toml-parser): Parse, validate, format, and round-trip TOML to/from JSON — spec-compliant via smol-toml
