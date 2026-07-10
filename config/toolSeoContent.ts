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
    overview: 'The UUID generator creates version 4 UUIDs with the browser’s cryptographic random-number source. You can generate between one and fifty identifiers at a time and copy the complete newline-separated list.',
    steps: [
      'Choose how many UUIDs to create, from 1 through 50.',
      'Select Generate UUIDs.',
      'Copy the generated identifiers and store them in the system that needs unique random IDs.',
    ],
    details: [
      {
        title: 'What a version 4 UUID contains',
        body: 'A UUID v4 is a 128-bit identifier with fixed version and variant bits and the remaining bits generated randomly. Its familiar text form uses 32 hexadecimal digits separated into five groups.',
      },
      {
        title: 'Uniqueness and storage',
        body: 'Random UUID collisions are extraordinarily unlikely, but a database should still enforce a unique constraint when uniqueness is a correctness requirement. Store UUIDs in a native UUID or compact binary type when your database supports one.',
      },
    ],
    faqs: [
      {
        question: 'Are these sequential UUIDs?',
        answer: 'No. They are random version 4 UUIDs and do not encode a timestamp or sortable sequence.',
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
};
