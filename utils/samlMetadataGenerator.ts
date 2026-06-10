/**
 * SAML Metadata Generator utility.
 * Generates SAML 2.0 EntityDescriptor metadata XML for SPs and IdPs from form fields.
 * Zero external dependencies.
 */

export type MetadataEntityType = 'SP' | 'IdP';

export interface SamlMetadataInput {
  entityType: MetadataEntityType;
  entityId: string;
  validityDays: number | '';
  signingCert: string;
  encryptionCert: string;
  nameIdFormats: string[];

  // SP fields
  acsUrl: string;
  acsBinding: string;
  authnRequestsSigned: boolean;
  wantAssertionsSigned: boolean;

  // IdP fields
  ssoUrl: string;
  ssoBinding: string;
  wantAuthnRequestsSigned: boolean;

  // Shared optional fields
  sloUrl: string;
  sloBinding: string;
  orgName: string;
  orgDisplayName: string;
  orgUrl: string;
  contactType: string;
  contactEmail: string;
}

export const BINDINGS = [
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST', label: 'HTTP-POST' },
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect', label: 'HTTP-Redirect' },
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact', label: 'HTTP-Artifact' },
  { value: 'urn:oasis:names:tc:SAML:2.0:bindings:SOAP', label: 'SOAP' },
];

export const NAMEID_FORMAT_OPTIONS = [
  { value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress', label: 'Email Address' },
  { value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent', label: 'Persistent' },
  { value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient', label: 'Transient' },
  { value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified', label: 'Unspecified' },
];

export const CONTACT_TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'support', label: 'Support' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'billing', label: 'Billing' },
  { value: 'other', label: 'Other' },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatISODate(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Accepts a PEM block or raw Base64 and returns the Base64 body wrapped
 * at 64 characters, or throws if the content is not valid Base64.
 */
export function normalizeCertificate(cert: string): string {
  const body = cert
    .replace(/-----(BEGIN|END)[^-]*-----/g, '')
    .replace(/\s+/g, '');
  if (!body) return '';
  if (!/^[A-Za-z0-9+/]+=*$/.test(body)) {
    throw new Error('Certificate is not valid PEM or Base64. Paste the full -----BEGIN CERTIFICATE----- block or its Base64 body.');
  }
  return body.replace(/(.{64})/g, '$1\n').trim();
}

function buildKeyDescriptor(use: 'signing' | 'encryption', certBody: string): string {
  const indentedCert = certBody
    .split('\n')
    .map(line => `          ${line}`)
    .join('\n');
  return `    <md:KeyDescriptor use="${use}">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>
${indentedCert}
          </ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>`;
}

export function buildMetadataXml(input: SamlMetadataInput): string {
  if (!input.entityId.trim()) {
    throw new Error('Entity ID is required.');
  }
  if (input.entityType === 'SP' && !input.acsUrl.trim()) {
    throw new Error('Assertion Consumer Service (ACS) URL is required for SP metadata.');
  }
  if (input.entityType === 'IdP' && !input.ssoUrl.trim()) {
    throw new Error('Single Sign-On (SSO) URL is required for IdP metadata.');
  }

  const signingCert = normalizeCertificate(input.signingCert);
  const encryptionCert = normalizeCertificate(input.encryptionCert);

  const descriptorParts: string[] = [];
  if (signingCert) descriptorParts.push(buildKeyDescriptor('signing', signingCert));
  if (encryptionCert) descriptorParts.push(buildKeyDescriptor('encryption', encryptionCert));

  if (input.sloUrl.trim()) {
    descriptorParts.push(
      `    <md:SingleLogoutService Binding="${escapeXml(input.sloBinding)}" Location="${escapeXml(input.sloUrl.trim())}"/>`
    );
  }

  for (const format of input.nameIdFormats) {
    descriptorParts.push(`    <md:NameIDFormat>${escapeXml(format)}</md:NameIDFormat>`);
  }

  let descriptor: string;
  if (input.entityType === 'SP') {
    descriptorParts.push(
      `    <md:AssertionConsumerService Binding="${escapeXml(input.acsBinding)}" Location="${escapeXml(input.acsUrl.trim())}" index="0" isDefault="true"/>`
    );
    descriptor = `  <md:SPSSODescriptor AuthnRequestsSigned="${input.authnRequestsSigned}" WantAssertionsSigned="${input.wantAssertionsSigned}" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
${descriptorParts.join('\n')}
  </md:SPSSODescriptor>`;
  } else {
    descriptorParts.push(
      `    <md:SingleSignOnService Binding="${escapeXml(input.ssoBinding)}" Location="${escapeXml(input.ssoUrl.trim())}"/>`
    );
    descriptor = `  <md:IDPSSODescriptor WantAuthnRequestsSigned="${input.wantAuthnRequestsSigned}" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
${descriptorParts.join('\n')}
  </md:IDPSSODescriptor>`;
  }

  const entityParts: string[] = [descriptor];

  if (input.orgName.trim() || input.orgDisplayName.trim() || input.orgUrl.trim()) {
    const name = input.orgName.trim() || input.orgDisplayName.trim();
    const displayName = input.orgDisplayName.trim() || name;
    const url = input.orgUrl.trim() || input.entityId.trim();
    entityParts.push(`  <md:Organization>
    <md:OrganizationName xml:lang="en">${escapeXml(name)}</md:OrganizationName>
    <md:OrganizationDisplayName xml:lang="en">${escapeXml(displayName)}</md:OrganizationDisplayName>
    <md:OrganizationURL xml:lang="en">${escapeXml(url)}</md:OrganizationURL>
  </md:Organization>`);
  }

  if (input.contactEmail.trim()) {
    entityParts.push(`  <md:ContactPerson contactType="${escapeXml(input.contactType)}">
    <md:EmailAddress>mailto:${escapeXml(input.contactEmail.trim())}</md:EmailAddress>
  </md:ContactPerson>`);
  }

  let validUntilAttr = '';
  if (input.validityDays !== '' && input.validityDays > 0) {
    const validUntil = new Date(Date.now() + input.validityDays * 24 * 60 * 60 * 1000);
    validUntilAttr = ` validUntil="${formatISODate(validUntil)}"`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${escapeXml(input.entityId.trim())}"${validUntilAttr}>
${entityParts.join('\n')}
</md:EntityDescriptor>`;
}

export function getDefaultMetadataInput(): SamlMetadataInput {
  return {
    entityType: 'SP',
    entityId: 'https://sp.example.com/metadata',
    validityDays: '',
    signingCert: '',
    encryptionCert: '',
    nameIdFormats: ['urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'],
    acsUrl: 'https://sp.example.com/acs',
    acsBinding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
    authnRequestsSigned: false,
    wantAssertionsSigned: true,
    ssoUrl: 'https://idp.example.com/sso',
    ssoBinding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
    wantAuthnRequestsSigned: false,
    sloUrl: '',
    sloBinding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
    orgName: '',
    orgDisplayName: '',
    orgUrl: '',
    contactType: 'technical',
    contactEmail: '',
  };
}
