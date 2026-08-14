# Base64 Encoder/Decoder

> Encode and decode Base64 strings

Live tool: https://www.developers.do/tools/base64-encoder
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

The Base64 encoder converts Unicode text to UTF-8 bytes and then represents those bytes with standard Base64 characters. The decoder reverses that process and requires the decoded bytes to be valid UTF-8 text. Processing happens locally in the browser.

## How to use

1. Enter ordinary text to encode, or a standard Base64 string to decode.
2. Choose Encode to Base64 or Decode from Base64.
3. Copy the result, or correct the input if the decoder reports invalid Base64 or non-UTF-8 bytes.

## Important details

### Base64 is not encryption

Base64 is a reversible representation for binary data. It provides no confidentiality, authenticity, hashing, or tamper protection and should never be used as a security control.

### Text and Base64url differences

This page is intended for UTF-8 text and standard Base64. URL-safe Base64 commonly replaces + and / with - and _ and may omit padding, so Base64url values may require normalization before decoding here.

## Frequently asked questions

### Why is the Base64 output longer than the input?

Base64 represents each three bytes with four text characters, plus possible padding, so encoded data is normally about one-third larger.

### Can I encode a file with this page?

This interface accepts text. It does not currently read arbitrary file bytes.

## References

- [RFC 4648: Base-N Encodings](https://www.rfc-editor.org/rfc/rfc4648)


## Related tools

- [JSON Prettifier](https://www.developers.do/tools/json-prettifier): Format and validate JSON data
- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
