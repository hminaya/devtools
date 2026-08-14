# MIME Type Lookup

> Search common MIME types by file extension, MIME string, or category — covers images, video, audio, archives, documents, code, fonts, and data formats

Live tool: https://www.developers.do/tools/mime-type-lookup
Category: Networking

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

A searchable reference of 131 common MIME types (media types). Search by file extension (.png, .woff2), by MIME string (image/jpeg), or filter by category — images, video, audio, archives, documents, code, fonts, text, data, and application. Each row shows known extension aliases, a short practical note, and a one-click copy of the exact Content-Type value.

## How to use

1. Type an extension, a MIME type, or a keyword into the search box.
2. Narrow the results with the category pills, which show how many entries each category holds.
3. Click the copy button on any row to copy the exact MIME string for your header or server config.

## Important details

### MIME type versus file extension

An extension is just a filename hint; the MIME type is what a server actually declares in the Content-Type header, and browsers honor the header over the extension. A .jpg served as text/plain will not render as an image. When the two disagree, the header wins.

### When the wrong type breaks things

WebAssembly modules need application/wasm for streaming compilation, web fonts need font/woff2 to load under strict policies, and JSON APIs should send application/json so clients parse instead of display. Unknown binary content falls back to application/octet-stream, which browsers download instead of opening.

### Use nosniff deliberately

When a response lacks a Content-Type, browsers guess — historically a source of security bugs. Sending X-Content-Type-Options: nosniff disables that guessing, which makes serving the correct type from this table mandatory rather than optional.

## Frequently asked questions

### What MIME type forces a file download?

application/octet-stream is the generic binary type; browsers save it instead of displaying it. Combine it with a Content-Disposition: attachment header to suggest a filename.

### Is there an official list of MIME types?

Yes. IANA maintains the canonical media type registry. This table covers the commonly used subset developers actually look up, with aliases and notes.

### What is the correct MIME type for JSON?

application/json, per RFC 8259. The legacy text/json is obsolete and some strict clients reject it.

## References

- [IANA media type registry](https://www.iana.org/assignments/media-types/media-types.xhtml)
- [MDN: MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types)


## Related tools

- [API Tester](https://www.developers.do/tools/api-tester): Test and view API responses
- [HTTP Status Code Reference](https://www.developers.do/tools/http-status-codes): Searchable reference of all HTTP status codes with descriptions and use cases
- [Common Port Number Reference](https://www.developers.do/tools/port-reference): Searchable reference of common TCP/UDP ports for web, database, email, file transfer, remote access, messaging, networking, DevOps, and security services
- [CIDR / Subnet Calculator](https://www.developers.do/tools/cidr-calculator): IPv4 and IPv6 CIDR calculator — network address, broadcast, subnet mask, host range, RFC 1918 / ULA private range detection, reverse DNS PTR, and subnet splitting
