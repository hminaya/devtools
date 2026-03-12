import { pemToDer } from './x509';

const ASN1_SEQUENCE = 0x30;
const ASN1_SET = 0x31;
const ASN1_BOOLEAN = 0x01;
const ASN1_INTEGER = 0x02;
const ASN1_BIT_STRING = 0x03;
const ASN1_OCTET_STRING = 0x04;
const ASN1_OID = 0x06;
const ASN1_UTF8_STRING = 0x0c;
const ASN1_PRINTABLE_STRING = 0x13;
const ASN1_IA5_STRING = 0x16;
const ASN1_UTC_TIME = 0x17;
const ASN1_GENERALIZED_TIME = 0x18;

interface ASN1Node {
  tag: number;
  length: number;
  value: Uint8Array;
  children?: ASN1Node[];
  headerLength: number;
}

const OID_MAP: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.4': 'surname',
  '2.5.4.5': 'serialNumber',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '2.5.4.12': 'title',
  '2.5.4.42': 'givenName',
  '1.2.840.113549.1.9.1': 'emailAddress',
  '1.2.840.113549.1.9.7': 'challengePassword',
  '1.2.840.113549.1.9.14': 'extensionRequest',
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
  '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
  '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
  '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
  '1.2.840.10045.2.1': 'EC',
  '1.2.840.10045.3.1.7': 'P-256',
  '1.3.132.0.34': 'P-384',
  '1.3.132.0.35': 'P-521',
  '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
  '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '2.5.29.15': 'keyUsage',
  '2.5.29.17': 'subjectAltName',
  '2.5.29.19': 'basicConstraints',
  '2.5.29.37': 'extKeyUsage',
  '1.3.6.1.5.5.7.3.1': 'serverAuth',
  '1.3.6.1.5.5.7.3.2': 'clientAuth',
  '1.3.6.1.5.5.7.3.3': 'codeSigning',
  '1.3.6.1.5.5.7.3.4': 'emailProtection',
};

const KEY_USAGE_BITS = [
  'digitalSignature',
  'nonRepudiation',
  'keyEncipherment',
  'dataEncipherment',
  'keyAgreement',
  'keyCertSign',
  'cRLSign',
  'encipherOnly',
  'decipherOnly',
];

const EC_CURVE_BITS: Record<string, number> = {
  'P-256': 256,
  'P-384': 384,
  'P-521': 521,
};

export interface CsrAttribute {
  oid: string;
  name: string;
  values: string[];
}

export interface CsrExtension {
  oid: string;
  name: string;
  critical: boolean;
  values: string[];
}

export interface CertificateSigningRequest {
  subject: string;
  subjectComponents: Record<string, string>;
  version: number;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  publicKeySize?: number;
  publicKeyCurve?: string;
  sans: string[];
  keyUsage: string[];
  extKeyUsage: string[];
  challengePassword?: string;
  attributes: CsrAttribute[];
  extensions: CsrExtension[];
  sha1Fingerprint: string;
  sha256Fingerprint: string;
  pem: string;
  derBase64: string;
}

function parseASN1(data: Uint8Array, offset: number = 0): ASN1Node {
  if (offset >= data.length) {
    throw new Error('Unexpected end of ASN.1 data');
  }

  const tag = data[offset]!;
  let pos = offset + 1;

  const firstLenByte = data[pos]!;
  pos++;

  let length = 0;
  if (firstLenByte < 0x80) {
    length = firstLenByte;
  } else {
    const numLenBytes = firstLenByte & 0x7f;
    for (let i = 0; i < numLenBytes; i++) {
      length = (length << 8) | data[pos]!;
      pos++;
    }
  }

  const headerLength = pos - offset;
  const value = data.slice(pos, pos + length);
  const node: ASN1Node = { tag, length, value, headerLength };

  const isConstructed =
    (tag & 0x20) !== 0 ||
    tag === ASN1_SEQUENCE ||
    tag === ASN1_SET ||
    (tag >= 0xa0 && tag <= 0xaf);

  if (isConstructed && length > 0) {
    node.children = parseASN1Children(value);
  }

  return node;
}

function parseASN1Children(data: Uint8Array): ASN1Node[] {
  const children: ASN1Node[] = [];
  let pos = 0;

  while (pos < data.length) {
    const child = parseASN1(data, pos);
    children.push(child);
    pos += child.headerLength + child.length;
  }

  return children;
}

function decodeOID(data: Uint8Array): string {
  if (data.length === 0) {
    return '';
  }

  const components: number[] = [];
  const first = data[0]!;
  components.push(Math.floor(first / 40));
  components.push(first % 40);

  let value = 0;
  for (let i = 1; i < data.length; i++) {
    const byte = data[i]!;
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) {
      components.push(value);
      value = 0;
    }
  }

  return components.join('.');
}

function asn1ToString(node: ASN1Node): string {
  return new TextDecoder().decode(node.value);
}

function parseInteger(node: ASN1Node): number {
  let value = 0;
  for (const byte of node.value) {
    value = (value << 8) | byte;
  }
  return value;
}

function parseDN(node: ASN1Node): string {
  if (!node.children) {
    return '';
  }

  const parts: string[] = [];
  for (const set of node.children) {
    if (!set.children) {
      continue;
    }

    for (const seq of set.children) {
      if (!seq.children || seq.children.length < 2) {
        continue;
      }

      const oid = decodeOID(seq.children[0]!.value);
      const name = OID_MAP[oid] || oid;
      const value = asn1ToString(seq.children[1]!);
      parts.push(`${name}=${value}`);
    }
  }

  return parts.join(', ');
}

function parseDNComponents(node: ASN1Node): Record<string, string> {
  const result: Record<string, string> = {};
  if (!node.children) {
    return result;
  }

  for (const set of node.children) {
    if (!set.children) {
      continue;
    }

    for (const seq of set.children) {
      if (!seq.children || seq.children.length < 2) {
        continue;
      }

      const oid = decodeOID(seq.children[0]!.value);
      result[OID_MAP[oid] || oid] = asn1ToString(seq.children[1]!);
    }
  }

  return result;
}

function bytesToHex(bytes: Uint8Array, separator: string = ':'): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(separator);
}

function getPublicKeySize(spki: ASN1Node): number | undefined {
  try {
    if (!spki.children || spki.children.length < 2) {
      return undefined;
    }

    const algorithmSequence = spki.children[0]!;
    const bitString = spki.children[1]!;

    if (algorithmSequence.children?.[1]?.tag === ASN1_OID) {
      const namedCurve = OID_MAP[decodeOID(algorithmSequence.children[1]!.value)];
      if (namedCurve && EC_CURVE_BITS[namedCurve]) {
        return EC_CURVE_BITS[namedCurve];
      }
    }

    if (bitString.tag !== ASN1_BIT_STRING) {
      return undefined;
    }

    const keyData = bitString.value.slice(1);
    const keySequence = parseASN1(keyData, 0);
    if (!keySequence.children || keySequence.children.length === 0) {
      return undefined;
    }

    const modulus = keySequence.children[0]!;
    let size = modulus.value.length;
    if (modulus.value[0] === 0) {
      size--;
    }
    return size * 8;
  } catch {
    return undefined;
  }
}

function parseSANs(data: Uint8Array): string[] {
  const sans: string[] = [];

  try {
    const node = parseASN1(data, 0);
    const sequenceData = node.tag === ASN1_OCTET_STRING ? node.value : data;
    const sequence = parseASN1(sequenceData, 0);

    if (!sequence.children) {
      return sans;
    }

    for (const child of sequence.children) {
      if (child.tag === 0x81 || child.tag === 0x82 || child.tag === 0x86) {
        sans.push(new TextDecoder().decode(child.value));
        continue;
      }

      if (child.tag === 0x87) {
        if (child.value.length === 4) {
          sans.push(Array.from(child.value).join('.'));
        } else if (child.value.length === 16) {
          const parts: string[] = [];
          for (let i = 0; i < 16; i += 2) {
            parts.push(((child.value[i]! << 8) | child.value[i + 1]!).toString(16));
          }
          sans.push(parts.join(':'));
        }
      }
    }
  } catch {
    return sans;
  }

  return sans;
}

function parseKeyUsage(data: Uint8Array): string[] {
  if (data.length === 0) {
    return [];
  }

  const node = parseASN1(data, 0);
  if (node.tag !== ASN1_BIT_STRING || node.value.length < 2) {
    return [];
  }

  const unusedBits = node.value[0]!;
  const usageBytes = node.value.slice(1);
  const usages: string[] = [];

  for (let byteIndex = 0; byteIndex < usageBytes.length; byteIndex++) {
    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      const totalBit = byteIndex * 8 + bitIndex;
      if (byteIndex === usageBytes.length - 1 && bitIndex >= 8 - unusedBits) {
        break;
      }

      if ((usageBytes[byteIndex]! >> (7 - bitIndex)) & 1) {
        if (totalBit < KEY_USAGE_BITS.length) {
          usages.push(KEY_USAGE_BITS[totalBit]!);
        }
      }
    }
  }

  return usages;
}

function parseExtKeyUsage(data: Uint8Array): string[] {
  try {
    const node = parseASN1(data, 0);
    const sequenceData = node.tag === ASN1_OCTET_STRING ? node.value : data;
    const sequence = parseASN1(sequenceData, 0);

    if (!sequence.children) {
      return [];
    }

    return sequence.children
      .filter((child) => child.tag === ASN1_OID)
      .map((child) => {
        const oid = decodeOID(child.value);
        return OID_MAP[oid] || oid;
      });
  } catch {
    return [];
  }
}

function parseBoolean(node: ASN1Node): boolean {
  return node.value.length > 0 && node.value[0] !== 0;
}

function formatNodeValue(node: ASN1Node): string {
  if (
    node.tag === ASN1_UTF8_STRING ||
    node.tag === ASN1_PRINTABLE_STRING ||
    node.tag === ASN1_IA5_STRING
  ) {
    return asn1ToString(node);
  }

  if (node.tag === ASN1_OID) {
    const oid = decodeOID(node.value);
    return OID_MAP[oid] || oid;
  }

  if (node.tag === ASN1_INTEGER) {
    return String(parseInteger(node));
  }

  if (node.tag === ASN1_BOOLEAN) {
    return parseBoolean(node) ? 'true' : 'false';
  }

  if (node.tag === ASN1_UTC_TIME || node.tag === ASN1_GENERALIZED_TIME) {
    return asn1ToString(node);
  }

  if (node.children && node.children.length > 0) {
    return node.children.map(formatNodeValue).join(', ');
  }

  return bytesToHex(node.value);
}

function parseExtensions(extensionNodes: ASN1Node[]): {
  extensions: CsrExtension[];
  sans: string[];
  keyUsage: string[];
  extKeyUsage: string[];
} {
  const extensions: CsrExtension[] = [];
  let sans: string[] = [];
  let keyUsage: string[] = [];
  let extKeyUsage: string[] = [];

  for (const extension of extensionNodes) {
    if (!extension.children || extension.children.length < 2) {
      continue;
    }

    const oid = decodeOID(extension.children[0]!.value);
    const name = OID_MAP[oid] || oid;
    let critical = false;
    let valueNodeIndex = 1;

    if (extension.children[1]!.tag === ASN1_BOOLEAN) {
      critical = parseBoolean(extension.children[1]!);
      valueNodeIndex = 2;
    }

    const valueNode = extension.children[valueNodeIndex];
    if (!valueNode) {
      continue;
    }

    let values: string[] = [];
    if (name === 'subjectAltName') {
      sans = parseSANs(valueNode.value);
      values = sans;
    } else if (name === 'keyUsage') {
      keyUsage = parseKeyUsage(valueNode.value);
      values = keyUsage;
    } else if (name === 'extKeyUsage') {
      extKeyUsage = parseExtKeyUsage(valueNode.value);
      values = extKeyUsage;
    } else {
      try {
        const parsedValue = parseASN1(valueNode.value, 0);
        values = parsedValue.children?.map(formatNodeValue).filter(Boolean) || [formatNodeValue(parsedValue)];
      } catch {
        values = [bytesToHex(valueNode.value)];
      }
    }

    extensions.push({
      oid,
      name,
      critical,
      values,
    });
  }

  return { extensions, sans, keyUsage, extKeyUsage };
}

async function computeFingerprint(derBytes: Uint8Array, algorithm: string): Promise<string> {
  const hash = await crypto.subtle.digest(algorithm, derBytes as unknown as BufferSource);
  return bytesToHex(new Uint8Array(hash));
}

function derToPemCsr(der: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...der));
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.substring(i, i + 64));
  }
  return `-----BEGIN CERTIFICATE REQUEST-----\n${lines.join('\n')}\n-----END CERTIFICATE REQUEST-----`;
}

function extractPemCsr(input: string): string | null {
  const match = input.match(
    /-----BEGIN (?:NEW )?CERTIFICATE REQUEST-----[\s\S]*?-----END (?:NEW )?CERTIFICATE REQUEST-----/
  );
  return match?.[0] || null;
}

export async function parseCsr(derBytes: Uint8Array, pemInput?: string): Promise<CertificateSigningRequest> {
  const root = parseASN1(derBytes, 0);
  if (!root.children || root.children.length < 3) {
    throw new Error('Invalid CSR structure');
  }

  const certificationRequestInfo = root.children[0]!;
  const signatureAlgorithmNode = root.children[1]!;

  if (!certificationRequestInfo.children || certificationRequestInfo.children.length < 3) {
    throw new Error('Invalid CertificationRequestInfo structure');
  }

  const versionNode = certificationRequestInfo.children[0]!;
  const subjectNode = certificationRequestInfo.children[1]!;
  const publicKeyInfoNode = certificationRequestInfo.children[2]!;

  const version = parseInteger(versionNode);
  const subject = parseDN(subjectNode);
  const subjectComponents = parseDNComponents(subjectNode);

  let publicKeyAlgorithm = 'Unknown';
  let publicKeyCurve: string | undefined;
  if (publicKeyInfoNode.children?.[0]?.children?.[0]?.tag === ASN1_OID) {
    const algorithmOid = decodeOID(publicKeyInfoNode.children[0]!.children![0]!.value);
    publicKeyAlgorithm = OID_MAP[algorithmOid] || algorithmOid;
    if (publicKeyInfoNode.children[0]!.children?.[1]?.tag === ASN1_OID) {
      const curveOid = decodeOID(publicKeyInfoNode.children[0]!.children![1]!.value);
      publicKeyCurve = OID_MAP[curveOid] || curveOid;
    }
  }
  const publicKeySize = getPublicKeySize(publicKeyInfoNode);

  let signatureAlgorithm = 'Unknown';
  if (signatureAlgorithmNode.children?.[0]?.tag === ASN1_OID) {
    const signatureOid = decodeOID(signatureAlgorithmNode.children[0]!.value);
    signatureAlgorithm = OID_MAP[signatureOid] || signatureOid;
  }

  const attributes: CsrAttribute[] = [];
  const attributeNodes = certificationRequestInfo.children.find((child) => child.tag === 0xa0)?.children || [];
  let challengePassword: string | undefined;
  let extensions: CsrExtension[] = [];
  let sans: string[] = [];
  let keyUsage: string[] = [];
  let extKeyUsage: string[] = [];

  for (const attribute of attributeNodes) {
    if (!attribute.children || attribute.children.length < 2) {
      continue;
    }

    const oid = decodeOID(attribute.children[0]!.value);
    const name = OID_MAP[oid] || oid;
    const setNode = attribute.children[1]!;
    const valueNodes = setNode.children || [];

    if (name === 'challengePassword' && valueNodes[0]) {
      challengePassword = formatNodeValue(valueNodes[0]!);
    }

    if (name === 'extensionRequest' && valueNodes[0]?.children) {
      const parsed = parseExtensions(valueNodes[0]!.children!);
      extensions = parsed.extensions;
      sans = parsed.sans;
      keyUsage = parsed.keyUsage;
      extKeyUsage = parsed.extKeyUsage;
    }

    const values = valueNodes.map((node) => {
      if (name === 'extensionRequest' && node.children) {
        return `${node.children.length} requested extension${node.children.length === 1 ? '' : 's'}`;
      }
      return formatNodeValue(node);
    });

    attributes.push({
      oid,
      name,
      values,
    });
  }

  const [sha1Fingerprint, sha256Fingerprint] = await Promise.all([
    computeFingerprint(derBytes, 'SHA-1'),
    computeFingerprint(derBytes, 'SHA-256'),
  ]);

  return {
    subject,
    subjectComponents,
    version,
    signatureAlgorithm,
    publicKeyAlgorithm,
    publicKeySize,
    publicKeyCurve,
    sans,
    keyUsage,
    extKeyUsage,
    challengePassword,
    attributes,
    extensions,
    sha1Fingerprint,
    sha256Fingerprint,
    pem: pemInput || derToPemCsr(derBytes),
    derBase64: btoa(String.fromCharCode(...derBytes)),
  };
}

export async function inspectCsr(
  input: string
): Promise<{ success: boolean; data?: CertificateSigningRequest; error?: string }> {
  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, error: 'Input is empty' };
    }

    if (trimmed.includes('-----BEGIN')) {
      const pem = extractPemCsr(trimmed);
      if (!pem) {
        return { success: false, error: 'No valid PEM CSR found in input.' };
      }

      const derBytes = pemToDer(pem);
      const csr = await parseCsr(derBytes, pem);
      return { success: true, data: csr };
    }

    try {
      const binary = atob(trimmed.replace(/\s/g, ''));
      const derBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        derBytes[i] = binary.charCodeAt(i);
      }

      const csr = await parseCsr(derBytes);
      return { success: true, data: csr };
    } catch {
      return {
        success: false,
        error: 'Unable to parse input. Accepted formats: PEM CSR or Base64 DER PKCS#10.',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to inspect CSR',
    };
  }
}

export const SAMPLE_CSR = `-----BEGIN CERTIFICATE REQUEST-----
MIIDhTCCAm0CAQAwgaAxCzAJBgNVBAYTAlVTMREwDwYDVQQIDAhOZXcgWW9yazER
MA8GA1UEBwwITmV3IFlvcmsxFjAUBgNVBAoMDWRldmVsb3BlcnMuZG8xETAPBgNV
BAsMCFNlY3VyaXR5MR4wHAYDVQQDDBVleGFtcGxlLmRldmVsb3BlcnMuZG8xIDAe
BgkqhkiG9w0BCQEWEWRldkBkZXZlbG9wZXJzLmRvMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAli90IJWoexUz3YRFeMhwm7XvTKy31rYmdT7xDi0IcZvp
UinEEw9YmW3/p06FGiyPGT0aUTTEQs1HaXGSr9MPRN8cuFZmiktAIXLVbudx9DmY
d1VjwyyePsVfZhRIWCY+eJKWK63K3pDOXTNWzRoxqoSUAMTHCLIMWeczI3V8jy5X
i59xAcINd+huDCtbfHTCVPjTsPhSctXI7cyUVK+roqsiRSWDGS+g+o5dP1kNlNQJ
kFMtlE/xGxP4C+5mb858mtlWBDRv41rTN+DtSL0LXKFGfkNHRhfmavtDC8cmOoM0
/GBIYruxFRuHWkZycoqg59vK2vHQpbRtNcQjL7ntuwIDAQABoIGeMIGbBgkqhkiG
9w0BCQ4xgY0wgYowXAYDVR0RBFUwU4IVZXhhbXBsZS5kZXZlbG9wZXJzLmRvghFh
cGkuZGV2ZWxvcGVycy5kb4YnaHR0cHM6Ly9kZXZlbG9wZXJzLmRvL3Rvb2xzL2Nz
ci1kZWNvZGVyMAsGA1UdDwQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYB
BQUHAwIwDQYJKoZIhvcNAQELBQADggEBAEjuZtg+lC4N0g1eSI56ODwqGCNxMmQ3
48A4aj7Ad/baHwBKQfOyzJb6VY51kVhQ+Zln1LL55gZeGgybMvdB3wuY0hKpxEnw
uqh+5x4hD1riJNBKfTK3Z9EytRA7xPDIUALXqjuovRX4GXC90Scy/AkOD65U6aD5
xCfC+5TjhAqElAbtQS4xjAYz230/8ugEk6yb3zShx7n619XobO5apv1kGGy52yVu
iuUK6RigGaPZNhAlxtBbUQwObpo9hZ+OqXLKtjbW5zAXNPC6mhYZ7lZBgq2OVjEp
0zMEyHusWsJO1IrGXaHSYaJkJekMqLCbVppxW1O92BVT5QVAuKIg3X4=
-----END CERTIFICATE REQUEST-----`;
