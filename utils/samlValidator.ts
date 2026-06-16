/**
 * SAML Response Validator / SSO Debugger.
 *
 * Decodes a SAML Response and runs a structural + temporal checklist covering
 * the most common real-world SSO failure causes: status, timing (NotBefore /
 * NotOnOrAfter with clock-skew tolerance), audience, recipient/destination,
 * InResponseTo, issuer, and signature presence/coverage + signing-cert expiry.
 *
 * IMPORTANT: this does NOT perform cryptographic XML signature verification
 * (which requires XML canonicalization / exclusive C14N). It reports whether a
 * signature is present and what it covers, and flags embedded certificate
 * expiry — but a "pass" here is not proof the signature is cryptographically
 * valid. Checks are honest about that limitation.
 *
 * Zero external dependencies — reuses the existing SAML decode + x509 utils.
 */

import { decodeSaml } from './saml';
import { parseX509, pemToDer, derToPem, extractBase64Certificates, getExpiryStatus } from './x509';

const NS_SAML = 'urn:oasis:names:tc:SAML:2.0:assertion';
const NS_SAMLP = 'urn:oasis:names:tc:SAML:2.0:protocol';
const NS_DS = 'http://www.w3.org/2000/09/xmldsig#';

/** Tolerance applied to timestamp comparisons to absorb clock skew between IdP and SP. */
export const CLOCK_SKEW_SECONDS = 120;

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface ValidationCheck {
  /** Short label, e.g. "Status", "Conditions NotOnOrAfter". */
  label: string;
  status: CheckStatus;
  /** Plain-English explanation of the result and, when failing, how to fix it. */
  detail: string;
}

export interface ExpectedValues {
  audience?: string;
  destination?: string;
  inResponseTo?: string;
  issuer?: string;
}

export interface ValidationResult {
  /** True only when there are no `fail` checks. */
  valid: boolean;
  type: string;
  prettyXml: string;
  checks: ValidationCheck[];
  summary: { pass: number; warn: number; fail: number };
}

function firstEl(parent: Element | Document, ns: string, localName: string): Element | null {
  const els = parent.getElementsByTagNameNS(ns, localName);
  return els.length > 0 ? els[0]! : null;
}

/** Parse a SAML xsd:dateTime; returns null if missing/unparseable. */
function parseInstant(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function fmt(d: Date): string {
  return `${d.toISOString()} (${d.toLocaleString()})`;
}

/**
 * Validate a NotBefore boundary: the assertion is invalid before this instant.
 * Skew is applied so a slightly-future NotBefore still passes.
 */
function checkNotBefore(label: string, value: string | null, now: number): ValidationCheck | null {
  const d = parseInstant(value);
  if (value && !d) return { label, status: 'warn', detail: `Could not parse timestamp "${value}".` };
  if (!d) return null;
  const t = d.getTime();
  if (now + CLOCK_SKEW_SECONDS * 1000 < t) {
    return {
      label,
      status: 'fail',
      detail: `${label} is in the future (${fmt(d)}). The assertion is not yet valid — likely IdP/SP clock skew. Sync clocks (NTP) or widen the SP's allowed skew.`,
    };
  }
  return { label, status: 'pass', detail: `${label} ${fmt(d)} is in the past — OK.` };
}

/**
 * Validate a NotOnOrAfter boundary: the assertion is invalid at/after this instant.
 * Skew is applied so a just-expired value still passes.
 */
function checkNotOnOrAfter(label: string, value: string | null, now: number): ValidationCheck | null {
  const d = parseInstant(value);
  if (value && !d) return { label, status: 'warn', detail: `Could not parse timestamp "${value}".` };
  if (!d) return null;
  const t = d.getTime();
  if (now - CLOCK_SKEW_SECONDS * 1000 >= t) {
    return {
      label,
      status: 'fail',
      detail: `${label} has passed (${fmt(d)}). The assertion has expired — SAML assertions are short-lived (often ~5 min). Re-initiate login; if it expires immediately, check IdP/SP clock skew.`,
    };
  }
  return { label, status: 'pass', detail: `${label} ${fmt(d)} is in the future — OK.` };
}

function matchCheck(
  label: string,
  actual: string | null,
  expected: string | undefined,
  missingDetail: string
): ValidationCheck {
  if (!actual) {
    return { label, status: 'warn', detail: missingDetail };
  }
  if (expected && expected.trim()) {
    if (actual.trim() === expected.trim()) {
      return { label, status: 'pass', detail: `Matches the expected value: ${actual}` };
    }
    return {
      label,
      status: 'fail',
      detail: `Mismatch. Response has "${actual}" but you expected "${expected.trim()}". This is a very common SSO misconfiguration — align the value on the IdP and SP.`,
    };
  }
  return { label, status: 'info', detail: actual };
}

export async function validateSamlResponse(
  input: string,
  expected: ExpectedValues = {}
): Promise<{ success: boolean; data?: ValidationResult; error?: string }> {
  const decodedResult = await decodeSaml(input);
  if (!decodedResult.success || !decodedResult.data) {
    return { success: false, error: decodedResult.error || 'Failed to decode SAML input.' };
  }

  const decoded = decodedResult.data;
  const parser = new DOMParser();
  const doc = parser.parseFromString(decoded.xml, 'text/xml');
  if (doc.querySelector('parsererror')) {
    return { success: false, error: 'Decoded content is not valid XML.' };
  }

  const root = doc.documentElement;
  const checks: ValidationCheck[] = [];
  const now = Date.now();

  if (decoded.type !== 'Response') {
    checks.push({
      label: 'Document Type',
      status: 'warn',
      detail: `This looks like a "${decoded.type}", not a SAML Response. This validator targets Responses/Assertions; some checks may not apply.`,
    });
  }

  // --- Status ---
  const statusCodeEl = firstEl(doc, NS_SAMLP, 'StatusCode');
  const statusCode = statusCodeEl?.getAttribute('Value') || null;
  if (statusCode) {
    const short = statusCode.split(':').pop() || statusCode;
    if (short === 'Success') {
      checks.push({ label: 'Status', status: 'pass', detail: 'StatusCode is Success.' });
    } else {
      const statusMsg = firstEl(doc, NS_SAMLP, 'StatusMessage')?.textContent?.trim();
      checks.push({
        label: 'Status',
        status: 'fail',
        detail: `StatusCode is "${short}" (${statusCode})${statusMsg ? ` — "${statusMsg}"` : ''}. The IdP rejected the authentication; this is an IdP-side decision, not an SP parsing issue.`,
      });
    }
  } else if (decoded.type === 'Response') {
    checks.push({ label: 'Status', status: 'fail', detail: 'No <StatusCode> found. A SAML Response must contain a Status.' });
  }

  // --- Assertion presence ---
  const assertion = firstEl(doc, NS_SAML, 'Assertion');
  if (decoded.type === 'Response' && !assertion) {
    const encrypted = firstEl(doc, NS_SAML, 'EncryptedAssertion');
    if (encrypted) {
      checks.push({
        label: 'Assertion',
        status: 'info',
        detail: 'The assertion is encrypted (<EncryptedAssertion>). It must be decrypted with the SP private key before its contents can be validated — this tool cannot inspect encrypted assertions.',
      });
    } else {
      checks.push({ label: 'Assertion', status: 'fail', detail: 'No <Assertion> found in the Response.' });
    }
  }

  const scope = assertion || doc;

  // --- Issuer ---
  const issuer = firstEl(scope, NS_SAML, 'Issuer')?.textContent?.trim() || null;
  checks.push(
    matchCheck(
      'Issuer',
      issuer,
      expected.issuer,
      'No <Issuer> found. SPs use the Issuer (IdP entity ID) to select the verification certificate; most reject responses without it.'
    )
  );

  // --- Destination (on Response root) ---
  checks.push(
    matchCheck(
      'Destination',
      root?.getAttribute('Destination') || null,
      expected.destination,
      'No Destination attribute on the Response. Optional, but when present it must equal the SP ACS URL.'
    )
  );

  // --- Conditions timing & Audience ---
  const conditions = firstEl(scope, NS_SAML, 'Conditions');
  if (conditions) {
    const nb = checkNotBefore('Conditions NotBefore', conditions.getAttribute('NotBefore'), now);
    if (nb) checks.push(nb);
    const noa = checkNotOnOrAfter('Conditions NotOnOrAfter', conditions.getAttribute('NotOnOrAfter'), now);
    if (noa) checks.push(noa);

    const audience = firstEl(conditions, NS_SAML, 'Audience')?.textContent?.trim() || null;
    checks.push(
      matchCheck(
        'Audience',
        audience,
        expected.audience,
        'No <AudienceRestriction>/<Audience> found. Most SPs require the Audience to equal their own entity ID and reject the assertion otherwise.'
      )
    );
  } else if (assertion) {
    checks.push({ label: 'Conditions', status: 'warn', detail: 'No <Conditions> element. Most SPs expect Conditions with NotBefore/NotOnOrAfter and an AudienceRestriction.' });
  }

  // --- SubjectConfirmationData: Recipient, NotOnOrAfter, InResponseTo ---
  const scd = firstEl(scope, NS_SAML, 'SubjectConfirmationData');
  if (scd) {
    const recip = matchCheck(
      'SubjectConfirmation Recipient',
      scd.getAttribute('Recipient'),
      expected.destination,
      'SubjectConfirmationData has no Recipient. When present it must equal the SP ACS URL.'
    );
    checks.push(recip);

    const scdExpiry = checkNotOnOrAfter('SubjectConfirmation NotOnOrAfter', scd.getAttribute('NotOnOrAfter'), now);
    if (scdExpiry) checks.push(scdExpiry);

    checks.push(
      matchCheck(
        'InResponseTo',
        scd.getAttribute('InResponseTo') || root?.getAttribute('InResponseTo') || null,
        expected.inResponseTo,
        'No InResponseTo. Expected for SP-initiated SSO (it ties the response to your AuthnRequest); absent for IdP-initiated SSO, which some SPs reject.'
      )
    );
  } else if (assertion) {
    checks.push({ label: 'SubjectConfirmationData', status: 'warn', detail: 'No <SubjectConfirmationData> found. Bearer assertions normally include it with Recipient and NotOnOrAfter.' });
  }

  // --- Signature presence & coverage ---
  const sigEls = doc.getElementsByTagNameNS(NS_DS, 'Signature');
  if (sigEls.length === 0) {
    checks.push({
      label: 'Signature',
      status: 'fail',
      detail: 'No <ds:Signature> found. The response/assertion is unsigned and almost every SP will reject it. The IdP must sign the Response or the Assertion.',
    });
  } else {
    // Determine what each signature's parent element is (Response vs Assertion).
    const covered = new Set<string>();
    for (let i = 0; i < sigEls.length; i++) {
      const parent = sigEls[i]!.parentElement;
      if (parent?.localName) covered.add(parent.localName);
    }
    const coverList = Array.from(covered).join(', ') || 'unknown element';
    checks.push({
      label: 'Signature',
      status: 'info',
      detail: `Signature present (covers: ${coverList}). Note: cryptographic validity is NOT checked here — verifying an XML signature requires canonicalization. Use your IdP's certificate and a server-side library to confirm the signature itself.`,
    });
  }

  // --- Embedded signing certificate expiry ---
  const certStrings = extractBase64Certificates(doc);
  if (certStrings.length > 0) {
    let anyExpired = false;
    let anyExpiring = false;
    let parsedAny = false;
    for (const b64 of certStrings) {
      try {
        const pem = `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----`;
        const der = pemToDer(pem);
        const cert = await parseX509(der, derToPem(der));
        parsedAny = true;
        const status = getExpiryStatus(cert);
        if (status === 'expired') anyExpired = true;
        else if (status === 'expiring-soon') anyExpiring = true;
      } catch {
        // skip unparseable certs
      }
    }
    if (parsedAny) {
      if (anyExpired) {
        checks.push({ label: 'Signing Certificate', status: 'fail', detail: 'An embedded X.509 certificate has expired. SPs reject signatures from expired certificates — the IdP must rotate to a current certificate.' });
      } else if (anyExpiring) {
        checks.push({ label: 'Signing Certificate', status: 'warn', detail: 'An embedded certificate expires within 30 days. Plan a rotation to avoid an outage.' });
      } else {
        checks.push({ label: 'Signing Certificate', status: 'pass', detail: 'Embedded certificate(s) are within their validity period.' });
      }
    }
  }

  const summary = {
    pass: checks.filter(c => c.status === 'pass').length,
    warn: checks.filter(c => c.status === 'warn').length,
    fail: checks.filter(c => c.status === 'fail').length,
  };

  return {
    success: true,
    data: {
      valid: summary.fail === 0,
      type: decoded.type,
      prettyXml: decoded.prettyXml,
      checks,
      summary,
    },
  };
}

/** A valid, freshly-timestamped sample so the happy path doesn't fail on expiry. */
export function buildSampleResponse(): string {
  const now = new Date();
  const iso = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const xml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_resp_sample" Version="2.0" IssueInstant="${iso(0)}" Destination="https://sp.example.com/acs" InResponseTo="_req_abc123">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  <saml:Assertion Version="2.0" ID="_assert_sample" IssueInstant="${iso(0)}">
    <saml:Issuer>https://idp.example.com</saml:Issuer>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:SignedInfo/><ds:SignatureValue>SAMPLE</ds:SignatureValue></ds:Signature>
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">user@example.com</saml:NameID>
      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        <saml:SubjectConfirmationData NotOnOrAfter="${iso(5 * 60 * 1000)}" Recipient="https://sp.example.com/acs" InResponseTo="_req_abc123"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="${iso(-5 * 60 * 1000)}" NotOnOrAfter="${iso(5 * 60 * 1000)}">
      <saml:AudienceRestriction>
        <saml:Audience>https://sp.example.com</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AuthnStatement AuthnInstant="${iso(0)}" SessionIndex="_sess_xyz">
      <saml:AuthnContext>
        <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
      </saml:AuthnContext>
    </saml:AuthnStatement>
  </saml:Assertion>
</samlp:Response>`;
  return btoa(xml);
}

/** An expired, unsigned sample that trips several failure checks for demonstration. */
export function buildBrokenSampleResponse(): string {
  const xml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_resp_broken" Version="2.0" IssueInstant="2020-01-01T10:00:00Z" Destination="https://sp.example.com/acs">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  <saml:Assertion Version="2.0" ID="_assert_broken" IssueInstant="2020-01-01T10:00:00Z">
    <saml:Issuer>https://idp.example.com</saml:Issuer>
    <saml:Subject>
      <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">user@example.com</saml:NameID>
      <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
        <saml:SubjectConfirmationData NotOnOrAfter="2020-01-01T10:05:00Z" Recipient="https://sp.example.com/acs"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="2020-01-01T09:55:00Z" NotOnOrAfter="2020-01-01T10:05:00Z">
      <saml:AudienceRestriction>
        <saml:Audience>https://sp.example.com</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
  </saml:Assertion>
</samlp:Response>`;
  return btoa(xml);
}
