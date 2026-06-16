# Promotion: Submission Kit

Verified targets, exact entry text in each list's format, and ready-to-post drafts.
Researched 2026-06-10. Submit top-to-bottom; the first three are the best effort/reward.

---

## 1. awesome-FHIR (fhir-fuel/awesome-FHIR, 143⭐) — BEST FIT

The **"HL7v2 to FHIR" section is currently empty** — you'd be the first entry.

- Repo: https://github.com/fhir-fuel/awesome-FHIR
- Section: `### HL7v2 to FHIR`
- Entry (their format is `* [Name](url) - description`):

```markdown
* [HL7 to FHIR Converter](https://developers.do/tools/hl7-to-fhir) - free browser-based converter from HL7 v2 messages to FHIR R4 Bundles; runs fully client-side, no PHI leaves the browser
```

PR title: `Add HL7 to FHIR Converter to HL7v2 to FHIR section`

## 2. awesome-free-online-debugging-tools (sangmin7648, 9⭐) — EASIEST WIN

Small list, but the scope ("free, no-signup, in-browser") matches developers.do exactly,
and it explicitly welcomes PRs. Format: `- **Name** — description. URL`

- Repo: https://github.com/sangmin7648/awesome-free-online-debugging-tools

```markdown
## Stack Traces & Logs
- **DevTools Stacktrace Formatter** — Format & analyze stack traces from Java, Python, C#, JS and more; 100% client-side. https://developers.do/tools/stacktrace-formatter

## API & Webhook Debugging
- **DevTools API Tester** — Browser-based API request tester, no signup. https://developers.do/tools/api-tester

## JSON / YAML / REGEX
- **DevTools JSON Prettifier** — Format/validate JSON; YAML↔JSON and CSV↔JSON converters on the same site. https://developers.do/tools/json-prettifier
- **DevTools Regex Tester** — Test regex with match highlighting, capture groups, replacement. https://developers.do/tools/regex-tester

## SQL
- **DevTools SQL Formatter** — Format SQL for MySQL, PostgreSQL, SQLite and more, in-browser. https://developers.do/tools/sql-formatter

## Time & IDs
- **DevTools Unix Timestamp Converter** — Epoch ↔ human-readable with timezone support. https://developers.do/tools/unix-timestamp

## Cookies & Tokens
- **DevTools JWT Decoder** — Decode and inspect JWTs without sending them to a server. https://developers.do/tools/jwt-decoder

## Cron Expression Helpers
- **DevTools Cron Tester & Generator** — Explain cron expressions in plain English and build them visually. https://developers.do/tools/cron-tester
```

PR note: maybe submit 3-4 strongest entries rather than all 8, to avoid looking spammy.
Suggested subset: Stacktrace Formatter, JWT Decoder, Cron Tester, SQL Formatter.

## 3. awesome-iam (kdeldycke/awesome-iam, 2,209⭐) — HIGHEST AUTHORITY

Strictly curated but has `## SAML` and `### JWT` sections that include tools (jwt.io is listed).
File is `readme.md` on `main`. Entries use `- [Name](url) - Sentence description.`

- Repo: https://github.com/kdeldycke/awesome-iam

SAML section entry:

```markdown
- [developers.do SAML tools](https://developers.do/tools/saml-decoder) - Free browser-based SAML toolbox: decode Requests/Responses, parse and generate metadata, inspect X.509 certificates, and build test assertions. Runs 100% client-side, so production SAML payloads never leave your browser.
```

PR title: `Add developers.do SAML toolbox to SAML section`
Pitch the privacy angle in the PR body — pasting real SAML responses into random
ad-funded web tools is a genuine security problem this solves.

## 4. awesome-saml (taiyeoguns/awesome-saml, 10⭐)

Small but exact topic match. Has a `## Testing` section. Format: `- [Name](url)`.

- Repo: https://github.com/taiyeoguns/awesome-saml (README on `master`)

```markdown
## Testing
- [developers.do SAML Decoder](https://developers.do/tools/saml-decoder) - decode SAML Requests/Responses in the browser
- [developers.do SAML Assertion Builder](https://developers.do/tools/saml-builder) - generate test SAML Responses, AuthnRequests, LogoutRequests
- [developers.do SAML Metadata Generator](https://developers.do/tools/saml-metadata-generator) - build SP/IdP EntityDescriptor metadata XML
```

## 5. awesome-healthcare (kakoni/awesome-healthcare, 3,815⭐)

`### Integration` section lists open-source converters (Microsoft FHIR Converter is there).
Format: `  * [Name](url) - description`. Link the GitHub repo (they prefer OSS links).

```markdown
  * [DevTools HL7 Tools](https://github.com/hminaya/devtools) - Browser-based HL7 v2 parser and HL7-to-FHIR R4 converter; fully client-side so PHI never leaves the machine.
```

## 6. awesome-devtools (devtoolsd/awesome-devtools, 665⭐)

General-purpose list, `## Productivity & Misc` or `## Testing & Quality`.

```markdown
- [developers.do](https://developers.do) - 50+ free developer tools (formatters, converters, SAML/JWT debuggers, generators) that run 100% in the browser with no backend.
```

---

## Show HN draft

Title (≤80 chars):

```
Show HN: 50+ developer tools that run entirely in your browser – no backend
```

Body:

```
I got tired of pasting JWTs, SAML responses, and HL7 messages into ad-covered
tool sites that send everything to a server, so I built my own collection:
https://developers.do

- ~55 tools: formatters, converters (JSON→TypeScript/C#/Go/Rust/...), SAML
  decoder/metadata tools, JWT decoder, HL7→FHIR converter, cron tester,
  regex tester, stack trace formatter, etc.
- Everything runs client-side. The site is a static Next.js export served by
  nginx — there is no API. Open the network tab and verify nothing is sent.
- The AI tools (summarization, sentiment, embeddings) run in-browser via
  transformers.js.
- Open source: https://github.com/hminaya/devtools

The privacy angle is the whole point: the things developers paste into these
tools (tokens, certs, patient messages, stack traces with internal paths) are
exactly the things that shouldn't leave your machine.

Happy to answer questions about the static-export setup or the in-browser AI.
```

Tips: post Tue-Thu, 8-10am ET. Stay in the thread answering comments for the
first 2-3 hours — engagement drives ranking. Expect blunt feedback; respond to it.

---

## Directory submissions (web forms, no PR)

| Site | URL | Notes |
|------|-----|-------|
| AlternativeTo | https://alternativeto.net/manage-item/ | Register developers.do as alternative to CodeBeautify, FreeFormatter, JSONFormatter.org, jwt.io |
| Product Hunt | https://www.producthunt.com/posts/new | Needs images/tagline (below). Launch Tue-Thu |
| StackShare | https://stackshare.io/submit-tool | List under "Developer Utilities" |
| Uneed | https://www.uneed.best/submit-a-tool | Free dev-tool directory, fast approval |
| ToolPilot / devhunt | https://devhunt.org | Dev-tool-specific Product Hunt clone |

Product Hunt copy:

- Tagline (60 chars): `Free developer tools that never see your data`
- Description: `55+ browser-based developer tools — JSON/SQL/XML formatters, JWT & SAML debuggers, HL7→FHIR converter, code generators, regex tester, and in-browser AI text tools. No backend, no signup, no ads. Everything runs client-side: open the network tab and watch nothing leave your machine.`

---

## GitHub repo housekeeping (do before submitting)

1. **Add topics** (Settings → edit topics, currently empty):
   `developer-tools, devtools, online-tools, saml, jwt, hl7, fhir, json,
   formatter, converter, regex, cron, privacy, client-side, nextjs,
   typescript, transformers-js, browser-tools`
2. README clone URL — fixed (was `hminaya/devtools/devtools.git`).
3. Consider a `CONTRIBUTING.md` and GitHub social-preview image — maintainers
   and HN readers will click through to the repo.
