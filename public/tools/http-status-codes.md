# HTTP Status Code Reference

> Searchable reference of all HTTP status codes with descriptions and use cases

Live tool: https://www.developers.do/tools/http-status-codes
Category: Networking

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

A searchable reference of HTTP response status codes across all five classes — 1xx informational, 2xx success, 3xx redirection, 4xx client errors, and 5xx server errors. Search by code, name, or concept; filter by class with the tab counts; expand any card for a longer explanation and typical use cases. Deprecated codes are flagged so you do not build on them.

## How to use

1. Search by number (404), name (Not Found), or concept (redirect, rate limit).
2. Filter by class with the 1xx–5xx tabs, which show how many codes each class contains.
3. Expand a card for the deeper explanation, and copy the code with one click.

## Important details

### The five classes in one line each

1xx: the request was received, keep waiting — rarely seen directly. 2xx: success — 200 OK, 201 Created, 204 No Content. 3xx: the resource lives elsewhere — follow the Location header. 4xx: the client sent something wrong — fix the request, do not retry as-is. 5xx: the server failed — retrying later may succeed.

### The redirects developers mix up

301 and 308 are permanent; 302, 303, and 307 are temporary. 307 and 308 guarantee the method and body are preserved across the redirect; with 301 and 302, browsers historically rewrote POST to GET. For APIs, prefer 307 or 308 when method preservation matters. Search engines transfer ranking signals on 301 but not on 302.

### Debugging staples

401 means unauthenticated — no valid credentials, look for a WWW-Authenticate header; 403 means authenticated but not allowed. 404 is “not here”, 410 is “gone forever”. 429 is rate limiting — honor Retry-After. On the server side: 502 is a bad upstream response, 503 is temporary overload or maintenance, 504 is an upstream timeout.

## Frequently asked questions

### What is the difference between 401 and 403?

401 Unauthorized means the request lacks valid authentication — the client should sign in or send credentials. 403 Forbidden means the server knows who you are and still refuses; re-authenticating will not help.

### Is 418 a real status code?

Yes — “I’m a teapot” comes from RFC 2324, an April Fools’ protocol from 1998. It was never meant for real use and is effectively reserved by tradition, so do not use it for actual errors.

### Which code should a successful API delete return?

204 No Content is the common choice when nothing is returned; 200 OK with a small body is also fine. Both are 2xx, so clients treat either as success.

## References

- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)


## Related tools

- [API Tester](https://www.developers.do/tools/api-tester): Test and view API responses
- [MIME Type Lookup](https://www.developers.do/tools/mime-type-lookup): Search common MIME types by file extension, MIME string, or category — covers images, video, audio, archives, documents, code, fonts, and data formats
- [Common Port Number Reference](https://www.developers.do/tools/port-reference): Searchable reference of common TCP/UDP ports for web, database, email, file transfer, remote access, messaging, networking, DevOps, and security services
- [CIDR / Subnet Calculator](https://www.developers.do/tools/cidr-calculator): IPv4 and IPv6 CIDR calculator — network address, broadcast, subnet mask, host range, RFC 1918 / ULA private range detection, reverse DNS PTR, and subnet splitting
