export interface HttpStatusCode {
  code: number;
  name: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  description: string;
  detail: string;
  isError: boolean;
  isDeprecated?: boolean;
}

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  // 1xx Informational
  {
    code: 100, name: 'Continue', category: '1xx', isError: false,
    description: 'The server has received the request headers and the client should proceed.',
    detail: 'Used with the Expect: 100-continue request header. Client sends headers first, server responds with 100 to signal it should send the body. Useful for large uploads to avoid wasting bandwidth if the server would reject the request.',
  },
  {
    code: 101, name: 'Switching Protocols', category: '1xx', isError: false,
    description: 'Server is switching to the protocol specified in the Upgrade header.',
    detail: 'Commonly seen when upgrading an HTTP connection to WebSocket. The server agrees to the protocol switch requested by the client.',
  },
  {
    code: 102, name: 'Processing', category: '1xx', isError: false,
    description: 'Server has received and is processing the request, but no response is yet available.',
    detail: 'A WebDAV extension (RFC 2518) to prevent client timeouts during long-running operations. Rarely seen outside of WebDAV contexts.',
  },
  {
    code: 103, name: 'Early Hints', category: '1xx', isError: false,
    description: 'Used to preload resources while the server prepares a full response.',
    detail: 'Allows browsers to start preloading CSS, fonts, and scripts using Link headers before the actual 200 response arrives. Improves page load performance significantly.',
  },

  // 2xx Success
  {
    code: 200, name: 'OK', category: '2xx', isError: false,
    description: 'The request succeeded.',
    detail: 'The standard success response. The response body contains the result of the request. Meaning varies by HTTP method: GET returns the resource, POST returns the result of the action, etc.',
  },
  {
    code: 201, name: 'Created', category: '2xx', isError: false,
    description: 'The request succeeded and a new resource was created.',
    detail: 'Returned after a successful POST or PUT that created a resource. The Location header typically contains the URL of the newly created resource.',
  },
  {
    code: 202, name: 'Accepted', category: '2xx', isError: false,
    description: 'Request received but processing has not been completed.',
    detail: 'Used for asynchronous operations. The server accepted the request but the work is done later (e.g., a background job queue). The response may include a way to poll for status.',
  },
  {
    code: 203, name: 'Non-Authoritative Information', category: '2xx', isError: false,
    description: 'The response was transformed by a proxy.',
    detail: 'The metadata in the response headers is not from the origin server but from a local or third-party copy. Rarely used in practice.',
  },
  {
    code: 204, name: 'No Content', category: '2xx', isError: false,
    description: 'The request succeeded but there is no content to return.',
    detail: 'Common for DELETE requests and PUT requests where no body is needed. The browser should not navigate away from the current page. No response body is sent.',
  },
  {
    code: 205, name: 'Reset Content', category: '2xx', isError: false,
    description: 'The request succeeded; client should reset the document view.',
    detail: 'Instructs the client to reset the UI that caused the request, e.g., clear a form after submission. No response body.',
  },
  {
    code: 206, name: 'Partial Content', category: '2xx', isError: false,
    description: 'The server is delivering only part of the resource.',
    detail: 'Used when the client sends a Range header to request part of a file (e.g., resumable downloads, video streaming). The Content-Range header describes which part is returned.',
  },
  {
    code: 207, name: 'Multi-Status', category: '2xx', isError: false,
    description: 'Multiple status codes for multiple independent operations.',
    detail: 'A WebDAV response containing an XML body with the status of each sub-request. Used in batch operations where different operations can succeed or fail independently.',
  },
  {
    code: 208, name: 'Already Reported', category: '2xx', isError: false,
    description: 'Members of a DAV binding already enumerated in a previous reply.',
    detail: 'WebDAV (RFC 5842). Used in a 207 Multi-Status response to avoid repeating members of an internal collection that were already listed.',
  },
  {
    code: 226, name: 'IM Used', category: '2xx', isError: false,
    description: 'The server fulfilled a GET request using instance manipulations.',
    detail: 'HTTP Delta encoding (RFC 3229). The response is a delta representation of the resource. Extremely rare in practice.',
  },

  // 3xx Redirection
  {
    code: 300, name: 'Multiple Choices', category: '3xx', isError: false,
    description: 'Multiple options are available for the requested resource.',
    detail: 'The server offers multiple representations of the resource (e.g., different languages or formats). The client or user must choose one. Rarely used; most APIs use content negotiation instead.',
  },
  {
    code: 301, name: 'Moved Permanently', category: '3xx', isError: false,
    description: 'The resource has permanently moved to a new URL.',
    detail: 'Browsers cache this redirect permanently. Search engines transfer "link equity" to the new URL. Use for permanent URL changes. The method may change to GET on redirect (unlike 308).',
  },
  {
    code: 302, name: 'Found', category: '3xx', isError: false,
    description: 'The resource is temporarily at a different URL.',
    detail: 'Historically misused. Modern usage recommends 307 (preserves method) or 303 (force GET) instead. Many browsers change POST to GET on a 302, which is technically wrong but widely implemented.',
  },
  {
    code: 303, name: 'See Other', category: '3xx', isError: false,
    description: 'Redirect to another resource using GET, typically after a POST.',
    detail: 'The Post/Redirect/Get pattern. After a form submission (POST), redirect the browser to a result page with GET to prevent duplicate submissions on refresh.',
  },
  {
    code: 304, name: 'Not Modified', category: '3xx', isError: false,
    description: 'The cached version of the resource is still valid.',
    detail: 'Response to a conditional GET (using If-Modified-Since or If-None-Match). No body is returned. Client should use its cached copy. Key to HTTP caching efficiency.',
  },
  {
    code: 307, name: 'Temporary Redirect', category: '3xx', isError: false,
    description: 'Temporarily redirect to another URL, preserving the HTTP method.',
    detail: 'Unlike 302, the HTTP method (POST, PUT, etc.) is preserved on redirect. Use when you need to temporarily redirect non-GET requests.',
  },
  {
    code: 308, name: 'Permanent Redirect', category: '3xx', isError: false,
    description: 'Permanently redirect to another URL, preserving the HTTP method.',
    detail: 'Like 301 but preserves the HTTP method. Use for permanent redirects of POST/PUT endpoints. Browsers cache this like 301.',
  },

  // 4xx Client Errors
  {
    code: 400, name: 'Bad Request', category: '4xx', isError: true,
    description: 'The server cannot process the request due to a client error.',
    detail: 'Malformed request syntax, invalid request message framing, or deceptive request routing. Common causes: missing required fields, invalid JSON body, failed validation.',
  },
  {
    code: 401, name: 'Unauthorized', category: '4xx', isError: true,
    description: 'Authentication is required and has failed or not been provided.',
    detail: 'Despite the name, this means "unauthenticated". The client must authenticate to get the requested response. The response includes a WWW-Authenticate header. Often confused with 403.',
  },
  {
    code: 402, name: 'Payment Required', category: '4xx', isError: true,
    description: 'Reserved for future use; sometimes used for API quota limits.',
    detail: 'Originally intended for digital payment systems, which never materialized. Some APIs use it for rate limiting or plan enforcement (e.g., Stripe, Braintree). Not standardized for this use.',
  },
  {
    code: 403, name: 'Forbidden', category: '4xx', isError: true,
    description: 'The client is authenticated but not authorized to access the resource.',
    detail: 'The server understood the request but refuses to authorize it. Unlike 401, authentication will not help. The user is logged in but lacks permission. Sometimes returned as 404 to hide resource existence.',
  },
  {
    code: 404, name: 'Not Found', category: '4xx', isError: true,
    description: 'The server cannot find the requested resource.',
    detail: 'The most famous HTTP status code. The resource may never have existed, been deleted, or the URL may be wrong. Servers may also return 404 instead of 403 to hide the existence of a resource.',
  },
  {
    code: 405, name: 'Method Not Allowed', category: '4xx', isError: true,
    description: 'The HTTP method is not supported for the requested resource.',
    detail: 'The response must include an Allow header listing the supported methods. Example: sending a POST to a read-only endpoint.',
  },
  {
    code: 406, name: 'Not Acceptable', category: '4xx', isError: true,
    description: 'No content matches the client\'s Accept headers.',
    detail: 'The server cannot produce a response matching the Accept, Accept-Encoding, Accept-Language, or Accept-Charset headers sent by the client. Rare in practice; most APIs ignore Accept headers.',
  },
  {
    code: 407, name: 'Proxy Authentication Required', category: '4xx', isError: true,
    description: 'Authentication with a proxy server is required.',
    detail: 'Similar to 401 but authentication is needed with a proxy. Uses the Proxy-Authenticate and Proxy-Authorization headers instead of WWW-Authenticate.',
  },
  {
    code: 408, name: 'Request Timeout', category: '4xx', isError: true,
    description: 'The server timed out waiting for the request.',
    detail: 'The server did not receive a complete request within its timeout period. The client may resend the request without changes. Commonly seen with slow connections.',
  },
  {
    code: 409, name: 'Conflict', category: '4xx', isError: true,
    description: 'The request conflicts with the current state of the server.',
    detail: 'Common in REST APIs for optimistic concurrency: the resource was modified by another client since the client last fetched it. Also used for unique constraint violations (e.g., duplicate username).',
  },
  {
    code: 410, name: 'Gone', category: '4xx', isError: true,
    description: 'The resource existed but has been permanently deleted.',
    detail: 'Unlike 404, the server knows the resource is gone for good. Search engines remove 410 pages from their index faster than 404. Use for deliberately deleted content.',
  },
  {
    code: 411, name: 'Length Required', category: '4xx', isError: true,
    description: 'A Content-Length header is required.',
    detail: 'The server refuses to accept the request without a defined Content-Length header. Uncommon in modern HTTP/1.1 clients which always send it for requests with a body.',
  },
  {
    code: 412, name: 'Precondition Failed', category: '4xx', isError: true,
    description: 'Precondition headers (If-Match, If-Unmodified-Since) evaluated to false.',
    detail: 'Used for optimistic concurrency control. The client sends If-Match with an ETag; if the resource has changed since then, the server returns 412 instead of overwriting.',
  },
  {
    code: 413, name: 'Content Too Large', category: '4xx', isError: true,
    description: 'The request body exceeds the server\'s size limit.',
    detail: 'Formerly called "Request Entity Too Large". Common when uploading files that exceed the configured limit (e.g., Nginx client_max_body_size, API file size caps).',
  },
  {
    code: 414, name: 'URI Too Long', category: '4xx', isError: true,
    description: 'The request URI is longer than the server will interpret.',
    detail: 'Typically triggered by a GET request with very long query parameters, often caused by accidentally encoding a large payload into the URL instead of the body.',
  },
  {
    code: 415, name: 'Unsupported Media Type', category: '4xx', isError: true,
    description: 'The request\'s Content-Type is not supported by the server.',
    detail: 'The endpoint does not support the media type in the request\'s Content-Type header. Common fix: add Content-Type: application/json to your request.',
  },
  {
    code: 416, name: 'Range Not Satisfiable', category: '4xx', isError: true,
    description: 'The Range header cannot be fulfilled.',
    detail: 'The client requested a byte range (via Range header) that doesn\'t overlap with the actual size of the resource. The response includes a Content-Range header showing the valid range.',
  },
  {
    code: 417, name: 'Expectation Failed', category: '4xx', isError: true,
    description: 'The Expect request header cannot be met by the server.',
    detail: 'The server cannot meet the requirements indicated in the Expect header. For example, Expect: 100-continue when the server won\'t honor it.',
  },
  {
    code: 418, name: "I'm a Teapot", category: '4xx', isError: true,
    description: 'The server refuses to brew coffee because it is a teapot.',
    detail: 'An April Fools\' joke from RFC 2324 (Hyper Text Coffee Pot Control Protocol, 1998), made permanent in RFC 7168. Some APIs use it for "this operation is intentionally not supported." Never use in production — unless you\'re having fun.',
  },
  {
    code: 421, name: 'Misdirected Request', category: '4xx', isError: true,
    description: 'The request was directed to a server that cannot produce a response.',
    detail: 'The server is not able to produce a response for the combination of scheme and authority in the request URI. Can occur with connection reuse in HTTP/2.',
  },
  {
    code: 422, name: 'Unprocessable Content', category: '4xx', isError: true,
    description: 'The request is well-formed but has semantic errors.',
    detail: 'Formerly "Unprocessable Entity" (WebDAV). Widely used in REST APIs for validation failures: the syntax is correct (no 400) but the data is invalid (e.g., invalid email format, age < 0). Common in Rails/Django APIs.',
  },
  {
    code: 423, name: 'Locked', category: '4xx', isError: true,
    description: 'The source or destination resource is locked.',
    detail: 'WebDAV (RFC 4918). The resource is locked and cannot be modified. Rarely used outside of WebDAV file systems.',
  },
  {
    code: 424, name: 'Failed Dependency', category: '4xx', isError: true,
    description: 'The request failed because a previous request it depended on failed.',
    detail: 'WebDAV (RFC 4918). Used in a 207 Multi-Status response to indicate that this action could not be performed because a previous action in the batch failed.',
  },
  {
    code: 425, name: 'Too Early', category: '4xx', isError: true,
    description: 'The server is unwilling to process a request that might be replayed.',
    detail: 'Used with TLS 1.3 Early Data (0-RTT). The server refuses to act on data that might be replayed in a TLS handshake replay attack.',
  },
  {
    code: 426, name: 'Upgrade Required', category: '4xx', isError: true,
    description: 'The client must switch to a different protocol.',
    detail: 'The server refuses to perform the request using the current protocol but will do so after the client upgrades (indicated in the Upgrade response header, e.g., to HTTP/2 or WebSocket).',
  },
  {
    code: 428, name: 'Precondition Required', category: '4xx', isError: true,
    description: 'The server requires the request to be conditional.',
    detail: 'The origin server requires the request to use a precondition (If-Match, If-Unmodified-Since). Prevents "lost update" problems where a client GETs a resource, modifies it, and PUTs it back without checking for changes.',
  },
  {
    code: 429, name: 'Too Many Requests', category: '4xx', isError: true,
    description: 'The client has sent too many requests in a given time (rate limiting).',
    detail: 'The Retry-After header may indicate how long to wait. Universally used by APIs for rate limiting. Implement exponential backoff when you receive this. Different from 503 Service Unavailable which is server-side.',
  },
  {
    code: 431, name: 'Request Header Fields Too Large', category: '4xx', isError: true,
    description: 'The request\'s headers are too large for the server to process.',
    detail: 'Either an individual header or the total collection is too large. Common cause: very large cookies or excessively long Authorization tokens. Reduce header size and retry.',
  },
  {
    code: 451, name: 'Unavailable For Legal Reasons', category: '4xx', isError: true,
    description: 'The resource cannot be provided for legal reasons.',
    detail: 'Named after Ray Bradbury\'s "Fahrenheit 451". Used when access is denied due to legal demands like DMCA takedowns, government censorship, or court orders. The response should include details of the legal obstacle if possible.',
  },

  // 5xx Server Errors
  {
    code: 500, name: 'Internal Server Error', category: '5xx', isError: true,
    description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    detail: 'The generic catch-all server error. Something went wrong on the server and it doesn\'t know how to handle it. Check server logs. Common causes: unhandled exceptions, null pointer dereferences, database errors.',
  },
  {
    code: 501, name: 'Not Implemented', category: '5xx', isError: true,
    description: 'The server does not support the functionality required to fulfill the request.',
    detail: 'The request method is not supported by the server. Unlike 405, this implies the server doesn\'t support the method at all, not just for this resource. Commonly returned for unsupported HTTP methods.',
  },
  {
    code: 502, name: 'Bad Gateway', category: '5xx', isError: true,
    description: 'The server received an invalid response from an upstream server.',
    detail: 'A proxy or gateway received an invalid response from an upstream server. Common when a load balancer (Nginx, AWS ALB) cannot reach or gets a bad response from your application server.',
  },
  {
    code: 503, name: 'Service Unavailable', category: '5xx', isError: true,
    description: 'The server is temporarily unable to handle the request.',
    detail: 'Usually temporary: server is overloaded or down for maintenance. The Retry-After header may indicate when to try again. Unlike 429, this is server-side capacity, not client rate limiting.',
  },
  {
    code: 504, name: 'Gateway Timeout', category: '5xx', isError: true,
    description: 'The gateway did not receive a timely response from an upstream server.',
    detail: 'A proxy/gateway (Nginx, CDN, load balancer) timed out waiting for a response from your backend. Common causes: slow database queries, external API calls, or overloaded services.',
  },
  {
    code: 505, name: 'HTTP Version Not Supported', category: '5xx', isError: true,
    description: 'The server does not support the HTTP protocol version used in the request.',
    detail: 'The server refuses to support the HTTP version used in the request message. Extremely rare in modern environments.',
  },
  {
    code: 506, name: 'Variant Also Negotiates', category: '5xx', isError: true,
    description: 'Transparent content negotiation resulted in a circular reference.',
    detail: 'An experimental/obsolete code (RFC 2295). The chosen variant is itself configured to use content negotiation, creating a circular dependency. Very rarely seen.',
  },
  {
    code: 507, name: 'Insufficient Storage', category: '5xx', isError: true,
    description: 'The server cannot store the representation needed to complete the request.',
    detail: 'WebDAV (RFC 4918). The server has run out of disk space. Also sometimes used by APIs when storage quotas are exceeded.',
  },
  {
    code: 508, name: 'Loop Detected', category: '5xx', isError: true,
    description: 'The server detected an infinite loop while processing the request.',
    detail: 'WebDAV (RFC 5842). The server terminated a request because it detected an infinite loop while processing a WebDAV request with Depth: Infinity.',
  },
  {
    code: 510, name: 'Not Extended', category: '5xx', isError: true,
    description: 'Further extensions to the request are required.',
    detail: 'An obsolete code (RFC 2774). The policy for accessing the resource has not been met in the request. Essentially unused in modern systems.',
    isDeprecated: true,
  },
  {
    code: 511, name: 'Network Authentication Required', category: '5xx', isError: true,
    description: 'The client needs to authenticate to gain network access.',
    detail: 'Used by captive portals (hotel Wi-Fi, airport networks) to redirect users to a login page. The client is not authenticated with the network itself, not the server.',
  },
];

export type CategoryFilter = 'All' | '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export const CATEGORIES: CategoryFilter[] = ['All', '1xx', '2xx', '3xx', '4xx', '5xx'];

export const CATEGORY_LABELS: Record<string, string> = {
  '1xx': 'Informational',
  '2xx': 'Success',
  '3xx': 'Redirection',
  '4xx': 'Client Error',
  '5xx': 'Server Error',
};

export function filterStatusCodes(
  codes: HttpStatusCode[],
  query: string,
  category: CategoryFilter
): HttpStatusCode[] {
  return codes.filter((entry) => {
    const matchesCategory = category === 'All' || entry.category === category;
    if (!matchesCategory) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      entry.code.toString().includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.detail.toLowerCase().includes(q)
    );
  });
}
