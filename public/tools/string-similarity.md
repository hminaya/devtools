# String Similarity

> Compare strings using Jaro-Winkler, Levenshtein, Dice, and Hamming algorithms

Live tool: https://www.developers.do/tools/string-similarity
Category: Algorithms

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Measures how alike two strings are, as a 0–100% score, using four classic algorithms: Jaro-Winkler, Levenshtein edit distance, Dice bigram coefficient, and Hamming distance. Pick an algorithm to read a plain-language description of its behavior, and compare the same pair across algorithms to understand their biases. Scores are color-coded from red (dissimilar) to green (near-identical).

## How to use

1. Enter the two strings to compare.
2. Choose an algorithm — the note under the selector explains its strengths.
3. Choose Compare to get the percentage score and bar.
4. Re-run with a different algorithm to see how the same pair scores under a different definition of “similar”.

## Important details

### Choosing the right algorithm

Jaro-Winkler excels at short strings like person or place names and boosts matches that share a prefix — great for deduplicating records. Levenshtein counts the minimum insertions, deletions, and substitutions between the strings — a solid general default. Dice compares two-character bigram overlap and tolerates word reordering in longer text. Hamming counts differing positions and only applies to equal-length strings like fixed-width codes.

### Edit distance as a similarity score

Raw Levenshtein output is a distance — a count of edits — which is hard to compare across strings of different lengths. This tool normalizes it to similarity = 1 − distance ÷ maximum length, so 100% always means identical and 0% means nothing in common, whichever algorithm you pick.

### Typical uses — and the limit

Fuzzy duplicate detection in imports and CRM data, “did you mean” suggestions, matching user input against known commands, and rough rename detection. For semantic similarity — “car” versus “automobile” — you need embeddings (see the Sentence Similarity tool); these algorithms compare characters, not meaning.

## Frequently asked questions

### Which algorithm should I use for names?

Jaro-Winkler. It was designed for short strings and record linkage, and its prefix bonus matches how names typically vary (Jon versus John).

### Why does Hamming score 0 for different lengths?

Hamming distance is only defined for equal-length strings, so the tool reports 0 rather than a misleading number. Pad or align the strings first if your data is fixed-width.

### Is the comparison case-sensitive?

Yes — the algorithms compare exact characters. Lowercase both strings yourself if case should not matter.

## References

- [Jaro–Winkler distance](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance)
- [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance)


## Related tools

- [Regex Tester](https://www.developers.do/tools/regex-tester): Test regular expressions with match highlighting, capture groups, and string replacement
- [Regex Library](https://www.developers.do/tools/regex-library): Browse and copy common regular expressions for validation, extraction, and text processing
- [Number Base Converter](https://www.developers.do/tools/number-base-converter): Convert numbers between binary, octal, decimal, and hex with two's complement
- [SemVer Comparator](https://www.developers.do/tools/semver-comparator): Compare, sort, and validate semantic version strings per SemVer 2.0.0 with prerelease and build metadata support
