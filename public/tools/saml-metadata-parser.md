# SAML Metadata Parser

> Parse SAML Metadata XML and extract IdP/SP configuration

Live tool: https://www.developers.do/tools/saml-metadata-parser
Category: SAML

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Paste a SAML EntityDescriptor — the metadata XML published by an Identity Provider or Service Provider — and this parser extracts everything needed for SSO configuration: the entityID, whether it describes an IdP or SP, signing requirements (AuthnRequestsSigned, WantAuthnRequestsSigned), all SSO, SLO, and ACS endpoints with their bindings and indexes, embedded X.509 certificates with fingerprints and expiry status, supported NameID formats, requested attributes, and organization details. Sample IdP and SP documents are included. Parsing happens in your browser; the XML is never uploaded.

## How to use

1. Paste the metadata XML — the document rooted at <EntityDescriptor>.
2. Choose Parse, or load the Sample IdP / Sample SP first to see a complete result.
3. Review the endpoint list: each entry shows its type, binding (HTTP-Redirect, HTTP-POST, and so on), index, and default flag.
4. Check the certificate cards for expiry badges, and copy a PEM when you need to configure a trust store.

## Important details

### IdP metadata versus SP metadata

An IdP descriptor (IDPSSODescriptor) lists the SingleSignOnService endpoints your app redirects users to, plus the IdP’s signing certificate. An SP descriptor (SPSSODescriptor) lists AssertionConsumerService URLs — where the IdP posts responses — and declares whether the SP signs its AuthnRequests. Mixing these up is a classic first-integration mistake.

### Why metadata often shows two certificates

During certificate rollover, an entity publishes both the old and new signing certificates so partners can switch without downtime. Both appear here with their own fingerprints and expiry dates. An expired old certificate lingering in metadata is common after a cutover and should be removed.

### Parsing is not signature verification

This tool checks that the XML is well-formed and extracts its fields, which catches most configuration mistakes — that structural check is what most people mean by a SAML metadata validator. It does not verify an XML signature on signed metadata; production trust must come from fetching metadata over a trusted channel or validating its signature in your SAML library.

## Frequently asked questions

### Where do I get my IdP’s metadata?

Identity providers publish it at a well-known URL — Okta, Microsoft Entra ID, Google Workspace, and ADFS all expose it in their SSO configuration screens. Download the XML and paste it here instead of copying values field by field.

### What is the entityID used for?

It is the unique name of the IdP or SP, usually a URL or URN. The IdP puts the SP’s entityID in the Audience restriction, and the SP trusts assertions whose Issuer matches the IdP’s entityID. A mismatch is a common cause of “invalid audience” errors.

### Can I paste a metadata URL instead of XML?

This tool parses the XML document itself. Download the metadata from its URL (it is a public endpoint) and paste the contents here.

## References

- [OASIS: SAML 2.0 Metadata specification](https://docs.oasis-open.org/security/saml/v2.0/saml-metadata-2.0-os.pdf)


## Related tools

- [SAML Decoder](https://www.developers.do/tools/saml-decoder): Decode SAML Requests/Responses from Base64 to readable XML
- [SAML Certificate Inspector](https://www.developers.do/tools/saml-cert-inspector): Inspect X.509 certificates from SAML metadata, responses, or PEM
- [SAML Assertion Builder](https://www.developers.do/tools/saml-builder): Generate test SAML Responses, AuthnRequests, and LogoutRequests
- [SAML Metadata Generator](https://www.developers.do/tools/saml-metadata-generator): Generate SAML 2.0 EntityDescriptor metadata XML for SPs and IdPs
- [SAML Response Validator](https://www.developers.do/tools/saml-validator): Debug a SAML Response and find out why SSO login is failing
