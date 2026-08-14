# File Size Converter

> Convert file sizes between decimal (SI) and binary (IEC) units

Live tool: https://www.developers.do/tools/file-size-converter
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Type a size once and read it in every unit at once: decimal SI units (bytes, KB, MB, GB, TB, PB — powers of 1,000) on one side and binary IEC units (KiB, MiB, GiB, TiB, PiB — powers of 1,024) on the other. Results update live as you type, each value has its own copy button, and the Random Size button loads familiar reference objects — a CD at 700 MB, a DVD at 4.7 GB, a 1 TB hard drive — to sanity-check magnitudes.

## How to use

1. Enter a number and pick the unit it is measured in, from bytes up to pebibytes.
2. Read the equivalent decimal (SI) and binary (IEC) values side by side.
3. Copy any individual result with its copy button.
4. Use Random Size to load the typical size of a real-world object for comparison.

## Important details

### Why your 1 TB drive shows 931 GB

Drive manufacturers sell capacity in decimal units: 1 TB = 1,000,000,000,000 bytes. Operating systems report binary units: 1,000,000,000,000 ÷ 1,073,741,824 ≈ 931 GiB — often displayed with the wrong “GB” label. No capacity is missing; the two unit systems simply differ by about 7.4% at terabyte scale.

### KB versus KiB in practice

Memory is always binary — 16 GiB of RAM is 2^34 bytes. Network bandwidth is decimal and measured in bits: 100 Mbps is 100,000,000 bits per second, roughly 11.9 MiB/s of real transfer. Storage marketing is decimal; OS file dialogs are usually binary. When a number matters, write the exact unit.

### The 1,000 versus 1,024 gap grows with scale

At kilobyte scale the difference between the systems is 2.4%, at gigabyte scale 7.4%, and at terabyte scale about 10%. The bigger the numbers, the further the two systems drift — which is why ambiguous units cause real capacity-planning bugs.

## Frequently asked questions

### How many bytes are in a megabyte?

In SI units, 1 MB = 1,000,000 bytes. In IEC binary units, 1 MiB = 1,048,576 bytes (1,024 × 1,024). The converter shows both so you never have to guess which one a tool or spec meant.

### Should my code use 1,000 or 1,024?

Match the domain: memory and OS-level sizes are conventionally binary (1,024); storage devices and networks are decimal (1,000). Document whichever you choose — an ambiguous “MB” has caused many off-by-7% bugs.

### What comes after terabytes?

Decimal: petabytes (PB), exabytes (EB), zettabytes (ZB). Binary: pebibytes (PiB), exbibytes (EiB), zebibytes (ZiB). This converter covers bytes through PB and PiB.

## References

- [NIST: prefixes for binary multiples](https://physics.nist.gov/cuu/Units/binary.html)


## Related tools

- [JSON Prettifier](https://www.developers.do/tools/json-prettifier): Format and validate JSON data
- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
