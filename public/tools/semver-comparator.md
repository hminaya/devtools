# SemVer Comparator

> Compare, sort, and validate semantic version strings per SemVer 2.0.0 with prerelease and build metadata support

Live tool: https://www.developers.do/tools/semver-comparator
Category: Algorithms

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

The SemVer comparator parses version strings according to Semantic Versioning 2.0.0 and compares them by precedence. It handles release, prerelease, and build metadata for two-version comparisons and batch sorting of version lists. All parsing and comparison run in your browser.

## How to use

1. Enter two version strings (a leading "v" is optional) for a pairwise comparison.
2. Inspect the parsed major.minor.patch, prerelease, and build fields for each version.
3. For batch sorting, paste one version per line and review the sorted output.
4. Invalid lines are reported separately so you can fix them and re-run the sort.

## Important details

### Precedence follows SemVer 2.0.0 §11

Major, minor, and patch are compared numerically. A prerelease version has lower precedence than the same release. Prerelease identifiers are compared per-field: numeric identifiers are lower than alphanumeric identifiers, alphanumerics by ASCII sort, and a shorter prerelease list is lower when all shared identifiers are equal.

### Build metadata is ignored for precedence

Identifiers after the plus sign — for example, 1.0.0+build.42 — are not used when comparing versions. Two versions that differ only in build metadata are considered equal for precedence purposes.

## Frequently asked questions

### Why does 1.0.0-alpha compare lower than 1.0.0?

Per SemVer 2.0.0, any prerelease version has lower precedence than its corresponding release. The prerelease identifier only adds qualification; it never raises precedence above the patch segment.

### Is "v" required before the version number?

No. The comparator accepts an optional leading v or V, such as "v1.2.3", but the prefix is stripped before parsing — it is not part of the SemVer 2.0.0 BNF itself.

## References

- [Semantic Versioning 2.0.0](https://semver.org)


## Related tools

- [String Similarity](https://www.developers.do/tools/string-similarity): Compare strings using Jaro-Winkler, Levenshtein, Dice, and Hamming algorithms
- [Regex Tester](https://www.developers.do/tools/regex-tester): Test regular expressions with match highlighting, capture groups, and string replacement
- [Regex Library](https://www.developers.do/tools/regex-library): Browse and copy common regular expressions for validation, extraction, and text processing
- [Number Base Converter](https://www.developers.do/tools/number-base-converter): Convert numbers between binary, octal, decimal, and hex with two's complement
