# Random Number Generator

> Generate random numbers and see code samples in multiple languages

Live tool: https://www.developers.do/tools/random-number-generator
Category: Generators

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Generates a random integer in your chosen range — both endpoints included — using the browser’s crypto.getRandomValues(), the same cryptographically secure randomness source used for keys and tokens, rather than Math.random(). Min and max swap automatically if you enter them backwards. Below the result, a ready-to-paste code sample shows how to generate the same range in TypeScript, JavaScript, C#, Swift, Kotlin, Go, or Rust, updating live as you change the bounds.

## How to use

1. Set the minimum and maximum values; both ends of the range are inclusive.
2. Choose Generate Random Number and copy the result.
3. Pick a language to see the equivalent code sample, which tracks your current range.

## Important details

### Math.random() versus crypto.getRandomValues()

Math.random() is a fast pseudorandom generator seeded invisibly by the engine — fine for games and shuffles, unsuitable for security. crypto.getRandomValues() draws from the operating system’s CSPRNG and is appropriate for tokens, raffles, and anything an attacker might try to predict. This tool uses the latter.

### A note on perfect uniformity

Mapping a 32-bit random value onto an arbitrary range with modulo can introduce measurable bias when the range is enormous — a significant fraction of 2^32. For everyday ranges like dice, raffles, sampling, or load distribution, the skew is far below anything observable. If you need provable uniformity over huge ranges, use rejection sampling instead.

### Integers only, both ends included

The result is always a whole number, and min and max themselves are possible outcomes — a 1–6 range is a fair die. For floating-point values, scale an integer result or adapt the code samples, which use each language’s idiomatic random API.

## Frequently asked questions

### Is this safe to use for security purposes?

The randomness source is the OS-level CSPRNG, so values are unpredictable. For passwords, keys, and tokens, prefer a dedicated generator — like the Password Generator here — that is designed for those formats.

### Can the range include negative numbers?

Yes. Min and max accept any integers, including negatives, and reversed input is swapped automatically.

### How do I reproduce this in my own code?

Copy the sample for your language below the result. Each sample generates an inclusive integer in exactly the range you configured, using that language’s standard random API.

## References

- [MDN: Crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)


## Related tools

- [Password Generator](https://www.developers.do/tools/password-generator): Generate secure random passwords
- [UUID Generator](https://www.developers.do/tools/uuid-generator): Generate UUIDs across all RFC 9562 versions — nil, v1, v2, v3, v4, v5, v6, v7, and v8
- [Lorem Ipsum Generator](https://www.developers.do/tools/lorem-ipsum-generator): Generate placeholder text for designs
- [QR Code Generator](https://www.developers.do/tools/qr-code-generator): Generate QR codes from text, URLs, or any data
- [ULID Generator](https://www.developers.do/tools/ulid-generator): Generate ULIDs — 26-character lexicographically sortable identifiers (48-bit timestamp + 80-bit random) with optional monotonic mode
