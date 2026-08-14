# JWT Decoder

> Decode and inspect JWT tokens

Live tool: https://www.developers.do/tools/jwt-decoder
Category: Security

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

This JWT decoder separates a three-part token into its Base64url-encoded header, payload, and signature segments. It displays JSON claims and converts common NumericDate claims such as exp, iat, and nbf into readable timestamps. Decoding is local to your browser.

## How to use

1. Paste the complete compact JWT, including both period separators.
2. Select Decode to inspect the header, payload claims, and encoded signature.
3. Use the decoded values for debugging only, then verify the original token in trusted server-side code.

## Important details

### Decoding is not verification

Anyone can create or modify a decodable JWT. This page does not verify the cryptographic signature, issuer, audience, expiry policy, or key provenance. Never treat the displayed claims as trusted authorization data.

### JWTs are encoded, not necessarily encrypted

The header and payload of a typical signed JWT are readable by anyone who has the token. Do not place passwords, secrets, or unnecessary personal data in those claims.

## Frequently asked questions

### Can this tool tell me whether a JWT is valid?

No. Validity requires signature verification with an appropriate trusted key plus checks for issuer, audience, time claims, and application policy.

### Does decoding change the token?

No. The decoder reads the three compact segments and presents their contents without modifying the pasted token.

## References

- [RFC 7519: JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519)


## Related tools

- [Secrets Scanner](https://www.developers.do/tools/secrets-scanner): Scan text, logs, or configs for leaked keys and tokens
- [MD5 Hash](https://www.developers.do/tools/md5-generator): Generate MD5 hashes from text
- [SHA-1 Hash](https://www.developers.do/tools/sha1-generator): Generate SHA-1 hashes from text
- [SHA-256/384/512 Hash](https://www.developers.do/tools/sha256-generator): Generate secure SHA-256, SHA-384, or SHA-512 hashes from text
- [HMAC Generator](https://www.developers.do/tools/hmac-generator): Generate HMAC signatures with SHA-1, SHA-256, SHA-384, or SHA-512 — output as hex, base64, or base64url
