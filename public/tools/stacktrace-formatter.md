# Stack Trace Formatter

> Format, clean up, and beautify JavaScript, Python, Java, C#, Go, PHP, and Ruby stack traces

Live tool: https://www.developers.do/tools/stacktrace-formatter
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

This formatter cleans up raw or messy stack traces copied from terminals, CI logs, Docker output, browser consoles, and crash reporters. It detects JavaScript (including Node.js), Python, Java, C#, Go, PHP, or Ruby automatically, then rebuilds readable one-frame-per-line output with aligned frames and syntax highlighting: error types in red, function names in green, file paths in blue, and line numbers in purple. An optional anonymizer strips local user directories before you paste the trace into a bug report. Everything runs in your browser — the trace is never uploaded.

## How to use

1. Paste a raw or messy trace from a terminal, log, crash reporter, or browser console. The language is detected automatically from its frame syntax.
2. Choose Format to rebuild clean, aligned, color-coded output.
3. Enable Remove Sensitive Data first if the trace contains local paths you should not share.
4. Copy the beautified output into a bug report, pull request, or chat message, or click Next Example to cycle through sample traces.

## Important details

### Every runtime prints frames differently

JavaScript prints “at fn (file.js:10:5)”, Python prints File "app.py", line 10, in fn, Java prints at com.example.Class.method(File.java:42), Go prints goroutine headers, Ruby prints from file.rb:10:in `fn’ frames, and PHP prints numbered #0 frames. The formatter recognizes each dialect and normalizes indentation without changing the original frame order.

### Python reads bottom-up, Java reads top-down

Java, JavaScript, C#, PHP, and Ruby print the most recent call first, so the crash site is near the top of the trace. Python tracebacks print the most recent call last, so the failing line is at the bottom. The formatter preserves each language’s native order — knowing which direction to read saves real time during an incident.

### Formatting is not symbolication

Production JavaScript traces from minified bundles still show short names like t.a; mapping those back to original sources requires source maps. iOS crash logs similarly need dSYM symbolication. This tool beautifies the structure of the trace you already have — it does not resolve symbols.

### Why traces copied from logs look broken

Log shippers and terminals can wrap long lines, strip leading whitespace, and prepend timestamps or container IDs. That damages the visual nesting that makes traces scannable. Formatting restores consistent indentation so you can follow the call chain, while preserving the original frame order and diagnostic content.

## Frequently asked questions

### Why does the formatter say my trace is invalid?

Validation requires at least one recognizable frame pattern. Log lines with timestamps, log-level prefixes, or hard-wrapped lines break detection — strip the log decorations and paste just the trace itself.

### Can I format a trace copied from a browser console?

Yes. V8-style frames (Chrome, Edge, Node.js) in the form at fn (file:line:column) are fully supported, including async frames.

### Is my stack trace uploaded anywhere?

No. Language detection, formatting, highlighting, and the optional path anonymization all run locally in the browser tab.

### Will beautifying change what the stack trace means?

No. Only whitespace, alignment, coloring, and the optional path anonymization change. Frame order, function names, file names, and line numbers are preserved.

### Does the formatter work on .NET or Unity traces?

Yes. C#-style at Namespace.Class.Method() frames are supported, including stack traces copied from Unity and .NET application logs.

## References

- [V8 stack trace API](https://v8.dev/docs/stack-trace-api)
- [Python traceback module](https://docs.python.org/3/library/traceback.html)
- [MDN: Error.prototype.stack](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack)


## Related tools

- [JSON Prettifier](https://www.developers.do/tools/json-prettifier): Format and validate JSON data
- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
