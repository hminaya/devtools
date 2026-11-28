# cURL Converter & Parser

> Parse cURL commands locally and convert them to JavaScript fetch, TypeScript, Axios, Python requests/httpx, Go, Rust, or formatted cURL

Live tool: https://www.developers.do/tools/curl-converter
Category: Networking

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Paste any cURL command from API documentation or Chrome DevTools ("Copy as cURL") to inspect the parsed HTTP method, base URL, query parameters, headers, cookies, basic auth, and body payload. Convert the command into clean, copy-ready code for JavaScript fetch, TypeScript, Node Axios, Python requests or httpx, Go net/http, Rust reqwest, or formatted multiline cURL. Everything runs 100% locally in your browser without executing the request or sending credentials to any server.

## How to use

1. Paste a cURL command into the input area or load one of the built-in samples.
2. Review the Parsed Request inspector on the right to verify the method, query parameters, headers, cookies, and body.
3. Choose a target language tab on the left (JS fetch, TS fetch, Axios, Python, Go, Rust, or Formatted cURL).
4. Optionally enable "Redact secrets in output" to replace tokens, API keys, cookies, and passwords with <REDACTED> before copying.

## Important details

### Supported shell dialects and flags

The tokenizer supports Bash/Zsh single quotes, double quotes, ANSI-C $'...' escapes used by Chrome DevTools, PowerShell backtick continuations, and Windows cmd caret (^) escaping. Common cURL flags including -X/--request, -H/--header, -d/--data/--data-raw/--data-urlencode, --json, -F/--form, -G/--get, -I/--head, -u/--user, -b/--cookie, -A/--user-agent, -L, -k, --compressed, and --max-time are parsed automatically.

### 100% local and never executes requests

Unlike an HTTP client that fires live network calls, this converter only parses the command text in-memory and generates source code. Authorization headers, bearer tokens, session cookies, and request bodies stay on your device.

### Automatic credential detection and redaction

When Authorization headers, API keys, cookies, basic auth credentials, or common token patterns are detected, the tool highlights them and lets you toggle redaction so you can share generated snippets safely in issues or chat.

## Frequently asked questions

### Does this tool execute the cURL request or send my API keys anywhere?

No. Parsing and code generation happen entirely in your browser tab. No HTTP requests are sent and no input is uploaded to a server.

### Does it work with Chrome DevTools "Copy as cURL"?

Yes. Both "Copy as cURL (bash)" (including $'...' ANSI-C escapes) and "Copy as cURL (cmd)" are supported.

### How does -G / --get affect -d / --data flags?

Matching curl behavior, when -G or --get is present, data arguments are appended to the URL query parameters rather than sent in the request body.

## References

- [curl manpage](https://curl.se/docs/manpage.html)
- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)


## Related tools

- [API Tester](https://www.developers.do/tools/api-tester): Test and view API responses
- [HTTP Status Code Reference](https://www.developers.do/tools/http-status-codes): Searchable reference of all HTTP status codes with descriptions and use cases
- [MIME Type Lookup](https://www.developers.do/tools/mime-type-lookup): Search common MIME types by file extension, MIME string, or category — covers images, video, audio, archives, documents, code, fonts, and data formats
- [Common Port Number Reference](https://www.developers.do/tools/port-reference): Searchable reference of common TCP/UDP ports for web, database, email, file transfer, remote access, messaging, networking, DevOps, and security services
- [CIDR / Subnet Calculator](https://www.developers.do/tools/cidr-calculator): IPv4 and IPv6 CIDR calculator — network address, broadcast, subnet mask, host range, RFC 1918 / ULA private range detection, reverse DNS PTR, and subnet splitting
