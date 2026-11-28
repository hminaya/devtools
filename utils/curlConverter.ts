export type CodeTarget =
  | 'javascript-fetch'
  | 'typescript-fetch'
  | 'node-axios'
  | 'python-requests'
  | 'python-httpx'
  | 'go-http'
  | 'rust-reqwest'
  | 'curl';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface FormField {
  key: string;
  value: string;
  isFile: boolean;
}

export interface SecretNotice {
  location: string;
  label: string;
}

export interface ParsedCurlRequest {
  method: string;
  url: string;
  baseUrl: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  cookies: KeyValuePair[];
  auth?: { username: string; password: string };
  body?: string;
  bodyType: 'none' | 'json' | 'form-urlencoded' | 'multipart' | 'raw';
  jsonBody?: unknown;
  formData?: FormField[];
  followRedirects: boolean;
  insecure: boolean;
  compressed: boolean;
  timeoutSeconds?: number;
  proxy?: string;
  warnings: string[];
  secrets: SecretNotice[];
}

export type ParseCurlResult =
  | { ok: true; request: ParsedCurlRequest }
  | { ok: false; error: string };

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'proxy-authorization',
  'x-api-key',
  'api-key',
  'apikey',
  'x-auth-token',
  'x-access-token',
  'x-secret-key',
  'cookie',
  'set-cookie',
]);

const SENSITIVE_PARAM_NAMES = new Set([
  'api_key',
  'apikey',
  'access_token',
  'auth_token',
  'token',
  'secret',
  'client_secret',
  'password',
  'passwd',
  'key',
  'signature',
  'sig',
]);

const TOKEN_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { label: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { label: 'Stripe Secret Key', pattern: /sk_(?:live|test)_[0-9a-zA-Z]{16,}/ },
  { label: 'Google API Key', pattern: /AIza[0-9A-Za-z\-_]{35}/ },
  { label: 'Slack Token', pattern: /xox[baprs]-[A-Za-z0-9\-]{10,48}/ },
  { label: 'JWT', pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+/ },
];

function decodeAnsiCEscape(source: string, index: number): { char: string; nextIndex: number } {
  const ch = source[index];
  if (ch === undefined) return { char: '', nextIndex: index };
  switch (ch) {
    case 'n':
      return { char: '\n', nextIndex: index + 1 };
    case 'r':
      return { char: '\r', nextIndex: index + 1 };
    case 't':
      return { char: '\t', nextIndex: index + 1 };
    case 'b':
      return { char: '\b', nextIndex: index + 1 };
    case 'f':
      return { char: '\f', nextIndex: index + 1 };
    case 'v':
      return { char: '\v', nextIndex: index + 1 };
    case '\\':
    case "'":
    case '"':
    case '?':
      return { char: ch, nextIndex: index + 1 };
    case 'x': {
      const hex = source.slice(index + 1, index + 3);
      if (/^[0-9a-fA-F]{1,2}$/.test(hex)) {
        return { char: String.fromCharCode(parseInt(hex, 16)), nextIndex: index + 1 + hex.length };
      }
      return { char: 'x', nextIndex: index + 1 };
    }
    case 'u': {
      const hex = source.slice(index + 1, index + 5);
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        return { char: String.fromCodePoint(parseInt(hex, 16)), nextIndex: index + 5 };
      }
      return { char: 'u', nextIndex: index + 1 };
    }
    default:
      return { char: ch, nextIndex: index + 1 };
  }
}

/**
 * Tokenize a shell command string supporting bash, ANSI-C ($'...'), PowerShell (`),
 * and Windows cmd (^) line continuations and quoting rules.
 */
export function tokenizeShellCommand(input: string): { tokens: string[]; error?: string } {
  let normalized = input.trim();
  if (normalized.startsWith('$ ')) {
    normalized = normalized.slice(2).trimStart();
  }

  // Collapse PowerShell (`) line continuations
  normalized = normalized.replace(/`\r?\n\s*/g, ' ');

  // Normalize Windows cmd (^) continuations and Chrome DevTools "Copy as cURL (cmd)" escapes
  if (/\^\r?\n|\^"/.test(normalized)) {
    normalized = normalized
      .replace(/\^\r?\n\s*/g, ' ')
      .replace(/\^\\\^"/g, '\\"')
      .replace(/\^"/g, '"')
      .replace(/\^([{}[\]&|<>%^])/g, '$1');
  }

  const tokens: string[] = [];
  let current = '';
  let hasToken = false;
  let i = 0;

  while (i < normalized.length) {
    const ch = normalized[i];

    // Whitespace ends current token
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      if (hasToken) {
        tokens.push(current);
        current = '';
        hasToken = false;
      }
      i++;
      continue;
    }

    // Backslash line continuation outside quotes
    if (ch === '\\' && (normalized[i + 1] === '\n' || (normalized[i + 1] === '\r' && normalized[i + 2] === '\n'))) {
      i += normalized[i + 1] === '\r' ? 3 : 2;
      continue;
    }

    // ANSI-C quoting: $'...'
    if (ch === '$' && normalized[i + 1] === "'") {
      hasToken = true;
      i += 2;
      let closed = false;
      while (i < normalized.length) {
        const inner = normalized[i];
        if (inner === "'") {
          closed = true;
          i++;
          break;
        }
        if (inner === '\\') {
          const decoded = decodeAnsiCEscape(normalized, i + 1);
          current += decoded.char;
          i = decoded.nextIndex;
        } else {
          current += inner;
          i++;
        }
      }
      if (!closed) {
        return { tokens: [], error: "Unterminated $'...' quote in command." };
      }
      continue;
    }

    // Single-quoted string
    if (ch === "'") {
      hasToken = true;
      i++;
      const closeIndex = normalized.indexOf("'", i);
      if (closeIndex === -1) {
        return { tokens: [], error: 'Unterminated single quote in command.' };
      }
      current += normalized.slice(i, closeIndex);
      i = closeIndex + 1;
      continue;
    }

    // Double-quoted string
    if (ch === '"') {
      hasToken = true;
      i++;
      let closed = false;
      while (i < normalized.length) {
        const inner = normalized[i];
        if (inner === '"') {
          closed = true;
          i++;
          break;
        }
        if (inner === '\\') {
          const next = normalized[i + 1];
          if (next === '\n') {
            i += 2;
            continue;
          }
          if (next === '\r' && normalized[i + 2] === '\n') {
            i += 3;
            continue;
          }
          if (next === '"' || next === '\\' || next === '$' || next === '`') {
            current += next;
            i += 2;
            continue;
          }
        }
        current += inner;
        i++;
      }
      if (!closed) {
        return { tokens: [], error: 'Unterminated double quote in command.' };
      }
      continue;
    }

    // Unquoted backslash escape
    if (ch === '\\' && i + 1 < normalized.length) {
      hasToken = true;
      current += normalized[i + 1];
      i += 2;
      continue;
    }

    // Windows cmd ^ escape inside/outside unquoted segments (e.g. ^" or ^{)
    if (ch === '^' && i + 1 < normalized.length && (normalized[i + 1] === '"' || normalized[i + 1] === '^' || normalized[i + 1] === '&')) {
      hasToken = true;
      current += normalized[i + 1];
      i += 2;
      continue;
    }

    hasToken = true;
    current += ch;
    i++;
  }

  if (hasToken) {
    tokens.push(current);
  }

  return { tokens };
}

function parseHeaderLine(rawHeader: string): KeyValuePair | null {
  const colonIdx = rawHeader.indexOf(':');
  if (colonIdx > 0) {
    const key = rawHeader.slice(0, colonIdx).trim();
    const value = rawHeader.slice(colonIdx + 1).trimStart();
    return key ? { key, value } : null;
  }
  const semiIdx = rawHeader.indexOf(';');
  if (semiIdx > 0) {
    const key = rawHeader.slice(0, semiIdx).trim();
    return key ? { key, value: '' } : null;
  }
  return null;
}

function parseCookieHeader(cookieString: string): KeyValuePair[] {
  return cookieString
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf('=');
      if (eq === -1) return { key: part, value: '' };
      return { key: part.slice(0, eq).trim(), value: part.slice(eq + 1).trim() };
    });
}

function parseUrlParts(rawUrl: string): {
  fullUrl: string;
  baseUrl: string;
  queryParams: KeyValuePair[];
} {
  const trimmed = rawUrl.trim();
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    const queryParams: KeyValuePair[] = [];
    parsed.searchParams.forEach((value, key) => {
      queryParams.push({ key, value });
    });
    const baseUrl = `${parsed.origin}${parsed.pathname}`;
    return {
      fullUrl: hasScheme ? parsed.toString() : candidate,
      baseUrl: hasScheme ? baseUrl : baseUrl.replace(/^https:\/\//, ''),
      queryParams,
    };
  } catch {
    const qIdx = trimmed.indexOf('?');
    if (qIdx === -1) {
      return { fullUrl: trimmed, baseUrl: trimmed, queryParams: [] };
    }
    const baseUrl = trimmed.slice(0, qIdx);
    const search = new URLSearchParams(trimmed.slice(qIdx + 1));
    const queryParams: KeyValuePair[] = [];
    search.forEach((value, key) => {
      queryParams.push({ key, value });
    });
    return { fullUrl: trimmed, baseUrl, queryParams };
  }
}

function buildUrlWithParams(baseUrl: string, queryParams: KeyValuePair[]): string {
  if (queryParams.length === 0) return baseUrl;
  const search = new URLSearchParams();
  for (const param of queryParams) {
    search.append(param.key, param.value);
  }
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}${search.toString()}`;
}

function detectSecrets(request: Omit<ParsedCurlRequest, 'secrets'>): SecretNotice[] {
  const secrets: SecretNotice[] = [];
  const seen = new Set<string>();

  const pushUnique = (location: string, label: string) => {
    const id = `${location}:${label}`;
    if (!seen.has(id)) {
      seen.add(id);
      secrets.push({ location, label });
    }
  };

  if (request.auth) {
    pushUnique('Basic Auth (-u)', 'Username & password credentials');
  }

  for (const header of request.headers) {
    const lower = header.key.toLowerCase();
    if (SENSITIVE_HEADER_NAMES.has(lower) && header.value) {
      pushUnique(`Header: ${header.key}`, lower === 'authorization' ? 'Authorization credential' : 'Sensitive header');
    }
    for (const detector of TOKEN_PATTERNS) {
      if (detector.pattern.test(header.value)) {
        pushUnique(`Header: ${header.key}`, detector.label);
      }
    }
  }

  for (const param of request.queryParams) {
    if (SENSITIVE_PARAM_NAMES.has(param.key.toLowerCase()) && param.value) {
      pushUnique(`Query param: ${param.key}`, 'Sensitive query parameter');
    }
    for (const detector of TOKEN_PATTERNS) {
      if (detector.pattern.test(param.value)) {
        pushUnique(`Query param: ${param.key}`, detector.label);
      }
    }
  }

  if (request.cookies.length > 0) {
    pushUnique('Cookies', `${request.cookies.length} cookie value${request.cookies.length === 1 ? '' : 's'}`);
  }

  if (request.body) {
    for (const detector of TOKEN_PATTERNS) {
      if (detector.pattern.test(request.body)) {
        pushUnique('Request body', detector.label);
      }
    }
  }

  return secrets;
}

const VALUE_FLAGS = new Set([
  '-X', '--request',
  '--url',
  '-H', '--header',
  '-A', '--user-agent',
  '-e', '--referer',
  '-b', '--cookie',
  '-u', '--user',
  '-d', '--data', '--data-raw', '--data-ascii', '--data-binary', '--data-urlencode',
  '--json',
  '-F', '--form', '--form-string',
  '-m', '--max-time', '--connect-timeout',
  '-x', '--proxy',
  '-o', '--output',
  '-c', '--cookie-jar',
  '--cert', '--key', '--cacert',
  '--interface', '--resolve',
]);

const BOOLEAN_FLAGS = new Set([
  '-G', '--get',
  '-I', '--head',
  '-L', '--location',
  '-k', '--insecure',
  '--compressed',
  '-s', '--silent',
  '-S', '--show-error',
  '-v', '--verbose',
  '-i', '--include',
  '-f', '--fail',
  '--fail-with-body',
  '--http1.1', '--http2', '--http3',
  '--tlsv1.2', '--tlsv1.3',
  '--raw',
  '-N', '--no-buffer',
  '-g', '--globoff',
]);

export function parseCurlCommand(input: string): ParseCurlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: 'Paste a cURL command to parse and convert.' };
  }

  const tokenized = tokenizeShellCommand(trimmed);
  if (tokenized.error) {
    return { ok: false, error: tokenized.error };
  }

  const tokens = tokenized.tokens;
  if (tokens.length === 0) {
    return { ok: false, error: 'Paste a cURL command to parse and convert.' };
  }

  const first = tokens[0]!.toLowerCase();
  const isCurlExecutable =
    first === 'curl' ||
    first === 'curl.exe' ||
    first.endsWith('/curl') ||
    first.endsWith('\\curl.exe');

  if (!isCurlExecutable) {
    return {
      ok: false,
      error: 'Command must start with "curl" (for example: curl https://api.example.com/users).',
    };
  }

  let explicitMethod: string | undefined;
  let forceGet = false;
  let forceHead = false;
  let rawUrl = '';
  const headers: KeyValuePair[] = [];
  const cookies: KeyValuePair[] = [];
  let auth: { username: string; password: string } | undefined;
  const dataParts: Array<{ value: string; urlencode: boolean }> = [];
  const formFields: FormField[] = [];
  let jsonFlagUsed = false;
  let followRedirects = false;
  let insecure = false;
  let compressed = false;
  let timeoutSeconds: number | undefined;
  let proxy: string | undefined;
  const warnings: string[] = [];

  let i = 1;
  while (i < tokens.length) {
    let token = tokens[i]!;
    let inlineValue: string | undefined;

    // Handle --flag=value
    if (token.startsWith('--') && token.includes('=')) {
      const eqIdx = token.indexOf('=');
      inlineValue = token.slice(eqIdx + 1);
      token = token.slice(0, eqIdx);
    } else if (
      token.startsWith('-') &&
      !token.startsWith('--') &&
      token.length > 2 &&
      VALUE_FLAGS.has(token.slice(0, 2))
    ) {
      // Handle attached short flag like -XPOST or -HAccept:application/json
      inlineValue = token.slice(2);
      token = token.slice(0, 2);
    }

    // Handle combined short boolean flags like -sSL or -sLk
    if (
      token.startsWith('-') &&
      !token.startsWith('--') &&
      token.length > 2 &&
      !VALUE_FLAGS.has(token)
    ) {
      const chars = token.slice(1).split('');
      const expanded: string[] = [];
      let allKnown = true;
      for (let c = 0; c < chars.length; c++) {
        const shortFlag = `-${chars[c]}`;
        if (BOOLEAN_FLAGS.has(shortFlag)) {
          expanded.push(shortFlag);
        } else if (VALUE_FLAGS.has(shortFlag) && c === chars.length - 1) {
          expanded.push(shortFlag);
        } else {
          allKnown = false;
          break;
        }
      }
      if (allKnown && expanded.length > 0) {
        tokens.splice(i, 1, ...expanded);
        continue;
      }
    }

    const consumeValue = (): string | undefined => {
      if (inlineValue !== undefined) return inlineValue;
      if (i + 1 < tokens.length) {
        i++;
        return tokens[i];
      }
      return undefined;
    };

    switch (token) {
      case '-X':
      case '--request': {
        const val = consumeValue();
        if (val) explicitMethod = val.toUpperCase();
        break;
      }
      case '--url': {
        const val = consumeValue();
        if (val) rawUrl = val;
        break;
      }
      case '-H':
      case '--header': {
        const val = consumeValue();
        if (val) {
          const parsed = parseHeaderLine(val);
          if (parsed) {
            if (parsed.key.toLowerCase() === 'cookie') {
              cookies.push(...parseCookieHeader(parsed.value));
            } else {
              headers.push(parsed);
            }
          }
        }
        break;
      }
      case '-A':
      case '--user-agent': {
        const val = consumeValue();
        if (val !== undefined) headers.push({ key: 'User-Agent', value: val });
        break;
      }
      case '-e':
      case '--referer': {
        const val = consumeValue();
        if (val !== undefined) headers.push({ key: 'Referer', value: val });
        break;
      }
      case '-b':
      case '--cookie': {
        const val = consumeValue();
        if (val) cookies.push(...parseCookieHeader(val));
        break;
      }
      case '-u':
      case '--user': {
        const val = consumeValue();
        if (val !== undefined) {
          const colonIdx = val.indexOf(':');
          if (colonIdx === -1) {
            auth = { username: val, password: '' };
          } else {
            auth = { username: val.slice(0, colonIdx), password: val.slice(colonIdx + 1) };
          }
        }
        break;
      }
      case '-d':
      case '--data':
      case '--data-raw':
      case '--data-ascii':
      case '--data-binary': {
        const val = consumeValue();
        if (val !== undefined) dataParts.push({ value: val, urlencode: false });
        break;
      }
      case '--data-urlencode': {
        const val = consumeValue();
        if (val !== undefined) dataParts.push({ value: val, urlencode: true });
        break;
      }
      case '--json': {
        const val = consumeValue();
        if (val !== undefined) {
          jsonFlagUsed = true;
          dataParts.push({ value: val, urlencode: false });
        }
        break;
      }
      case '-F':
      case '--form':
      case '--form-string': {
        const val = consumeValue();
        if (val) {
          const eqIdx = val.indexOf('=');
          if (eqIdx > 0) {
            const key = val.slice(0, eqIdx);
            const rawFieldVal = val.slice(eqIdx + 1);
            const isFile = token !== '--form-string' && rawFieldVal.startsWith('@');
            formFields.push({
              key,
              value: isFile ? rawFieldVal.slice(1) : rawFieldVal,
              isFile,
            });
          }
        }
        break;
      }
      case '-G':
      case '--get':
        forceGet = true;
        break;
      case '-I':
      case '--head':
        forceHead = true;
        break;
      case '-L':
      case '--location':
        followRedirects = true;
        break;
      case '-k':
      case '--insecure':
        insecure = true;
        break;
      case '--compressed':
        compressed = true;
        break;
      case '-m':
      case '--max-time':
      case '--connect-timeout': {
        const val = consumeValue();
        if (val && !Number.isNaN(Number(val))) {
          timeoutSeconds = Number(val);
        }
        break;
      }
      case '-x':
      case '--proxy': {
        const val = consumeValue();
        if (val) proxy = val;
        break;
      }
      default: {
        if (BOOLEAN_FLAGS.has(token)) {
          break;
        }
        if (VALUE_FLAGS.has(token)) {
          consumeValue();
          warnings.push(`Flag ${token} was parsed and omitted from generated code.`);
          break;
        }
        if (token.startsWith('-')) {
          warnings.push(`Unrecognized flag ${token} was ignored.`);
          break;
        }
        if (!rawUrl) {
          rawUrl = token;
        } else {
          warnings.push(`Extra positional argument "${token}" was ignored.`);
        }
        break;
      }
    }

    i++;
  }

  if (!rawUrl) {
    return { ok: false, error: 'No URL found in the cURL command.' };
  }

  if (jsonFlagUsed) {
    if (!headers.some((h) => h.key.toLowerCase() === 'content-type')) {
      headers.push({ key: 'Content-Type', value: 'application/json' });
    }
    if (!headers.some((h) => h.key.toLowerCase() === 'accept')) {
      headers.push({ key: 'Accept', value: 'application/json' });
    }
  }

  const urlParts = parseUrlParts(rawUrl);
  const queryParams = [...urlParts.queryParams];

  // Resolve HTTP method
  let method = explicitMethod;
  if (!method) {
    if (forceHead) {
      method = 'HEAD';
    } else if (forceGet) {
      method = 'GET';
    } else if (dataParts.length > 0 || formFields.length > 0) {
      method = 'POST';
    } else {
      method = 'GET';
    }
  }

  let body: string | undefined;
  let bodyType: ParsedCurlRequest['bodyType'] = 'none';
  let jsonBody: unknown;
  let formData: FormField[] | undefined;

  if (formFields.length > 0) {
    bodyType = 'multipart';
    formData = formFields;
  } else if (dataParts.length > 0) {
    if (forceGet) {
      for (const part of dataParts) {
        const eqIdx = part.value.indexOf('=');
        if (eqIdx > 0) {
          queryParams.push({
            key: part.value.slice(0, eqIdx),
            value: part.value.slice(eqIdx + 1),
          });
        } else if (part.value) {
          queryParams.push({ key: part.value, value: '' });
        }
      }
    } else {
      const encodedPieces = dataParts.map((part) => {
        if (!part.urlencode) return part.value;
        const eqIdx = part.value.indexOf('=');
        if (eqIdx > 0) {
          const k = encodeURIComponent(part.value.slice(0, eqIdx));
          const v = encodeURIComponent(part.value.slice(eqIdx + 1));
          return `${k}=${v}`;
        }
        return encodeURIComponent(part.value);
      });
      body = encodedPieces.join('&');

      const contentType = headers.find((h) => h.key.toLowerCase() === 'content-type')?.value.toLowerCase() || '';
      const trimmedBody = body.trim();
      const looksJson =
        contentType.includes('application/json') ||
        contentType.includes('+json') ||
        trimmedBody.startsWith('{') ||
        trimmedBody.startsWith('[');

      if (looksJson) {
        try {
          jsonBody = JSON.parse(body);
          bodyType = 'json';
        } catch {
          bodyType = 'raw';
        }
      } else if (
        contentType.includes('application/x-www-form-urlencoded') ||
        (dataParts.length > 1 && dataParts.every((p) => p.value.includes('='))) ||
        dataParts.some((p) => p.urlencode)
      ) {
        bodyType = 'form-urlencoded';
      } else {
        bodyType = 'raw';
      }
    }
  }

  const finalUrl = buildUrlWithParams(urlParts.baseUrl, queryParams);

  const partialRequest: Omit<ParsedCurlRequest, 'secrets'> = {
    method,
    url: finalUrl,
    baseUrl: urlParts.baseUrl,
    queryParams,
    headers,
    cookies,
    auth,
    body,
    bodyType,
    jsonBody,
    formData,
    followRedirects,
    insecure,
    compressed,
    timeoutSeconds,
    proxy,
    warnings,
  };

  return {
    ok: true,
    request: {
      ...partialRequest,
      secrets: detectSecrets(partialRequest),
    },
  };
}

function applyRedaction(req: ParsedCurlRequest): ParsedCurlRequest {
  const redactedHeaders = req.headers.map((header) => {
    const lower = header.key.toLowerCase();
    const isSensitive =
      SENSITIVE_HEADER_NAMES.has(lower) || TOKEN_PATTERNS.some((d) => d.pattern.test(header.value));
    if (!isSensitive) return header;
    if (lower === 'authorization') {
      const scheme = header.value.split(/\s+/)[0];
      if (scheme && (scheme.toLowerCase() === 'bearer' || scheme.toLowerCase() === 'basic')) {
        return { key: header.key, value: `${scheme} <REDACTED>` };
      }
    }
    return { key: header.key, value: '<REDACTED>' };
  });

  const redactedParams = req.queryParams.map((param) => {
    const isSensitive =
      SENSITIVE_PARAM_NAMES.has(param.key.toLowerCase()) ||
      TOKEN_PATTERNS.some((d) => d.pattern.test(param.value));
    return isSensitive ? { key: param.key, value: '<REDACTED>' } : param;
  });

  const redactedCookies = req.cookies.map((cookie) => ({
    key: cookie.key,
    value: '<REDACTED>',
  }));

  const redactedAuth = req.auth
    ? { username: req.auth.username, password: '<REDACTED>' }
    : undefined;

  let redactedBody = req.body;
  if (redactedBody) {
    for (const detector of TOKEN_PATTERNS) {
      redactedBody = redactedBody.replace(new RegExp(detector.pattern.source, 'g'), '<REDACTED>');
    }
  }

  let redactedJsonBody = req.jsonBody;
  if (redactedBody && req.bodyType === 'json') {
    try {
      redactedJsonBody = JSON.parse(redactedBody);
    } catch {
      // Keep original parsed JSON if regex replacement invalidated structure
    }
  }

  return {
    ...req,
    headers: redactedHeaders,
    queryParams: redactedParams,
    cookies: redactedCookies,
    auth: redactedAuth,
    url: buildUrlWithParams(req.baseUrl, redactedParams),
    body: redactedBody,
    jsonBody: redactedJsonBody,
  };
}

function escapeSingleJs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

function escapeDouble(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

function escapeBashSingle(str: string): string {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

function toPythonLiteral(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const nextPad = '  '.repeat(indent + 1);
  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return `'${escapeSingleJs(value)}'`;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((item) => `${nextPad}${toPythonLiteral(item, indent + 1)}`);
    return `[\n${items.join(',\n')},\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries.map(
      ([k, v]) => `${nextPad}'${escapeSingleJs(k)}': ${toPythonLiteral(v, indent + 1)}`,
    );
    return `{\n${lines.join(',\n')},\n${pad}}`;
  }
  return 'None';
}

function encodeBasicAuthBase64(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  if (typeof btoa === 'function') {
    const bytes = new TextEncoder().encode(credentials);
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }
  return Buffer.from(credentials, 'utf-8').toString('base64');
}

function mergedHeadersForCode(req: ParsedCurlRequest, includeCookieHeader: boolean, includeBasicAuthHeader: boolean): KeyValuePair[] {
  const out = [...req.headers];
  if (includeCookieHeader && req.cookies.length > 0 && !out.some((h) => h.key.toLowerCase() === 'cookie')) {
    out.push({
      key: 'Cookie',
      value: req.cookies.map((c) => `${c.key}=${c.value}`).join('; '),
    });
  }
  if (includeBasicAuthHeader && req.auth && !out.some((h) => h.key.toLowerCase() === 'authorization')) {
    out.push({
      key: 'Authorization',
      value: `Basic ${encodeBasicAuthBase64(req.auth.username, req.auth.password)}`,
    });
  }
  return out;
}

function generateJsTsFetch(req: ParsedCurlRequest, isTypeScript: boolean): string {
  const headers = mergedHeadersForCode(req, true, true);
  const lines: string[] = [];

  if (req.queryParams.length > 0) {
    lines.push(`const params = new URLSearchParams({`);
    for (const p of req.queryParams) {
      lines.push(`  '${escapeSingleJs(p.key)}': '${escapeSingleJs(p.value)}',`);
    }
    lines.push(`});`);
    lines.push('');
  }

  const targetUrl =
    req.queryParams.length > 0
      ? `\`${req.baseUrl}?\${params.toString()}\``
      : `'${escapeSingleJs(req.baseUrl)}'`;

  const optionsLines: string[] = [];
  if (req.method !== 'GET' || headers.length > 0 || req.bodyType !== 'none' || !req.followRedirects) {
    optionsLines.push(`  method: '${req.method}',`);
  }

  if (headers.length > 0) {
    optionsLines.push(`  headers: {`);
    for (const h of headers) {
      optionsLines.push(`    '${escapeSingleJs(h.key)}': '${escapeSingleJs(h.value)}',`);
    }
    optionsLines.push(`  },`);
  }

  if (req.bodyType === 'json' && req.jsonBody !== undefined) {
    const formatted = JSON.stringify(req.jsonBody, null, 2)
      .split('\n')
      .map((line, idx) => (idx === 0 ? line : `  ${line}`))
      .join('\n');
    optionsLines.push(`  body: JSON.stringify(${formatted}),`);
  } else if (req.bodyType === 'form-urlencoded' && req.body) {
    const sp = new URLSearchParams(req.body);
    optionsLines.push(`  body: new URLSearchParams({`);
    sp.forEach((v, k) => {
      optionsLines.push(`    '${escapeSingleJs(k)}': '${escapeSingleJs(v)}',`);
    });
    optionsLines.push(`  }),`);
  } else if (req.bodyType === 'multipart' && req.formData) {
    lines.push(`const formData = new FormData();`);
    for (const f of req.formData) {
      if (f.isFile) {
        lines.push(`// Attach file from ${f.value}`);
        lines.push(`// formData.append('${escapeSingleJs(f.key)}', fileInput.files[0]);`);
      } else {
        lines.push(`formData.append('${escapeSingleJs(f.key)}', '${escapeSingleJs(f.value)}');`);
      }
    }
    lines.push('');
    optionsLines.push(`  body: formData,`);
  } else if (req.bodyType === 'raw' && req.body !== undefined) {
    optionsLines.push(`  body: '${escapeSingleJs(req.body)}',`);
  }

  if (req.followRedirects) {
    optionsLines.push(`  redirect: 'follow',`);
  }

  if (optionsLines.length === 0) {
    lines.push(`const response${isTypeScript ? ': Response' : ''} = await fetch(${targetUrl});`);
  } else {
    const initAnnotation = isTypeScript ? ': RequestInit' : '';
    lines.push(`const options${initAnnotation} = {`);
    lines.push(...optionsLines);
    lines.push(`};`);
    lines.push('');
    lines.push(`const response${isTypeScript ? ': Response' : ''} = await fetch(${targetUrl}, options);`);
  }

  lines.push(`if (!response.ok) {`);
  lines.push(`  throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);`);
  lines.push(`}`);
  lines.push(`const data${isTypeScript ? ': unknown' : ''} = await response.json();`);
  lines.push(`console.log(data);`);

  return lines.join('\n');
}

function generateNodeAxios(req: ParsedCurlRequest): string {
  const headers = mergedHeadersForCode(req, true, false);
  const lines: string[] = [`import axios from 'axios';`, ''];

  if (req.bodyType === 'multipart' && req.formData) {
    lines.push(`const formData = new FormData();`);
    for (const f of req.formData) {
      if (f.isFile) {
        lines.push(`// formData.append('${escapeSingleJs(f.key)}', fs.createReadStream('${escapeSingleJs(f.value)}'));`);
      } else {
        lines.push(`formData.append('${escapeSingleJs(f.key)}', '${escapeSingleJs(f.value)}');`);
      }
    }
    lines.push('');
  }

  lines.push(`const response = await axios({`);
  lines.push(`  method: '${req.method.toLowerCase()}',`);
  lines.push(`  url: '${escapeSingleJs(req.baseUrl)}',`);

  if (req.queryParams.length > 0) {
    lines.push(`  params: {`);
    for (const p of req.queryParams) {
      lines.push(`    '${escapeSingleJs(p.key)}': '${escapeSingleJs(p.value)}',`);
    }
    lines.push(`  },`);
  }

  if (headers.length > 0) {
    lines.push(`  headers: {`);
    for (const h of headers) {
      lines.push(`    '${escapeSingleJs(h.key)}': '${escapeSingleJs(h.value)}',`);
    }
    lines.push(`  },`);
  }

  if (req.auth) {
    lines.push(`  auth: {`);
    lines.push(`    username: '${escapeSingleJs(req.auth.username)}',`);
    lines.push(`    password: '${escapeSingleJs(req.auth.password)}',`);
    lines.push(`  },`);
  }

  if (req.bodyType === 'json' && req.jsonBody !== undefined) {
    const formatted = JSON.stringify(req.jsonBody, null, 2)
      .split('\n')
      .map((line, idx) => (idx === 0 ? line : `  ${line}`))
      .join('\n');
    lines.push(`  data: ${formatted},`);
  } else if (req.bodyType === 'form-urlencoded' && req.body) {
    const sp = new URLSearchParams(req.body);
    lines.push(`  data: new URLSearchParams({`);
    sp.forEach((v, k) => {
      lines.push(`    '${escapeSingleJs(k)}': '${escapeSingleJs(v)}',`);
    });
    lines.push(`  }),`);
  } else if (req.bodyType === 'multipart') {
    lines.push(`  data: formData,`);
  } else if (req.bodyType === 'raw' && req.body !== undefined) {
    lines.push(`  data: '${escapeSingleJs(req.body)}',`);
  }

  if (req.timeoutSeconds !== undefined) {
    lines.push(`  timeout: ${req.timeoutSeconds * 1000},`);
  }

  lines.push(`});`);
  lines.push('');
  lines.push(`console.log(response.data);`);
  return lines.join('\n');
}

function generatePython(req: ParsedCurlRequest, lib: 'requests' | 'httpx'): string {
  const headers = mergedHeadersForCode(req, false, false).filter((h) => {
    if (req.bodyType === 'json' && h.key.toLowerCase() === 'content-type' && h.value.toLowerCase().includes('application/json')) {
      return false;
    }
    return true;
  });

  const lines: string[] = [`import ${lib}`, ''];

  if (headers.length > 0) {
    lines.push(`headers = {`);
    for (const h of headers) {
      lines.push(`  '${escapeSingleJs(h.key)}': '${escapeSingleJs(h.value)}',`);
    }
    lines.push(`}`);
    lines.push('');
  }

  if (req.cookies.length > 0) {
    lines.push(`cookies = {`);
    for (const c of req.cookies) {
      lines.push(`  '${escapeSingleJs(c.key)}': '${escapeSingleJs(c.value)}',`);
    }
    lines.push(`}`);
    lines.push('');
  }

  if (req.queryParams.length > 0) {
    lines.push(`params = {`);
    for (const p of req.queryParams) {
      lines.push(`  '${escapeSingleJs(p.key)}': '${escapeSingleJs(p.value)}',`);
    }
    lines.push(`}`);
    lines.push('');
  }

  if (req.bodyType === 'json' && req.jsonBody !== undefined) {
    lines.push(`json_data = ${toPythonLiteral(req.jsonBody)}`);
    lines.push('');
  } else if (req.bodyType === 'form-urlencoded' && req.body) {
    const sp = new URLSearchParams(req.body);
    lines.push(`data = {`);
    sp.forEach((v, k) => {
      lines.push(`  '${escapeSingleJs(k)}': '${escapeSingleJs(v)}',`);
    });
    lines.push(`}`);
    lines.push('');
  } else if (req.bodyType === 'multipart' && req.formData) {
    const textFields = req.formData.filter((f) => !f.isFile);
    const fileFields = req.formData.filter((f) => f.isFile);
    if (textFields.length > 0) {
      lines.push(`data = {`);
      for (const f of textFields) {
        lines.push(`  '${escapeSingleJs(f.key)}': '${escapeSingleJs(f.value)}',`);
      }
      lines.push(`}`);
      lines.push('');
    }
    if (fileFields.length > 0) {
      lines.push(`files = {`);
      for (const f of fileFields) {
        lines.push(`  '${escapeSingleJs(f.key)}': open('${escapeSingleJs(f.value)}', 'rb'),`);
      }
      lines.push(`}`);
      lines.push('');
    }
  } else if (req.bodyType === 'raw' && req.body !== undefined) {
    lines.push(`data = '${escapeSingleJs(req.body)}'`);
    lines.push('');
  }

  const methodLower = req.method.toLowerCase();
  const standardMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
  const callArgs: string[] = [`'${escapeSingleJs(req.baseUrl)}'`];

  if (!standardMethods.has(methodLower)) {
    callArgs.unshift(`'${req.method}'`);
  }
  if (req.queryParams.length > 0) callArgs.push('params=params');
  if (headers.length > 0) callArgs.push('headers=headers');
  if (req.cookies.length > 0) callArgs.push('cookies=cookies');
  if (req.auth) {
    callArgs.push(`auth=('${escapeSingleJs(req.auth.username)}', '${escapeSingleJs(req.auth.password)}')`);
  }
  if (req.bodyType === 'json' && req.jsonBody !== undefined) {
    callArgs.push('json=json_data');
  } else if (req.bodyType === 'form-urlencoded' && req.body) {
    callArgs.push('data=data');
  } else if (req.bodyType === 'multipart' && req.formData) {
    if (req.formData.some((f) => !f.isFile)) callArgs.push('data=data');
    if (req.formData.some((f) => f.isFile)) callArgs.push('files=files');
  } else if (req.bodyType === 'raw' && req.body !== undefined) {
    callArgs.push('data=data');
  }

  if (req.insecure) {
    callArgs.push('verify=False');
  }
  if (req.followRedirects && lib === 'httpx') {
    callArgs.push('follow_redirects=True');
  }
  if (req.timeoutSeconds !== undefined) {
    callArgs.push(`timeout=${req.timeoutSeconds}`);
  }

  const fnName = standardMethods.has(methodLower) ? `${lib}.${methodLower}` : `${lib}.request`;
  if (callArgs.length <= 2) {
    lines.push(`response = ${fnName}(${callArgs.join(', ')})`);
  } else {
    lines.push(`response = ${fnName}(`);
    for (const arg of callArgs) {
      lines.push(`  ${arg},`);
    }
    lines.push(`)`);
  }

  lines.push(`response.raise_for_status()`);
  lines.push(`print(response.text)`);

  return lines.join('\n');
}

function generateGoHttp(req: ParsedCurlRequest): string {
  const headers = mergedHeadersForCode(req, true, false);
  const hasBody = req.bodyType === 'json' || req.bodyType === 'form-urlencoded' || req.bodyType === 'raw';

  const imports = ['"fmt"', '"io"', '"net/http"'];
  if (hasBody) imports.push('"strings"');
  if (req.timeoutSeconds !== undefined) imports.push('"time"');
  imports.sort();

  const lines: string[] = [
    'package main',
    '',
    'import (',
    ...imports.map((imp) => `\t${imp}`),
    ')',
    '',
    'func main() {',
  ];

  let bodyExpr = 'nil';
  if (req.bodyType === 'json' && req.jsonBody !== undefined) {
    const compact = JSON.stringify(req.jsonBody);
    lines.push(`\tpayload := strings.NewReader("${escapeDouble(compact)}")`);
    bodyExpr = 'payload';
  } else if ((req.bodyType === 'form-urlencoded' || req.bodyType === 'raw') && req.body !== undefined) {
    lines.push(`\tpayload := strings.NewReader("${escapeDouble(req.body)}")`);
    bodyExpr = 'payload';
  } else if (req.bodyType === 'multipart') {
    lines.push('\t// TODO: build multipart/form-data payload using mime/multipart');
  }

  lines.push(`\treq, err := http.NewRequest("${req.method}", "${escapeDouble(req.url)}", ${bodyExpr})`);
  lines.push('\tif err != nil {');
  lines.push('\t\tpanic(err)');
  lines.push('\t}');

  for (const h of headers) {
    lines.push(`\treq.Header.Set("${escapeDouble(h.key)}", "${escapeDouble(h.value)}")`);
  }

  if (req.auth) {
    lines.push(`\treq.SetBasicAuth("${escapeDouble(req.auth.username)}", "${escapeDouble(req.auth.password)}")`);
  }

  lines.push('');
  if (req.timeoutSeconds !== undefined) {
    lines.push(`\tclient := &http.Client{Timeout: ${req.timeoutSeconds} * time.Second}`);
  } else {
    lines.push('\tclient := &http.Client{}');
  }
  lines.push('\tresp, err := client.Do(req)');
  lines.push('\tif err != nil {');
  lines.push('\t\tpanic(err)');
  lines.push('\t}');
  lines.push('\tdefer resp.Body.Close()');
  lines.push('');
  lines.push('\tbody, err := io.ReadAll(resp.Body)');
  lines.push('\tif err != nil {');
  lines.push('\t\tpanic(err)');
  lines.push('\t}');
  lines.push('\tfmt.Println(string(body))');
  lines.push('}');

  return lines.join('\n');
}

function generateRustReqwest(req: ParsedCurlRequest): string {
  const headers = mergedHeadersForCode(req, true, false);
  const lines: string[] = [
    'use reqwest::Client;',
    ...(req.bodyType === 'json' ? ['use serde_json::json;'] : []),
    '',
    '#[tokio::main]',
    'async fn main() -> Result<(), Box<dyn std::error::Error>> {',
    '    let client = Client::new();',
    `    let res = client`,
  ];

  const methodLower = req.method.toLowerCase();
  const knownMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head']);
  if (knownMethods.has(methodLower)) {
    lines.push(`        .${methodLower}("${escapeDouble(req.url)}")`);
  } else {
    lines.push(`        .request(reqwest::Method::from_bytes(b"${req.method}")?, "${escapeDouble(req.url)}")`);
  }

  for (const h of headers) {
    if (req.bodyType === 'json' && h.key.toLowerCase() === 'content-type') continue;
    lines.push(`        .header("${escapeDouble(h.key)}", "${escapeDouble(h.value)}")`);
  }

  if (req.auth) {
    lines.push(
      `        .basic_auth("${escapeDouble(req.auth.username)}", Some("${escapeDouble(req.auth.password)}"))`,
    );
  }

  if (req.bodyType === 'json' && req.jsonBody !== undefined) {
    const formatted = JSON.stringify(req.jsonBody, null, 2)
      .split('\n')
      .map((line, idx) => (idx === 0 ? line : `        ${line}`))
      .join('\n');
    lines.push(`        .json(&json!(${formatted}))`);
  } else if (req.bodyType === 'form-urlencoded' && req.body) {
    const sp = new URLSearchParams(req.body);
    const pairs: string[] = [];
    sp.forEach((v, k) => {
      pairs.push(`("${escapeDouble(k)}", "${escapeDouble(v)}")`);
    });
    lines.push(`        .form(&[${pairs.join(', ')}])`);
  } else if (req.bodyType === 'raw' && req.body !== undefined) {
    lines.push(`        .body("${escapeDouble(req.body)}")`);
  }

  lines.push('        .send()');
  lines.push('        .await?;');
  lines.push('');
  lines.push('    let body = res.text().await?;');
  lines.push('    println!("{}", body);');
  lines.push('    Ok(())');
  lines.push('}');

  return lines.join('\n');
}

function generateFormattedCurl(req: ParsedCurlRequest): string {
  const parts: string[] = [`curl -X ${req.method} ${escapeBashSingle(req.url)}`];

  for (const h of req.headers) {
    parts.push(`  -H ${escapeBashSingle(`${h.key}: ${h.value}`)}`);
  }

  if (req.cookies.length > 0) {
    const cookieVal = req.cookies.map((c) => `${c.key}=${c.value}`).join('; ');
    parts.push(`  -b ${escapeBashSingle(cookieVal)}`);
  }

  if (req.auth) {
    parts.push(`  -u ${escapeBashSingle(`${req.auth.username}:${req.auth.password}`)}`);
  }

  if (req.bodyType === 'multipart' && req.formData) {
    for (const f of req.formData) {
      const val = f.isFile ? `@${f.value}` : f.value;
      parts.push(`  -F ${escapeBashSingle(`${f.key}=${val}`)}`);
    }
  } else if (req.body !== undefined) {
    const formattedBody =
      req.bodyType === 'json' && req.jsonBody !== undefined
        ? JSON.stringify(req.jsonBody)
        : req.body;
    parts.push(`  -d ${escapeBashSingle(formattedBody)}`);
  }

  if (req.followRedirects) parts.push('  -L');
  if (req.insecure) parts.push('  -k');
  if (req.compressed) parts.push('  --compressed');
  if (req.timeoutSeconds !== undefined) parts.push(`  --max-time ${req.timeoutSeconds}`);
  if (req.proxy) parts.push(`  -x ${escapeBashSingle(req.proxy)}`);

  return parts.join(' \\\n');
}

export function generateCode(
  request: ParsedCurlRequest,
  target: CodeTarget,
  options?: { redactSecrets?: boolean },
): string {
  const effective = options?.redactSecrets ? applyRedaction(request) : request;

  switch (target) {
    case 'javascript-fetch':
      return generateJsTsFetch(effective, false);
    case 'typescript-fetch':
      return generateJsTsFetch(effective, true);
    case 'node-axios':
      return generateNodeAxios(effective);
    case 'python-requests':
      return generatePython(effective, 'requests');
    case 'python-httpx':
      return generatePython(effective, 'httpx');
    case 'go-http':
      return generateGoHttp(effective);
    case 'rust-reqwest':
      return generateRustReqwest(effective);
    case 'curl':
      return generateFormattedCurl(effective);
  }
}
