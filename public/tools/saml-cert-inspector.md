# SAML Certificate Inspector

> Inspect X.509 certificates from SAML metadata, responses, or PEM

Live tool: https://www.developers.do/tools/saml-cert-inspector
Category: SAML

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Paste certificate material in almost any wrapper — PEM text, Base64 DER, a full SAML metadata document, or a SAML response — and the inspector auto-detects the format and extracts every X.509 certificate it contains. For each one you get the subject and common name, issuer, serial number, validity window with an expiry badge that turns amber inside 30 days and red after expiry, signature algorithm, public key algorithm and size, key usage and extended key usage, subject alternative names, the CA flag, and SHA-1 / SHA-256 fingerprints, with one-click PEM copy.

## How to use

1. Paste the certificate material — a PEM block, Base64 blob, metadata XML, or response XML.
2. Choose Inspect; the detected format and certificate count appear above the results.
3. Read the expiry badge first: Valid, Expiring Soon (under 30 days), or Expired.
4. Copy the SHA-256 fingerprint or PEM when configuring trust in your SAML stack.

## Important details

### Expired SAML certificates are a top SSO outage cause

Unlike public HTTPS, nothing warns you when a SAML signing certificate approaches its notAfter date — logins simply start failing. Check the expiry badge before every change window, and publish the replacement certificate in metadata alongside the old one during rollover so partners can switch cleanly.

### Self-signed is normal in SAML

SAML trust is established by exchanging metadata out of band, not by public CA chains, so most SAML signing certificates are self-signed. Seeing Issuer equal to Subject is expected, not a warning sign. What matters is that the fingerprint in your configuration matches the one shown here.

### Signing versus encryption keys

In metadata, a KeyDescriptor with use="signing" protects assertion authenticity, while use="encryption" protects confidentiality. A KeyDescriptor with no use attribute serves both. The key usage and extended key usage fields shown here tell you what the certificate itself permits.

## Frequently asked questions

### Which fingerprint should I record?

SHA-256. SHA-1 is shown for legacy platforms that still require it, but SHA-1 collision attacks make it unsuitable for new configurations.

### My metadata has two certificates — which one is active?

Usually both are trusted during a rollover window; compare the Not Before dates to see which is newer. IdPs sign with one key at a time, so partners must trust all published signing certificates during the overlap.

### Can this verify a SAML response signature?

No. It extracts and describes certificates; signature verification requires your SAML library with configured trust. For response-level debugging, use the SAML Response Validator.

## References

- [RFC 5280: Internet X.509 PKI profile](https://www.rfc-editor.org/rfc/rfc5280)


## Related tools

- [SAML Decoder](https://www.developers.do/tools/saml-decoder): Decode SAML Requests/Responses from Base64 to readable XML
- [SAML Metadata Parser](https://www.developers.do/tools/saml-metadata-parser): Parse SAML Metadata XML and extract IdP/SP configuration
- [SAML Assertion Builder](https://www.developers.do/tools/saml-builder): Generate test SAML Responses, AuthnRequests, and LogoutRequests
- [SAML Metadata Generator](https://www.developers.do/tools/saml-metadata-generator): Generate SAML 2.0 EntityDescriptor metadata XML for SPs and IdPs
- [SAML Response Validator](https://www.developers.do/tools/saml-validator): Debug a SAML Response and find out why SSO login is failing
