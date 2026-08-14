# Unix Timestamp Converter

> Convert Unix epoch timestamps to human-readable dates — single or batch — with timezone support

Live tool: https://www.developers.do/tools/unix-timestamp
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

The Unix timestamp converter translates between an epoch value and readable dates. It accepts seconds or milliseconds, can auto-detect the likely unit, formats results in a selected timezone, and also converts date strings back to epoch seconds and milliseconds.

## How to use

1. Choose Epoch to Human or Human to Epoch.
2. Enter a timestamp or date string and select the unit and timezone when applicable.
3. Review the ISO 8601, UTC, localized, relative, seconds, and milliseconds representations.

## Important details

### Seconds versus milliseconds

Unix time is traditionally measured in seconds since 1970-01-01T00:00:00Z, while JavaScript and many APIs use milliseconds. A unit mismatch produces a date that is thousands of years away or unexpectedly close to 1970.

### Be explicit about timezones

An ISO 8601 value ending in Z is UTC, and an explicit numeric offset identifies another zone. A date string without a timezone may be interpreted using the browser’s local timezone, so include Z or an offset when the instant must be unambiguous.

## Frequently asked questions

### Do Unix timestamps contain timezone information?

No. A timestamp identifies an instant. A timezone is applied only when that instant is formatted for display.

### Why does my date appear in 1970?

The value may be milliseconds interpreted as seconds, seconds interpreted as milliseconds, or a small relative duration rather than a complete epoch timestamp.

## References

- [ISO 8601 date and time format](https://www.iso.org/iso-8601-date-and-time-format.html)


## Related tools

- [JSON Prettifier](https://www.developers.do/tools/json-prettifier): Format and validate JSON data
- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
