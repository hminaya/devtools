# SAML Decoder

> Decode SAML Requests/Responses from Base64 to readable XML

Live tool: https://www.developers.do/tools/saml-decoder
Category: SAML

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

The SAML decoder converts Base64-encoded SAML Requests and Responses into readable XML. It can handle the optional DEFLATE encoding commonly used with HTTP-Redirect binding and extracts useful fields and assertion attributes for troubleshooting.

## How to use

1. Copy the SAMLRequest or SAMLResponse value, without the surrounding form field name.
2. Paste it into the decoder and select Decode.
3. Inspect the message type, issuer, destination, audience, timestamps, attributes, and decoded XML.

## Important details

### Decoding is not signature verification

Readable XML is not proof that a SAML message is authentic. A service provider must verify the XML signature with a trusted IdP certificate and enforce destination, recipient, audience, InResponseTo, time, and replay protections.

### Treat assertions as sensitive

SAML assertions can contain names, email addresses, group membership, session identifiers, and other security-sensitive attributes. This tool processes input locally, but you should still avoid sharing decoded production assertions unnecessarily.

## Frequently asked questions

### Why does a SAMLRequest sometimes need decompression?

HTTP-Redirect binding commonly DEFLATE-compresses the XML before Base64 and URL encoding. HTTP-POST binding generally sends Base64-encoded XML without DEFLATE.

### Can this page prove that a SAML response is safe?

No. Use a SAML library configured with trusted metadata and strict validation rules for authentication decisions.

## References

- [OASIS SAML 2.0 technical overview](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)


## Related tools

- [SAML Metadata Parser](https://www.developers.do/tools/saml-metadata-parser): Parse SAML Metadata XML and extract IdP/SP configuration
- [SAML Certificate Inspector](https://www.developers.do/tools/saml-cert-inspector): Inspect X.509 certificates from SAML metadata, responses, or PEM
- [SAML Assertion Builder](https://www.developers.do/tools/saml-builder): Generate test SAML Responses, AuthnRequests, and LogoutRequests
- [SAML Metadata Generator](https://www.developers.do/tools/saml-metadata-generator): Generate SAML 2.0 EntityDescriptor metadata XML for SPs and IdPs
- [SAML Response Validator](https://www.developers.do/tools/saml-validator): Debug a SAML Response and find out why SSO login is failing
