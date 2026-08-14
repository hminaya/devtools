# UUID Generator

> Generate UUIDs across all RFC 9562 versions — nil, v1, v2, v3, v4, v5, v6, v7, and v8

Live tool: https://www.developers.do/tools/uuid-generator
Category: Generators

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

This generator creates Universally Unique IDentifiers across every version defined in RFC 9562: nil, v1, v2, v3, v4, v5, v6, v7, and v8. Time-based, name-based, random, and sortable variants are all supported, with optional namespace and name inputs for v3/v5 and local domain for v2. Generation uses the browser’s Web Crypto API and runs entirely in the current tab.

## How to use

1. Pick a version from nil through v8.
2. For v3 and v5, select a namespace and provide a name — the same inputs always produce the same UUID.
3. For v2, optionally enter a local identifier and domain.
4. Choose how many to generate (1–50) and click Generate UUIDs.
5. Copy any individual UUID, or use Copy All UUIDs to copy the whole list.

## Important details

### Which version should I use?

v4 (fully random) is the safest default for general identifiers. v7 (Unix-epoch milliseconds + random) sorts lexically and is ideal for database indexes when you want time-ordered rows. v5 (SHA-1 name+namespace) and v3 (MD5 name+namespace) produce deterministic UUIDs for the same inputs — useful for content-addressed or idempotent flows.

### Version 6 versus version 1

Both v1 and v6 embed a Gregorian timestamp, but v6 reorders the timestamp so that lexical sort matches chronological order. This makes v6 friendlier than v1 for sorted indexes.

### Uniqueness and storage

Random UUID collisions are extraordinarily unlikely, but a database should still enforce a unique constraint when uniqueness is a correctness requirement. Store UUIDs in a native UUID or compact binary type when your database supports one.

## Frequently asked questions

### Are these sequential UUIDs?

Only v1, v6, and v7 are time-based and therefore sortable. v4 is fully random and not sequential. v2, v3, v5, and v8 derive their bits from other inputs (local id, name+namespace hash, or vendor-specific data) and are not sortable by generation time.

### Are UUIDs suitable for passwords or API keys?

Use a purpose-built secret generator for credentials. UUIDs are identifiers and should not automatically be treated as authentication secrets.

## References

- [RFC 9562: Universally Unique IDentifiers](https://www.rfc-editor.org/rfc/rfc9562)


## Related tools

- [Password Generator](https://www.developers.do/tools/password-generator): Generate secure random passwords
- [Lorem Ipsum Generator](https://www.developers.do/tools/lorem-ipsum-generator): Generate placeholder text for designs
- [Random Number Generator](https://www.developers.do/tools/random-number-generator): Generate random numbers and see code samples in multiple languages
- [QR Code Generator](https://www.developers.do/tools/qr-code-generator): Generate QR codes from text, URLs, or any data
- [ULID Generator](https://www.developers.do/tools/ulid-generator): Generate ULIDs — 26-character lexicographically sortable identifiers (48-bit timestamp + 80-bit random) with optional monotonic mode
