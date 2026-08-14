# SQL Formatter

> Format and prettify SQL queries with support for MySQL, PostgreSQL, SQLite, and more

Live tool: https://www.developers.do/tools/sql-formatter
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

The SQL formatter restructures queries with consistent indentation and keyword casing. It supports generic SQL plus MySQL, MariaDB, PostgreSQL, SQLite, SQL Server T-SQL, and Oracle PL/SQL formatting rules. Queries are formatted in your browser.

## How to use

1. Paste one or more SQL statements and choose the closest database dialect.
2. Select indentation, keyword case, and spacing preferences.
3. Format the query, inspect any syntax error, and copy the resulting SQL.

## Important details

### Formatting is not database validation

A formatter can identify some tokenization or syntax problems, but it does not connect to a database, resolve table names, check types, explain a query plan, or prove that a statement is safe to execute.

### Choose the correct dialect

Quoting, functions, procedural blocks, limit clauses, and vendor extensions differ across databases. Selecting the correct dialect improves formatting and reduces false errors for database-specific syntax.

## Frequently asked questions

### Will formatting change what a query does?

The formatter is designed to change layout and keyword case, not query semantics. Always review generated output before running important statements.

### Does the tool execute my SQL?

No. It does not connect to a database or run queries.


## Related tools

- [JSON Prettifier](https://www.developers.do/tools/json-prettifier): Format and validate JSON data
- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
