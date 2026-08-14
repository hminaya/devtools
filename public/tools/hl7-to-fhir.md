# HL7 to FHIR Converter

> Convert HL7 v2 messages to FHIR R4 Bundles

Live tool: https://www.developers.do/tools/hl7-to-fhir
Category: Formatting

Free and browser-based: input data is processed locally on the user device and is not uploaded to a server.

## Overview

Converts pipe-delimited HL7 v2 messages into FHIR R4 Bundles you can inspect or post to a server. Supported messages include ADT^A01/A02/A03/A04/A08 (admit, transfer, discharge, registration, update), ORM^O01 orders, ORU^R01 lab results, SIU scheduling messages, and VXU^V04 immunization updates. The output is a transaction Bundle containing Patient, Encounter, DiagnosticReport, Observation, ServiceRequest, Appointment, or Immunization resources as applicable, with a summary of what was generated and warnings for anything that did not map. Sample messages are built in.

## How to use

1. Paste an HL7 v2 message with segments on separate lines (MSH, PID, PV1, and so on).
2. Choose Convert — or load a sample message first to see the mapping.
3. Check the summary card for the message type, resource count, and bundle type.
4. Review warnings for unmapped segments, then copy the FHIR R4 Bundle JSON.

## Important details

### How segments become resources

The MSH-9 message type drives the mapping. PID becomes a Patient, PV1 an Encounter, OBR a DiagnosticReport, each OBX an Observation under its report, an ORM order becomes a ServiceRequest, SCH an Appointment, and RXA an Immunization. Segments with no FHIR R4 counterpart are reported as warnings rather than silently dropped.

### v2 and FHIR think differently

HL7 v2 is event messaging — “something happened, here is a snapshot”. FHIR is resource-based — discrete, addressable clinical objects. One ADT message can expand into several linked resources, and some v2 content — like site-specific Z-segments — has no standard R4 home at all.

### The bundle is a transaction

Entries carry PUT requests with stable fullUrls, giving upsert semantics: posting the bundle to a FHIR R4 server’s base URL creates or updates the resources. For production feeds, validate against your server’s implementation guide first — real deployments enforce profiles beyond base R4.

## Frequently asked questions

### Which FHIR version does this produce?

FHIR R4 (4.0.1), the most widely deployed version and the one the US Core implementation guides are built on.

### What format does the input need?

Standard ER7 pipe format: segments separated by carriage returns or newlines, fields separated by | — exactly as produced by integration engines like Mirth or Rhapsody.

### Why did I get warnings alongside a successful conversion?

The converter maps what it knows and lists what it skipped — typically Z-segments or fields without an R4 equivalent. The bundle is still usable; the warnings tell you what to review.

## References

- [HL7 FHIR R4](https://hl7.org/fhir/R4/)


## Related tools

- [JSON Prettifier](https://www.developers.do/tools/json-prettifier): Format and validate JSON data
- [XML/HTML Formatter](https://www.developers.do/tools/xml-prettifier): Format, validate, prettify, and minify XML or HTML data
- [XML ↔ JSON Converter](https://www.developers.do/tools/xml-json-converter): Bidirectional XML-to-JSON and JSON-to-XML converter using the familiar @attr / _text convention; repeated tags collapse into arrays
- [JSONPath Query Engine](https://www.developers.do/tools/jsonpath-tester): Test JSONPath expressions — supports dot/bracket access, wildcards, slices, recursive descent (..), and filter [?(...)] expressions
- [GraphQL Formatter](https://www.developers.do/tools/graphql-formatter): Format and validate GraphQL queries, mutations, subscriptions, and fragments — preserves string literals, args, blocks, lists, and comments
