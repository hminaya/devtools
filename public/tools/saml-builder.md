# SAML Assertion Builder

> Generate test SAML Responses, AuthnRequests, and LogoutRequests

Live tool: https://www.developers.do/tools/saml-builder
Category: SAML

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Builds test SAML messages from form fields instead of hand-editing XML: full SAML Responses, AuthnRequests, and LogoutRequests. Set the issuer, destination, NameID and its format (email, persistent, transient, unspecified), audience, ACS URL, InResponseTo, and authentication context; attach custom attributes; then export as raw XML, Base64 for HTTP-POST binding, or Base64 + DEFLATE for HTTP-Redirect binding. Generated assertions are unsigned and intended for development, testing, and learning only.

## How to use

1. Pick a template: SAML Response, AuthnRequest, or LogoutRequest.
2. Fill in issuer, destination, NameID, and — for responses — audience, ACS URL, and attributes.
3. Adjust the timing controls to reproduce clock-skew or expiry scenarios.
4. Choose an output format and Generate: raw XML to read, Base64 for POST binding, or Base64 + DEFLATE for Redirect binding.

## Important details

### POST versus Redirect encoding

HTTP-POST binding sends the XML Base64-encoded in an HTML form field, with no compression. HTTP-Redirect binding must DEFLATE-compress the XML first, then Base64, then URL-encode it into the query string. Choosing the wrong transform for your binding is a frequent cause of “malformed request” errors at the receiving end.

### Why the timing fields matter

NotBefore and NotOnOrAfter define the validity window; SessionNotOnOrAfter bounds the session. Real IdPs set NotBefore slightly in the past to tolerate clock skew between servers — a response valid only “from now” can fail against an SP whose clock is 60 seconds behind. Reproduce those conditions here on purpose.

### Unsigned by design

Signing requires a private key and a partner that trusts the matching certificate. This builder deliberately produces unsigned assertions: use it to test parsing, attribute mapping, and error handling — never to authenticate. A correctly configured service provider must reject these messages.

## Frequently asked questions

### Can I sign the assertion here?

No — by design. For signed test assertions, use your identity provider’s preview feature or a SAML library in your own codebase with a throwaway key pair.

### Will my application accept what this generates?

Only if its SAML stack has signature verification disabled, which should only ever happen on a local or throwaway test environment.

### What should I put in InResponseTo?

The ID of the AuthnRequest the response answers. For unsolicited (IdP-initiated) responses, leave it empty — that is exactly what IdP-initiated SSO means in practice.

## References

- [OASIS: SAML 2.0 Core specification](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf)


## Related tools

- [SAML Decoder](https://www.developers.do/tools/saml-decoder): Decode SAML Requests/Responses from Base64 to readable XML
- [SAML Metadata Parser](https://www.developers.do/tools/saml-metadata-parser): Parse SAML Metadata XML and extract IdP/SP configuration
- [SAML Certificate Inspector](https://www.developers.do/tools/saml-cert-inspector): Inspect X.509 certificates from SAML metadata, responses, or PEM
- [SAML Metadata Generator](https://www.developers.do/tools/saml-metadata-generator): Generate SAML 2.0 EntityDescriptor metadata XML for SPs and IdPs
- [SAML Response Validator](https://www.developers.do/tools/saml-validator): Debug a SAML Response and find out why SSO login is failing
