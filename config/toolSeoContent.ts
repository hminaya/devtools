import { MIME_ENTRIES } from '../utils/mimeTypes';

export interface ToolSeoContent {
  overview: string;
  steps: string[];
  details: Array<{
    title: string;
    body: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  references?: Array<{
    label: string;
    href: string;
  }>;
}

export const TOOL_SEO_CONTENT: Partial<Record<string, ToolSeoContent>> = {
  'json-prettifier': {
    overview: 'This formatter parses JSON with the browser’s built-in JSON parser, then serializes it with consistent two-space indentation. It can also remove insignificant whitespace for compact storage or transport. Your input is processed in the current browser tab and is not uploaded by this tool.',
    steps: [
      'Paste a JSON object, array, string, number, boolean, or null value into the input field.',
      'Choose Prettify to format and validate the value, or Minify to produce compact JSON.',
      'Review any parser error or suggestion, then copy the output when the input is valid.',
    ],
    details: [
      {
        title: 'JSON versus JavaScript objects',
        body: 'Valid JSON requires double-quoted property names and strings. It does not allow comments, trailing commas, undefined values, functions, or single-quoted strings. The prettifier can repair simple unquoted property names, but it deliberately reports other syntax problems instead of silently changing data.',
      },
      {
        title: 'Formatting does not change values',
        body: 'Prettifying changes whitespace only after parsing succeeds. Object keys, array order, strings, numbers, booleans, and null values are preserved according to JSON.parse and JSON.stringify behavior.',
      },
    ],
    faqs: [
      {
        question: 'Why is my JSON invalid even though it works in JavaScript?',
        answer: 'JavaScript object literals support syntax that JSON does not, including comments, trailing commas, single quotes, and unquoted keys. Convert those constructs to strict JSON syntax first.',
      },
      {
        question: 'Does the formatter send JSON to a server?',
        answer: 'No. Formatting, validation, minification, and the sample generator run in your browser.',
      },
    ],
    references: [{ label: 'RFC 8259: The JSON Data Interchange Format', href: 'https://www.rfc-editor.org/rfc/rfc8259' }],
  },
  'regex-tester': {
    overview: 'The regex tester runs patterns with the JavaScript RegExp engine and updates matches as you edit. It highlights matched text, reports match indexes and capture groups, and can preview replacement output without sending the test string anywhere.',
    steps: [
      'Enter a pattern without surrounding slash delimiters.',
      'Enable the global, case-insensitive, multiline, or dotAll flags you need.',
      'Paste a test string and inspect highlighted matches, capture groups, or replacement output.',
    ],
    details: [
      {
        title: 'Supported regular-expression flavor',
        body: 'Patterns use the JavaScript regular-expression syntax supported by your browser. A pattern copied from PCRE, Python, .NET, Java, or another engine may need changes because features and escaping rules differ between engines.',
      },
      {
        title: 'Flags and replacement behavior',
        body: 'The g flag finds every match; i ignores case; m changes the behavior of line anchors; and s allows a dot to match newline characters. Replacement syntax follows JavaScript String.replace conventions, including numbered capture references such as $1.',
      },
    ],
    faqs: [
      {
        question: 'Should I include / characters around the pattern?',
        answer: 'No. Enter only the pattern body. Choose flags with the controls next to the pattern field.',
      },
      {
        question: 'Why does a regex work in another language but fail here?',
        answer: 'Regular-expression engines are not identical. Check whether the pattern uses engine-specific groups, flags, escapes, or lookaround behavior.',
      },
    ],
    references: [{ label: 'MDN: JavaScript regular expressions', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions' }],
  },
  'jwt-decoder': {
    overview: 'This JWT decoder separates a three-part token into its Base64url-encoded header, payload, and signature segments. It displays JSON claims and converts common NumericDate claims such as exp, iat, and nbf into readable timestamps. Decoding is local to your browser.',
    steps: [
      'Paste the complete compact JWT, including both period separators.',
      'Select Decode to inspect the header, payload claims, and encoded signature.',
      'Use the decoded values for debugging only, then verify the original token in trusted server-side code.',
    ],
    details: [
      {
        title: 'Decoding is not verification',
        body: 'Anyone can create or modify a decodable JWT. This page does not verify the cryptographic signature, issuer, audience, expiry policy, or key provenance. Never treat the displayed claims as trusted authorization data.',
      },
      {
        title: 'JWTs are encoded, not necessarily encrypted',
        body: 'The header and payload of a typical signed JWT are readable by anyone who has the token. Do not place passwords, secrets, or unnecessary personal data in those claims.',
      },
    ],
    faqs: [
      {
        question: 'Can this tool tell me whether a JWT is valid?',
        answer: 'No. Validity requires signature verification with an appropriate trusted key plus checks for issuer, audience, time claims, and application policy.',
      },
      {
        question: 'Does decoding change the token?',
        answer: 'No. The decoder reads the three compact segments and presents their contents without modifying the pasted token.',
      },
    ],
    references: [{ label: 'RFC 7519: JSON Web Token', href: 'https://www.rfc-editor.org/rfc/rfc7519' }],
  },
  'base64-encoder': {
    overview: 'The Base64 encoder converts Unicode text to UTF-8 bytes and then represents those bytes with standard Base64 characters. The decoder reverses that process and requires the decoded bytes to be valid UTF-8 text. Processing happens locally in the browser.',
    steps: [
      'Enter ordinary text to encode, or a standard Base64 string to decode.',
      'Choose Encode to Base64 or Decode from Base64.',
      'Copy the result, or correct the input if the decoder reports invalid Base64 or non-UTF-8 bytes.',
    ],
    details: [
      {
        title: 'Base64 is not encryption',
        body: 'Base64 is a reversible representation for binary data. It provides no confidentiality, authenticity, hashing, or tamper protection and should never be used as a security control.',
      },
      {
        title: 'Text and Base64url differences',
        body: 'This page is intended for UTF-8 text and standard Base64. URL-safe Base64 commonly replaces + and / with - and _ and may omit padding, so Base64url values may require normalization before decoding here.',
      },
    ],
    faqs: [
      {
        question: 'Why is the Base64 output longer than the input?',
        answer: 'Base64 represents each three bytes with four text characters, plus possible padding, so encoded data is normally about one-third larger.',
      },
      {
        question: 'Can I encode a file with this page?',
        answer: 'This interface accepts text. It does not currently read arbitrary file bytes.',
      },
    ],
    references: [{ label: 'RFC 4648: Base-N Encodings', href: 'https://www.rfc-editor.org/rfc/rfc4648' }],
  },
  'unix-timestamp': {
    overview: 'The Unix timestamp converter translates between an epoch value and readable dates. It accepts seconds or milliseconds, can auto-detect the likely unit, formats results in a selected timezone, and also converts date strings back to epoch seconds and milliseconds.',
    steps: [
      'Choose Epoch to Human or Human to Epoch.',
      'Enter a timestamp or date string and select the unit and timezone when applicable.',
      'Review the ISO 8601, UTC, localized, relative, seconds, and milliseconds representations.',
    ],
    details: [
      {
        title: 'Seconds versus milliseconds',
        body: 'Unix time is traditionally measured in seconds since 1970-01-01T00:00:00Z, while JavaScript and many APIs use milliseconds. A unit mismatch produces a date that is thousands of years away or unexpectedly close to 1970.',
      },
      {
        title: 'Be explicit about timezones',
        body: 'An ISO 8601 value ending in Z is UTC, and an explicit numeric offset identifies another zone. A date string without a timezone may be interpreted using the browser’s local timezone, so include Z or an offset when the instant must be unambiguous.',
      },
    ],
    faqs: [
      {
        question: 'Do Unix timestamps contain timezone information?',
        answer: 'No. A timestamp identifies an instant. A timezone is applied only when that instant is formatted for display.',
      },
      {
        question: 'Why does my date appear in 1970?',
        answer: 'The value may be milliseconds interpreted as seconds, seconds interpreted as milliseconds, or a small relative duration rather than a complete epoch timestamp.',
      },
    ],
    references: [{ label: 'ISO 8601 date and time format', href: 'https://www.iso.org/iso-8601-date-and-time-format.html' }],
  },
  'sql-formatter': {
    overview: 'The SQL formatter restructures queries with consistent indentation and keyword casing. It supports generic SQL plus MySQL, MariaDB, PostgreSQL, SQLite, SQL Server T-SQL, and Oracle PL/SQL formatting rules. Queries are formatted in your browser.',
    steps: [
      'Paste one or more SQL statements and choose the closest database dialect.',
      'Select indentation, keyword case, and spacing preferences.',
      'Format the query, inspect any syntax error, and copy the resulting SQL.',
    ],
    details: [
      {
        title: 'Formatting is not database validation',
        body: 'A formatter can identify some tokenization or syntax problems, but it does not connect to a database, resolve table names, check types, explain a query plan, or prove that a statement is safe to execute.',
      },
      {
        title: 'Choose the correct dialect',
        body: 'Quoting, functions, procedural blocks, limit clauses, and vendor extensions differ across databases. Selecting the correct dialect improves formatting and reduces false errors for database-specific syntax.',
      },
    ],
    faqs: [
      {
        question: 'Will formatting change what a query does?',
        answer: 'The formatter is designed to change layout and keyword case, not query semantics. Always review generated output before running important statements.',
      },
      {
        question: 'Does the tool execute my SQL?',
        answer: 'No. It does not connect to a database or run queries.',
      },
    ],
  },
  'uuid-generator': {
    overview: 'This generator creates Universally Unique IDentifiers across every version defined in RFC 9562: nil, v1, v2, v3, v4, v5, v6, v7, and v8. Time-based, name-based, random, and sortable variants are all supported, with optional namespace and name inputs for v3/v5 and local domain for v2. Generation uses the browser’s Web Crypto API and runs entirely in the current tab.',
    steps: [
      'Pick a version from nil through v8.',
      'For v3 and v5, select a namespace and provide a name — the same inputs always produce the same UUID.',
      'For v2, optionally enter a local identifier and domain.',
      'Choose how many to generate (1–50) and click Generate UUIDs.',
      'Copy any individual UUID, or use Copy All UUIDs to copy the whole list.',
    ],
    details: [
      {
        title: 'Which version should I use?',
        body: 'v4 (fully random) is the safest default for general identifiers. v7 (Unix-epoch milliseconds + random) sorts lexically and is ideal for database indexes when you want time-ordered rows. v5 (SHA-1 name+namespace) and v3 (MD5 name+namespace) produce deterministic UUIDs for the same inputs — useful for content-addressed or idempotent flows.',
      },
      {
        title: 'Version 6 versus version 1',
        body: 'Both v1 and v6 embed a Gregorian timestamp, but v6 reorders the timestamp so that lexical sort matches chronological order. This makes v6 friendlier than v1 for sorted indexes.',
      },
      {
        title: 'Uniqueness and storage',
        body: 'Random UUID collisions are extraordinarily unlikely, but a database should still enforce a unique constraint when uniqueness is a correctness requirement. Store UUIDs in a native UUID or compact binary type when your database supports one.',
      },
    ],
    faqs: [
      {
        question: 'Are these sequential UUIDs?',
        answer: 'Only v1, v6, and v7 are time-based and therefore sortable. v4 is fully random and not sequential. v2, v3, v5, and v8 derive their bits from other inputs (local id, name+namespace hash, or vendor-specific data) and are not sortable by generation time.',
      },
      {
        question: 'Are UUIDs suitable for passwords or API keys?',
        answer: 'Use a purpose-built secret generator for credentials. UUIDs are identifiers and should not automatically be treated as authentication secrets.',
      },
    ],
    references: [{ label: 'RFC 9562: Universally Unique IDentifiers', href: 'https://www.rfc-editor.org/rfc/rfc9562' }],
  },
  'cron-tester': {
    overview: 'The cron tester parses traditional five-field cron expressions, explains the schedule in plain English, and calculates the next seven run times in a selected timezone. It supports lists, ranges, steps, month and weekday names, and common macros such as @daily.',
    steps: [
      'Enter a five-field expression in minute, hour, day-of-month, month, and day-of-week order.',
      'Choose the timezone used to preview the schedule.',
      'Review each parsed field, the plain-language explanation, and the upcoming run times.',
    ],
    details: [
      {
        title: 'Cron implementations differ',
        body: 'This tester uses the common five-field format. Quartz, AWS EventBridge, Kubernetes, systemd timers, and vendor schedulers may use a seconds or year field, different weekday numbering, or special characters that this parser does not support.',
      },
      {
        title: 'Timezone and daylight-saving behavior',
        body: 'A local wall-clock time may occur twice or not at all during a daylight-saving transition. Confirm the scheduler’s configured timezone and DST behavior before relying on a production schedule.',
      },
    ],
    faqs: [
      {
        question: 'Does this tester run a job?',
        answer: 'No. It parses and previews a schedule only; it does not register or execute tasks.',
      },
      {
        question: 'Why does my six-field cron expression fail?',
        answer: 'This parser expects five fields and does not include a leading seconds field. Remove it only if the target scheduler also uses five-field cron syntax.',
      },
    ],
  },
  'saml-decoder': {
    overview: 'The SAML decoder converts Base64-encoded SAML Requests and Responses into readable XML. It can handle the optional DEFLATE encoding commonly used with HTTP-Redirect binding and extracts useful fields and assertion attributes for troubleshooting.',
    steps: [
      'Copy the SAMLRequest or SAMLResponse value, without the surrounding form field name.',
      'Paste it into the decoder and select Decode.',
      'Inspect the message type, issuer, destination, audience, timestamps, attributes, and decoded XML.',
    ],
    details: [
      {
        title: 'Decoding is not signature verification',
        body: 'Readable XML is not proof that a SAML message is authentic. A service provider must verify the XML signature with a trusted IdP certificate and enforce destination, recipient, audience, InResponseTo, time, and replay protections.',
      },
      {
        title: 'Treat assertions as sensitive',
        body: 'SAML assertions can contain names, email addresses, group membership, session identifiers, and other security-sensitive attributes. This tool processes input locally, but you should still avoid sharing decoded production assertions unnecessarily.',
      },
    ],
    faqs: [
      {
        question: 'Why does a SAMLRequest sometimes need decompression?',
        answer: 'HTTP-Redirect binding commonly DEFLATE-compresses the XML before Base64 and URL encoding. HTTP-POST binding generally sends Base64-encoded XML without DEFLATE.',
      },
      {
        question: 'Can this page prove that a SAML response is safe?',
        answer: 'No. Use a SAML library configured with trusted metadata and strict validation rules for authentication decisions.',
      },
    ],
    references: [{ label: 'OASIS SAML 2.0 technical overview', href: 'https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html' }],
  },
  'semver-comparator': {
    overview: 'The SemVer comparator parses version strings according to Semantic Versioning 2.0.0 and compares them by precedence. It handles release, prerelease, and build metadata for two-version comparisons and batch sorting of version lists. All parsing and comparison run in your browser.',
    steps: [
      'Enter two version strings (a leading "v" is optional) for a pairwise comparison.',
      'Inspect the parsed major.minor.patch, prerelease, and build fields for each version.',
      'For batch sorting, paste one version per line and review the sorted output.',
      'Invalid lines are reported separately so you can fix them and re-run the sort.',
    ],
    details: [
      {
        title: 'Precedence follows SemVer 2.0.0 §11',
        body: 'Major, minor, and patch are compared numerically. A prerelease version has lower precedence than the same release. Prerelease identifiers are compared per-field: numeric identifiers are lower than alphanumeric identifiers, alphanumerics by ASCII sort, and a shorter prerelease list is lower when all shared identifiers are equal.',
      },
      {
        title: 'Build metadata is ignored for precedence',
        body: 'Identifiers after the plus sign — for example, 1.0.0+build.42 — are not used when comparing versions. Two versions that differ only in build metadata are considered equal for precedence purposes.',
      },
    ],
    faqs: [
      {
        question: 'Why does 1.0.0-alpha compare lower than 1.0.0?',
        answer: 'Per SemVer 2.0.0, any prerelease version has lower precedence than its corresponding release. The prerelease identifier only adds qualification; it never raises precedence above the patch segment.',
      },
      {
        question: 'Is "v" required before the version number?',
        answer: 'No. The comparator accepts an optional leading v or V, such as "v1.2.3", but the prefix is stripped before parsing — it is not part of the SemVer 2.0.0 BNF itself.',
      },
    ],
    references: [{ label: 'Semantic Versioning 2.0.0', href: 'https://semver.org' }],
  },
  'stacktrace-formatter': {
    overview: 'This formatter cleans up raw or messy stack traces copied from terminals, CI logs, Docker output, browser consoles, and crash reporters. It detects JavaScript (including Node.js), Python, Java, C#, Go, PHP, or Ruby automatically, then rebuilds readable one-frame-per-line output with aligned frames and syntax highlighting: error types in red, function names in green, file paths in blue, and line numbers in purple. An optional anonymizer strips local user directories before you paste the trace into a bug report. Everything runs in your browser — the trace is never uploaded.',
    steps: [
      'Paste a raw or messy trace from a terminal, log, crash reporter, or browser console. The language is detected automatically from its frame syntax.',
      'Choose Format to rebuild clean, aligned, color-coded output.',
      'Enable Remove Sensitive Data first if the trace contains local paths you should not share.',
      'Copy the beautified output into a bug report, pull request, or chat message, or click Next Example to cycle through sample traces.',
    ],
    details: [
      {
        title: 'Every runtime prints frames differently',
        body: 'JavaScript prints “at fn (file.js:10:5)”, Python prints File "app.py", line 10, in fn, Java prints at com.example.Class.method(File.java:42), Go prints goroutine headers, Ruby prints from file.rb:10:in `fn’ frames, and PHP prints numbered #0 frames. The formatter recognizes each dialect and normalizes indentation without changing the original frame order.',
      },
      {
        title: 'Python reads bottom-up, Java reads top-down',
        body: 'Java, JavaScript, C#, PHP, and Ruby print the most recent call first, so the crash site is near the top of the trace. Python tracebacks print the most recent call last, so the failing line is at the bottom. The formatter preserves each language’s native order — knowing which direction to read saves real time during an incident.',
      },
      {
        title: 'Formatting is not symbolication',
        body: 'Production JavaScript traces from minified bundles still show short names like t.a; mapping those back to original sources requires source maps. iOS crash logs similarly need dSYM symbolication. This tool beautifies the structure of the trace you already have — it does not resolve symbols.',
      },
      {
        title: 'Why traces copied from logs look broken',
        body: 'Log shippers and terminals can wrap long lines, strip leading whitespace, and prepend timestamps or container IDs. That damages the visual nesting that makes traces scannable. Formatting restores consistent indentation so you can follow the call chain, while preserving the original frame order and diagnostic content.',
      },
    ],
    faqs: [
      {
        question: 'Why does the formatter say my trace is invalid?',
        answer: 'Validation requires at least one recognizable frame pattern. Log lines with timestamps, log-level prefixes, or hard-wrapped lines break detection — strip the log decorations and paste just the trace itself.',
      },
      {
        question: 'Can I format a trace copied from a browser console?',
        answer: 'Yes. V8-style frames (Chrome, Edge, Node.js) in the form at fn (file:line:column) are fully supported, including async frames.',
      },
      {
        question: 'Is my stack trace uploaded anywhere?',
        answer: 'No. Language detection, formatting, highlighting, and the optional path anonymization all run locally in the browser tab.',
      },
      {
        question: 'Will beautifying change what the stack trace means?',
        answer: 'No. Only whitespace, alignment, coloring, and the optional path anonymization change. Frame order, function names, file names, and line numbers are preserved.',
      },
      {
        question: 'Does the formatter work on .NET or Unity traces?',
        answer: 'Yes. C#-style at Namespace.Class.Method() frames are supported, including stack traces copied from Unity and .NET application logs.',
      },
    ],
    references: [
      { label: 'V8 stack trace API', href: 'https://v8.dev/docs/stack-trace-api' },
      { label: 'Python traceback module', href: 'https://docs.python.org/3/library/traceback.html' },
      { label: 'MDN: Error.prototype.stack', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack' },
    ],
  },
  'mime-type-lookup': {
    overview: `A searchable reference of ${MIME_ENTRIES.length} common MIME types (media types). Search by file extension (.png, .woff2), by MIME string (image/jpeg), or filter by category — images, video, audio, archives, documents, code, fonts, text, data, and application. Each row shows known extension aliases, a short practical note, and a one-click copy of the exact Content-Type value.`,
    steps: [
      'Type an extension, a MIME type, or a keyword into the search box.',
      'Narrow the results with the category pills, which show how many entries each category holds.',
      'Click the copy button on any row to copy the exact MIME string for your header or server config.',
    ],
    details: [
      {
        title: 'MIME type versus file extension',
        body: 'An extension is just a filename hint; the MIME type is what a server actually declares in the Content-Type header, and browsers honor the header over the extension. A .jpg served as text/plain will not render as an image. When the two disagree, the header wins.',
      },
      {
        title: 'When the wrong type breaks things',
        body: 'WebAssembly modules need application/wasm for streaming compilation, web fonts need font/woff2 to load under strict policies, and JSON APIs should send application/json so clients parse instead of display. Unknown binary content falls back to application/octet-stream, which browsers download instead of opening.',
      },
      {
        title: 'Use nosniff deliberately',
        body: 'When a response lacks a Content-Type, browsers guess — historically a source of security bugs. Sending X-Content-Type-Options: nosniff disables that guessing, which makes serving the correct type from this table mandatory rather than optional.',
      },
    ],
    faqs: [
      {
        question: 'What MIME type forces a file download?',
        answer: 'application/octet-stream is the generic binary type; browsers save it instead of displaying it. Combine it with a Content-Disposition: attachment header to suggest a filename.',
      },
      {
        question: 'Is there an official list of MIME types?',
        answer: 'Yes. IANA maintains the canonical media type registry. This table covers the commonly used subset developers actually look up, with aliases and notes.',
      },
      {
        question: 'What is the correct MIME type for JSON?',
        answer: 'application/json, per RFC 8259. The legacy text/json is obsolete and some strict clients reject it.',
      },
    ],
    references: [
      { label: 'IANA media type registry', href: 'https://www.iana.org/assignments/media-types/media-types.xhtml' },
      { label: 'MDN: MIME types', href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types' },
    ],
  },
  'file-size-converter': {
    overview: 'Type a size once and read it in every unit at once: decimal SI units (bytes, KB, MB, GB, TB, PB — powers of 1,000) on one side and binary IEC units (KiB, MiB, GiB, TiB, PiB — powers of 1,024) on the other. Results update live as you type, each value has its own copy button, and the Random Size button loads familiar reference objects — a CD at 700 MB, a DVD at 4.7 GB, a 1 TB hard drive — to sanity-check magnitudes.',
    steps: [
      'Enter a number and pick the unit it is measured in, from bytes up to pebibytes.',
      'Read the equivalent decimal (SI) and binary (IEC) values side by side.',
      'Copy any individual result with its copy button.',
      'Use Random Size to load the typical size of a real-world object for comparison.',
    ],
    details: [
      {
        title: 'Why your 1 TB drive shows 931 GB',
        body: 'Drive manufacturers sell capacity in decimal units: 1 TB = 1,000,000,000,000 bytes. Operating systems report binary units: 1,000,000,000,000 ÷ 1,073,741,824 ≈ 931 GiB — often displayed with the wrong “GB” label. No capacity is missing; the two unit systems simply differ by about 7.4% at terabyte scale.',
      },
      {
        title: 'KB versus KiB in practice',
        body: 'Memory is always binary — 16 GiB of RAM is 2^34 bytes. Network bandwidth is decimal and measured in bits: 100 Mbps is 100,000,000 bits per second, roughly 11.9 MiB/s of real transfer. Storage marketing is decimal; OS file dialogs are usually binary. When a number matters, write the exact unit.',
      },
      {
        title: 'The 1,000 versus 1,024 gap grows with scale',
        body: 'At kilobyte scale the difference between the systems is 2.4%, at gigabyte scale 7.4%, and at terabyte scale about 10%. The bigger the numbers, the further the two systems drift — which is why ambiguous units cause real capacity-planning bugs.',
      },
    ],
    faqs: [
      {
        question: 'How many bytes are in a megabyte?',
        answer: 'In SI units, 1 MB = 1,000,000 bytes. In IEC binary units, 1 MiB = 1,048,576 bytes (1,024 × 1,024). The converter shows both so you never have to guess which one a tool or spec meant.',
      },
      {
        question: 'Should my code use 1,000 or 1,024?',
        answer: 'Match the domain: memory and OS-level sizes are conventionally binary (1,024); storage devices and networks are decimal (1,000). Document whichever you choose — an ambiguous “MB” has caused many off-by-7% bugs.',
      },
      {
        question: 'What comes after terabytes?',
        answer: 'Decimal: petabytes (PB), exabytes (EB), zettabytes (ZB). Binary: pebibytes (PiB), exbibytes (EiB), zebibytes (ZiB). This converter covers bytes through PB and PiB.',
      },
    ],
    references: [{ label: 'NIST: prefixes for binary multiples', href: 'https://physics.nist.gov/cuu/Units/binary.html' }],
  },
  'ios-app-lookup': {
    overview: 'Enter an iOS bundle ID — the reverse-DNS identifier like com.company.appname — and this tool queries Apple’s public iTunes Search API for the app’s current App Store metadata: icon, name, developer, seller, price, average rating and rating count, current version, release and update dates, file size, minimum iOS version, content rating, genres, supported languages, description, release notes, and screenshots. The raw JSON response is shown next to the formatted card for inspection or copying.',
    steps: [
      'Paste or type a bundle ID such as com.example.appname, then press Enter or choose Lookup App.',
      'Review the formatted card: icon, ratings, version history, file size, languages, and screenshots.',
      'Copy the raw JSON response if you need it for documentation or debugging.',
      'Click one of the popular-app chips to see what a complete result looks like.',
    ],
    details: [
      {
        title: 'Bundle ID versus App Store ID',
        body: 'These are different identifiers. The bundle ID (com.company.app) is the reverse-DNS string you set in Xcode. The numeric App Store ID — the trackId, visible as id123456789 in an App Store URL — is assigned by Apple at publication. This tool searches by bundle ID and returns the numeric track ID in the result.',
      },
      {
        title: 'Where to find a bundle ID',
        body: 'For your own apps: in Xcode under target settings, or in App Store Connect under App Information. For third-party apps: from an MDM inventory or a device management profile. Only apps currently published on the App Store resolve.',
      },
      {
        title: 'The data comes straight from Apple',
        body: 'Results are whatever Apple returns from the iTunes Search API — the same feed behind App Store listings — so versions, prices, and ratings reflect the live storefront. TestFlight builds, enterprise apps, unlisted apps, and apps removed from sale are not returned.',
      },
    ],
    faqs: [
      {
        question: 'Why was my app not found?',
        answer: 'The usual causes: a typo in the bundle ID, or the app is not currently on the App Store — TestFlight, enterprise, and removed apps are excluded from the search API. Verify the ID in App Store Connect.',
      },
      {
        question: 'Can I search by app name instead?',
        answer: 'This tool looks up exact bundle IDs. For name-based discovery, use the App Store first, then come back with the bundle ID for the full metadata view.',
      },
      {
        question: 'Is this an official Apple tool?',
        answer: 'No. It is an independent interface over Apple’s public iTunes Search API, which requires no authentication or developer account.',
      },
    ],
    references: [{ label: 'Apple: iTunes Search API', href: 'https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/' }],
  },
  'random-number-generator': {
    overview: 'Generates a random integer in your chosen range — both endpoints included — using the browser’s crypto.getRandomValues(), the same cryptographically secure randomness source used for keys and tokens, rather than Math.random(). Min and max swap automatically if you enter them backwards. Below the result, a ready-to-paste code sample shows how to generate the same range in TypeScript, JavaScript, C#, Swift, Kotlin, Go, or Rust, updating live as you change the bounds.',
    steps: [
      'Set the minimum and maximum values; both ends of the range are inclusive.',
      'Choose Generate Random Number and copy the result.',
      'Pick a language to see the equivalent code sample, which tracks your current range.',
    ],
    details: [
      {
        title: 'Math.random() versus crypto.getRandomValues()',
        body: 'Math.random() is a fast pseudorandom generator seeded invisibly by the engine — fine for games and shuffles, unsuitable for security. crypto.getRandomValues() draws from the operating system’s CSPRNG and is appropriate for tokens, raffles, and anything an attacker might try to predict. This tool uses the latter.',
      },
      {
        title: 'A note on perfect uniformity',
        body: 'Mapping a 32-bit random value onto an arbitrary range with modulo can introduce measurable bias when the range is enormous — a significant fraction of 2^32. For everyday ranges like dice, raffles, sampling, or load distribution, the skew is far below anything observable. If you need provable uniformity over huge ranges, use rejection sampling instead.',
      },
      {
        title: 'Integers only, both ends included',
        body: 'The result is always a whole number, and min and max themselves are possible outcomes — a 1–6 range is a fair die. For floating-point values, scale an integer result or adapt the code samples, which use each language’s idiomatic random API.',
      },
    ],
    faqs: [
      {
        question: 'Is this safe to use for security purposes?',
        answer: 'The randomness source is the OS-level CSPRNG, so values are unpredictable. For passwords, keys, and tokens, prefer a dedicated generator — like the Password Generator here — that is designed for those formats.',
      },
      {
        question: 'Can the range include negative numbers?',
        answer: 'Yes. Min and max accept any integers, including negatives, and reversed input is swapped automatically.',
      },
      {
        question: 'How do I reproduce this in my own code?',
        answer: 'Copy the sample for your language below the result. Each sample generates an inclusive integer in exactly the range you configured, using that language’s standard random API.',
      },
    ],
    references: [{ label: 'MDN: Crypto.getRandomValues()', href: 'https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues' }],
  },
  'saml-metadata-parser': {
    overview: 'Paste a SAML EntityDescriptor — the metadata XML published by an Identity Provider or Service Provider — and this parser extracts everything needed for SSO configuration: the entityID, whether it describes an IdP or SP, signing requirements (AuthnRequestsSigned, WantAuthnRequestsSigned), all SSO, SLO, and ACS endpoints with their bindings and indexes, embedded X.509 certificates with fingerprints and expiry status, supported NameID formats, requested attributes, and organization details. Sample IdP and SP documents are included. Parsing happens in your browser; the XML is never uploaded.',
    steps: [
      'Paste the metadata XML — the document rooted at <EntityDescriptor>.',
      'Choose Parse, or load the Sample IdP / Sample SP first to see a complete result.',
      'Review the endpoint list: each entry shows its type, binding (HTTP-Redirect, HTTP-POST, and so on), index, and default flag.',
      'Check the certificate cards for expiry badges, and copy a PEM when you need to configure a trust store.',
    ],
    details: [
      {
        title: 'IdP metadata versus SP metadata',
        body: 'An IdP descriptor (IDPSSODescriptor) lists the SingleSignOnService endpoints your app redirects users to, plus the IdP’s signing certificate. An SP descriptor (SPSSODescriptor) lists AssertionConsumerService URLs — where the IdP posts responses — and declares whether the SP signs its AuthnRequests. Mixing these up is a classic first-integration mistake.',
      },
      {
        title: 'Why metadata often shows two certificates',
        body: 'During certificate rollover, an entity publishes both the old and new signing certificates so partners can switch without downtime. Both appear here with their own fingerprints and expiry dates. An expired old certificate lingering in metadata is common after a cutover and should be removed.',
      },
      {
        title: 'Parsing is not signature verification',
        body: 'This tool checks that the XML is well-formed and extracts its fields, which catches most configuration mistakes — that structural check is what most people mean by a SAML metadata validator. It does not verify an XML signature on signed metadata; production trust must come from fetching metadata over a trusted channel or validating its signature in your SAML library.',
      },
    ],
    faqs: [
      {
        question: 'Where do I get my IdP’s metadata?',
        answer: 'Identity providers publish it at a well-known URL — Okta, Microsoft Entra ID, Google Workspace, and ADFS all expose it in their SSO configuration screens. Download the XML and paste it here instead of copying values field by field.',
      },
      {
        question: 'What is the entityID used for?',
        answer: 'It is the unique name of the IdP or SP, usually a URL or URN. The IdP puts the SP’s entityID in the Audience restriction, and the SP trusts assertions whose Issuer matches the IdP’s entityID. A mismatch is a common cause of “invalid audience” errors.',
      },
      {
        question: 'Can I paste a metadata URL instead of XML?',
        answer: 'This tool parses the XML document itself. Download the metadata from its URL (it is a public endpoint) and paste the contents here.',
      },
    ],
    references: [{ label: 'OASIS: SAML 2.0 Metadata specification', href: 'https://docs.oasis-open.org/security/saml/v2.0/saml-metadata-2.0-os.pdf' }],
  },
  'color-picker': {
    overview: 'Pick a color visually on the saturation/brightness field with a hue slider, or type a hex value directly — with or without the #, in 3- or 6-digit form. The tool instantly converts to RGB, HSL, HSV, and CMYK with one-click copy, and generates full harmony palettes from your pick: complementary, analogous, split-complementary, triadic, tetradic, monochromatic, tints, and shades, plus a ready-made web development scale. You can also search and browse curated palettes including Tailwind, Nord, Solarized, and Dracula.',
    steps: [
      'Drag on the gradient field for saturation and brightness; drag the hue slider for the base hue.',
      'Or type a hex value like 7c3aed — shorthand (#abc) and a missing # are handled automatically.',
      'Copy any format: HEX, RGB, HSL, HSV, or CMYK.',
      'Scroll the generated harmonies and curated palettes for variations and ready-made scales.',
    ],
    details: [
      {
        title: 'Which format to use in CSS',
        body: 'HEX (#7c3aed) is compact and universal. rgb(124, 58, 237) is the same value with room for an alpha channel via rgb(124 58 237 / 0.5). hsl(262, 83%, 58%) is the easiest to adjust by hand — nudge lightness for hover states without touching the hue. CMYK is not a CSS color; it is included for print handoff.',
      },
      {
        title: 'How the harmony palettes are built',
        body: 'Harmonies rotate the hue wheel by fixed angles: complementary adds 180°, analogous steps ±30°, triadic +120°, split-complementary ±150°, and tetradic +90° steps. Tints mix the color with white, shades with black, and monochromatic varies saturation and lightness at a fixed hue — the same math behind design-system color scales.',
      },
      {
        title: 'Identifying a hex you found in the wild',
        body: 'Paste any value — say #7c3aed — to see exactly what it is (a violet, and incidentally Tailwind CSS’s violet-600) and to generate matching colors around it. Filtering the curated list by name is a fast way to grab a complete Tailwind, Nord, Solarized, or Dracula ramp.',
      },
    ],
    faqs: [
      {
        question: 'What color is #7c3aed?',
        answer: 'A medium-bright violet: rgb(124, 58, 237) or hsl(262, 83%, 58%). It is also the exact value of Tailwind CSS’s violet-600 utility class.',
      },
      {
        question: 'Is the CMYK conversion exact?',
        answer: 'No. It is a mathematical RGB-to-CMYK transform without an ICC profile, so treat it as an estimate. Production print values depend on paper, ink, and the profile your print shop specifies.',
      },
      {
        question: 'Does the picker support transparency?',
        answer: 'The picker works in opaque color space. Add alpha in CSS yourself — rgb(124 58 237 / 0.5) or an 8-digit hex like #7c3aed80 — after copying the base value.',
      },
    ],
    references: [{ label: 'MDN: CSS <color> data type', href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value' }],
  },
  'http-status-codes': {
    overview: 'A searchable reference of HTTP response status codes across all five classes — 1xx informational, 2xx success, 3xx redirection, 4xx client errors, and 5xx server errors. Search by code, name, or concept; filter by class with the tab counts; expand any card for a longer explanation and typical use cases. Deprecated codes are flagged so you do not build on them.',
    steps: [
      'Search by number (404), name (Not Found), or concept (redirect, rate limit).',
      'Filter by class with the 1xx–5xx tabs, which show how many codes each class contains.',
      'Expand a card for the deeper explanation, and copy the code with one click.',
    ],
    details: [
      {
        title: 'The five classes in one line each',
        body: '1xx: the request was received, keep waiting — rarely seen directly. 2xx: success — 200 OK, 201 Created, 204 No Content. 3xx: the resource lives elsewhere — follow the Location header. 4xx: the client sent something wrong — fix the request, do not retry as-is. 5xx: the server failed — retrying later may succeed.',
      },
      {
        title: 'The redirects developers mix up',
        body: '301 and 308 are permanent; 302, 303, and 307 are temporary. 307 and 308 guarantee the method and body are preserved across the redirect; with 301 and 302, browsers historically rewrote POST to GET. For APIs, prefer 307 or 308 when method preservation matters. Search engines transfer ranking signals on 301 but not on 302.',
      },
      {
        title: 'Debugging staples',
        body: '401 means unauthenticated — no valid credentials, look for a WWW-Authenticate header; 403 means authenticated but not allowed. 404 is “not here”, 410 is “gone forever”. 429 is rate limiting — honor Retry-After. On the server side: 502 is a bad upstream response, 503 is temporary overload or maintenance, 504 is an upstream timeout.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between 401 and 403?',
        answer: '401 Unauthorized means the request lacks valid authentication — the client should sign in or send credentials. 403 Forbidden means the server knows who you are and still refuses; re-authenticating will not help.',
      },
      {
        question: 'Is 418 a real status code?',
        answer: 'Yes — “I’m a teapot” comes from RFC 2324, an April Fools’ protocol from 1998. It was never meant for real use and is effectively reserved by tradition, so do not use it for actual errors.',
      },
      {
        question: 'Which code should a successful API delete return?',
        answer: '204 No Content is the common choice when nothing is returned; 200 OK with a small body is also fine. Both are 2xx, so clients treat either as success.',
      },
    ],
    references: [
      { label: 'MDN: HTTP response status codes', href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status' },
      { label: 'RFC 9110: HTTP Semantics', href: 'https://www.rfc-editor.org/rfc/rfc9110' },
    ],
  },
  'string-similarity': {
    overview: 'Measures how alike two strings are, as a 0–100% score, using four classic algorithms: Jaro-Winkler, Levenshtein edit distance, Dice bigram coefficient, and Hamming distance. Pick an algorithm to read a plain-language description of its behavior, and compare the same pair across algorithms to understand their biases. Scores are color-coded from red (dissimilar) to green (near-identical).',
    steps: [
      'Enter the two strings to compare.',
      'Choose an algorithm — the note under the selector explains its strengths.',
      'Choose Compare to get the percentage score and bar.',
      'Re-run with a different algorithm to see how the same pair scores under a different definition of “similar”.',
    ],
    details: [
      {
        title: 'Choosing the right algorithm',
        body: 'Jaro-Winkler excels at short strings like person or place names and boosts matches that share a prefix — great for deduplicating records. Levenshtein counts the minimum insertions, deletions, and substitutions between the strings — a solid general default. Dice compares two-character bigram overlap and tolerates word reordering in longer text. Hamming counts differing positions and only applies to equal-length strings like fixed-width codes.',
      },
      {
        title: 'Edit distance as a similarity score',
        body: 'Raw Levenshtein output is a distance — a count of edits — which is hard to compare across strings of different lengths. This tool normalizes it to similarity = 1 − distance ÷ maximum length, so 100% always means identical and 0% means nothing in common, whichever algorithm you pick.',
      },
      {
        title: 'Typical uses — and the limit',
        body: 'Fuzzy duplicate detection in imports and CRM data, “did you mean” suggestions, matching user input against known commands, and rough rename detection. For semantic similarity — “car” versus “automobile” — you need embeddings (see the Sentence Similarity tool); these algorithms compare characters, not meaning.',
      },
    ],
    faqs: [
      {
        question: 'Which algorithm should I use for names?',
        answer: 'Jaro-Winkler. It was designed for short strings and record linkage, and its prefix bonus matches how names typically vary (Jon versus John).',
      },
      {
        question: 'Why does Hamming score 0 for different lengths?',
        answer: 'Hamming distance is only defined for equal-length strings, so the tool reports 0 rather than a misleading number. Pad or align the strings first if your data is fixed-width.',
      },
      {
        question: 'Is the comparison case-sensitive?',
        answer: 'Yes — the algorithms compare exact characters. Lowercase both strings yourself if case should not matter.',
      },
    ],
    references: [
      { label: 'Jaro–Winkler distance', href: 'https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance' },
      { label: 'Levenshtein distance', href: 'https://en.wikipedia.org/wiki/Levenshtein_distance' },
    ],
  },
  'saml-cert-inspector': {
    overview: 'Paste certificate material in almost any wrapper — PEM text, Base64 DER, a full SAML metadata document, or a SAML response — and the inspector auto-detects the format and extracts every X.509 certificate it contains. For each one you get the subject and common name, issuer, serial number, validity window with an expiry badge that turns amber inside 30 days and red after expiry, signature algorithm, public key algorithm and size, key usage and extended key usage, subject alternative names, the CA flag, and SHA-1 / SHA-256 fingerprints, with one-click PEM copy.',
    steps: [
      'Paste the certificate material — a PEM block, Base64 blob, metadata XML, or response XML.',
      'Choose Inspect; the detected format and certificate count appear above the results.',
      'Read the expiry badge first: Valid, Expiring Soon (under 30 days), or Expired.',
      'Copy the SHA-256 fingerprint or PEM when configuring trust in your SAML stack.',
    ],
    details: [
      {
        title: 'Expired SAML certificates are a top SSO outage cause',
        body: 'Unlike public HTTPS, nothing warns you when a SAML signing certificate approaches its notAfter date — logins simply start failing. Check the expiry badge before every change window, and publish the replacement certificate in metadata alongside the old one during rollover so partners can switch cleanly.',
      },
      {
        title: 'Self-signed is normal in SAML',
        body: 'SAML trust is established by exchanging metadata out of band, not by public CA chains, so most SAML signing certificates are self-signed. Seeing Issuer equal to Subject is expected, not a warning sign. What matters is that the fingerprint in your configuration matches the one shown here.',
      },
      {
        title: 'Signing versus encryption keys',
        body: 'In metadata, a KeyDescriptor with use="signing" protects assertion authenticity, while use="encryption" protects confidentiality. A KeyDescriptor with no use attribute serves both. The key usage and extended key usage fields shown here tell you what the certificate itself permits.',
      },
    ],
    faqs: [
      {
        question: 'Which fingerprint should I record?',
        answer: 'SHA-256. SHA-1 is shown for legacy platforms that still require it, but SHA-1 collision attacks make it unsuitable for new configurations.',
      },
      {
        question: 'My metadata has two certificates — which one is active?',
        answer: 'Usually both are trusted during a rollover window; compare the Not Before dates to see which is newer. IdPs sign with one key at a time, so partners must trust all published signing certificates during the overlap.',
      },
      {
        question: 'Can this verify a SAML response signature?',
        answer: 'No. It extracts and describes certificates; signature verification requires your SAML library with configured trust. For response-level debugging, use the SAML Response Validator.',
      },
    ],
    references: [{ label: 'RFC 5280: Internet X.509 PKI profile', href: 'https://www.rfc-editor.org/rfc/rfc5280' }],
  },
  'saml-builder': {
    overview: 'Builds test SAML messages from form fields instead of hand-editing XML: full SAML Responses, AuthnRequests, and LogoutRequests. Set the issuer, destination, NameID and its format (email, persistent, transient, unspecified), audience, ACS URL, InResponseTo, and authentication context; attach custom attributes; then export as raw XML, Base64 for HTTP-POST binding, or Base64 + DEFLATE for HTTP-Redirect binding. Generated assertions are unsigned and intended for development, testing, and learning only.',
    steps: [
      'Pick a template: SAML Response, AuthnRequest, or LogoutRequest.',
      'Fill in issuer, destination, NameID, and — for responses — audience, ACS URL, and attributes.',
      'Adjust the timing controls to reproduce clock-skew or expiry scenarios.',
      'Choose an output format and Generate: raw XML to read, Base64 for POST binding, or Base64 + DEFLATE for Redirect binding.',
    ],
    details: [
      {
        title: 'POST versus Redirect encoding',
        body: 'HTTP-POST binding sends the XML Base64-encoded in an HTML form field, with no compression. HTTP-Redirect binding must DEFLATE-compress the XML first, then Base64, then URL-encode it into the query string. Choosing the wrong transform for your binding is a frequent cause of “malformed request” errors at the receiving end.',
      },
      {
        title: 'Why the timing fields matter',
        body: 'NotBefore and NotOnOrAfter define the validity window; SessionNotOnOrAfter bounds the session. Real IdPs set NotBefore slightly in the past to tolerate clock skew between servers — a response valid only “from now” can fail against an SP whose clock is 60 seconds behind. Reproduce those conditions here on purpose.',
      },
      {
        title: 'Unsigned by design',
        body: 'Signing requires a private key and a partner that trusts the matching certificate. This builder deliberately produces unsigned assertions: use it to test parsing, attribute mapping, and error handling — never to authenticate. A correctly configured service provider must reject these messages.',
      },
    ],
    faqs: [
      {
        question: 'Can I sign the assertion here?',
        answer: 'No — by design. For signed test assertions, use your identity provider’s preview feature or a SAML library in your own codebase with a throwaway key pair.',
      },
      {
        question: 'Will my application accept what this generates?',
        answer: 'Only if its SAML stack has signature verification disabled, which should only ever happen on a local or throwaway test environment.',
      },
      {
        question: 'What should I put in InResponseTo?',
        answer: 'The ID of the AuthnRequest the response answers. For unsolicited (IdP-initiated) responses, leave it empty — that is exactly what IdP-initiated SSO means in practice.',
      },
    ],
    references: [{ label: 'OASIS: SAML 2.0 Core specification', href: 'https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf' }],
  },
  'fill-mask': {
    overview: 'Type a sentence with [MASK] where a word is missing, and a BERT-style language model predicts the most likely tokens to fill the blank, ranked with confidence scores. Three models run fully in your browser via Hugging Face Transformers.js: DistilBERT (~66 MB, the fast default), BERT Base (~110 MB, more accurate), and ALBERT (~45 MB, lightest). The model downloads once and is cached by the browser; your text never leaves the tab.',
    steps: [
      'Write a sentence containing a [MASK] token, such as “The [MASK] barks at the mail carrier.”',
      'Pick a model — DistilBERT is the best starting point.',
      'Wait for the one-time model download and initialization, then run the prediction.',
      'Review the ranked completions with their probability scores.',
    ],
    details: [
      {
        title: 'What the model actually learned',
        body: 'BERT-style models are pretrained with masked language modeling: hide a share of tokens in billions of sentences and learn to predict each one from both left and right context. Unlike left-to-right autocomplete, fill-mask uses what follows the blank too — in “The capital of France is [MASK]”, the period and everything before it both inform the prediction of “paris”.',
      },
      {
        title: 'One mask, one token',
        body: 'Each [MASK] predicts a single WordPiece token, not a whole phrase. Common words are one token (“dog”), but rarer words split into pieces (“unbelievable” becomes un + ##belie + ##vable). Multi-word completions need multiple masks, and the combinations multiply quickly.',
      },
      {
        title: 'What “uncased” means',
        body: 'All three models are uncased: input is lowercased and accents are stripped before prediction, so they do not distinguish “Apple” from “apple”. They were trained mostly on English Wikipedia and BookCorpus, so they are strongest on general English text.',
      },
    ],
    faqs: [
      {
        question: 'Why is the first run slow?',
        answer: 'The model weights — 45 to 110 MB depending on your choice — download on first use and the runtime initializes. After that the browser cache serves the model and predictions are fast.',
      },
      {
        question: 'Why do unusual words get odd predictions?',
        answer: 'Rare words are split into subword pieces, and a single [MASK] can only stand for one piece. Names, jargon, and coined terms are the hardest cases for these small models.',
      },
      {
        question: 'Is my text sent to a server?',
        answer: 'No. Inference runs locally in your browser with Transformers.js; no API call carries your text.',
      },
    ],
    references: [
      { label: 'BERT: Pre-training of Deep Bidirectional Transformers', href: 'https://arxiv.org/abs/1810.04805' },
      { label: 'Hugging Face Transformers.js', href: 'https://huggingface.co/docs/transformers.js' },
    ],
  },
  'hl7-to-fhir': {
    overview: 'Converts pipe-delimited HL7 v2 messages into FHIR R4 Bundles you can inspect or post to a server. Supported messages include ADT^A01/A02/A03/A04/A08 (admit, transfer, discharge, registration, update), ORM^O01 orders, ORU^R01 lab results, SIU scheduling messages, and VXU^V04 immunization updates. The output is a transaction Bundle containing Patient, Encounter, DiagnosticReport, Observation, ServiceRequest, Appointment, or Immunization resources as applicable, with a summary of what was generated and warnings for anything that did not map. Sample messages are built in.',
    steps: [
      'Paste an HL7 v2 message with segments on separate lines (MSH, PID, PV1, and so on).',
      'Choose Convert — or load a sample message first to see the mapping.',
      'Check the summary card for the message type, resource count, and bundle type.',
      'Review warnings for unmapped segments, then copy the FHIR R4 Bundle JSON.',
    ],
    details: [
      {
        title: 'How segments become resources',
        body: 'The MSH-9 message type drives the mapping. PID becomes a Patient, PV1 an Encounter, OBR a DiagnosticReport, each OBX an Observation under its report, an ORM order becomes a ServiceRequest, SCH an Appointment, and RXA an Immunization. Segments with no FHIR R4 counterpart are reported as warnings rather than silently dropped.',
      },
      {
        title: 'v2 and FHIR think differently',
        body: 'HL7 v2 is event messaging — “something happened, here is a snapshot”. FHIR is resource-based — discrete, addressable clinical objects. One ADT message can expand into several linked resources, and some v2 content — like site-specific Z-segments — has no standard R4 home at all.',
      },
      {
        title: 'The bundle is a transaction',
        body: 'Entries carry PUT requests with stable fullUrls, giving upsert semantics: posting the bundle to a FHIR R4 server’s base URL creates or updates the resources. For production feeds, validate against your server’s implementation guide first — real deployments enforce profiles beyond base R4.',
      },
    ],
    faqs: [
      {
        question: 'Which FHIR version does this produce?',
        answer: 'FHIR R4 (4.0.1), the most widely deployed version and the one the US Core implementation guides are built on.',
      },
      {
        question: 'What format does the input need?',
        answer: 'Standard ER7 pipe format: segments separated by carriage returns or newlines, fields separated by | — exactly as produced by integration engines like Mirth or Rhapsody.',
      },
      {
        question: 'Why did I get warnings alongside a successful conversion?',
        answer: 'The converter maps what it knows and lists what it skipped — typically Z-segments or fields without an R4 equivalent. The bundle is still usable; the warnings tell you what to review.',
      },
    ],
    references: [{ label: 'HL7 FHIR R4', href: 'https://hl7.org/fhir/R4/' }],
  },
  'svg-path-visualizer': {
    overview: 'Paste just the d attribute of an SVG path — the string of commands and coordinates — and watch it render live as you type. All commands are supported: M, L, H, V, C, S, Q, T, A, Z and their lowercase relative variants. One-click presets (curve, star, rectangle, arc, Bézier) give you shapes to experiment with, and the options panel exposes stroke color and width, fill, a grid overlay, and viewBox size. Copy SVG exports a complete, valid document wrapping your path.',
    steps: [
      'Paste the d attribute value into the editor — for example M 10 80 C 40 10, 65 10, 95 80.',
      'The preview re-renders on every keystroke; keep the grid on to read off coordinates.',
      'Open the options panel to tune stroke, width, fill, and viewBox size.',
      'Use Copy SVG to get a standalone <svg> document containing your path.',
    ],
    details: [
      {
        title: 'The command cheat sheet',
        body: 'M moves the pen, L draws a line, H and V draw horizontal and vertical lines, C is a cubic Bézier with two control points, S is a smooth cubic that mirrors the previous control point, Q is a quadratic Bézier, T its smooth variant, A draws an elliptical arc, and Z closes the path. Uppercase commands take absolute coordinates; lowercase are relative to the current point.',
      },
      {
        title: 'Demystifying the arc command',
        body: 'A rx ry x-axis-rotation large-arc-flag sweep-flag x y — the two flags are the confusing part. Between any two points there are four possible arcs of a given ellipse: large-arc-flag picks the longer or shorter way around, and sweep-flag picks the direction. Experiment on the Arc preset to build intuition.',
      },
      {
        title: 'Why relative commands exist',
        body: 'Lowercase commands express geometry relative to the pen, so an entire shape can be moved by changing only its initial M. Icon and font paths are often exported relative to make them position-independent; this viewer accepts both dialects interchangeably.',
      },
    ],
    faqs: [
      {
        question: 'Why is my path invisible?',
        answer: 'The usual suspects: coordinates outside the viewBox (increase the viewBox size in options), a fill of none with no visible stroke, or a malformed command. The note under the editor lists the supported command set.',
      },
      {
        question: 'Can I paste a whole SVG file?',
        answer: 'This page takes only the d attribute. To preview and edit a complete SVG document, use the SVG Editor tool instead.',
      },
      {
        question: 'Does it support curves exported from Figma or Illustrator?',
        answer: 'Yes. Export as SVG, copy the d value from the <path> element, and paste it here to inspect or tweak the geometry command by command.',
      },
    ],
    references: [{ label: 'MDN: SVG d attribute', href: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d' }],
  },
};
