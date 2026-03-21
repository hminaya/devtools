export type Base = 2 | 8 | 10 | 16;

export interface BaseConversionResult {
  decimal: string;
  binary: string;
  octal: string;
  hex: string;
  twosComplement8: string | null;
  twosComplement16: string | null;
  twosComplement32: string;
  bitCount: number;
  isNegative: boolean;
  error?: string;
}

const VALID_CHARS: Record<Base, RegExp> = {
  2:  /^-?[01]+$/,
  8:  /^-?[0-7]+$/,
  10: /^-?\d+$/,
  16: /^-?[0-9a-fA-F]+$/,
};

export function convertBase(input: string, fromBase: Base): BaseConversionResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      decimal: '', binary: '', octal: '', hex: '',
      twosComplement8: null, twosComplement16: null, twosComplement32: '',
      bitCount: 0, isNegative: false,
    };
  }

  if (!VALID_CHARS[fromBase].test(trimmed)) {
    return {
      decimal: '', binary: '', octal: '', hex: '',
      twosComplement8: null, twosComplement16: null, twosComplement32: '',
      bitCount: 0, isNegative: false,
      error: `Invalid characters for base ${fromBase}`,
    };
  }

  try {
    const isNegative = trimmed.startsWith('-');
    const absStr = isNegative ? trimmed.slice(1) : trimmed;

    // Parse using BigInt for precision
    let value: bigint;
    switch (fromBase) {
      case 2:  value = BigInt('0b' + absStr); break;
      case 8:  value = BigInt('0o' + absStr); break;
      case 16: value = BigInt('0x' + absStr); break;
      default: value = BigInt(absStr);
    }
    if (isNegative) value = -value;

    const absValue = value < 0n ? -value : value;

    const binary  = (isNegative ? '-' : '') + absValue.toString(2);
    const octal   = (isNegative ? '-' : '') + absValue.toString(8);
    const decimal = value.toString(10);
    const hex     = (isNegative ? '-' : '') + absValue.toString(16).toUpperCase();

    const bitCount = absValue === 0n ? 1 : absValue.toString(2).length;

    const twosComplement8  = getTwosComplement(value, 8);
    const twosComplement16 = getTwosComplement(value, 16);
    const twosComplement32 = getTwosComplement(value, 32) ?? formatTwosComplement(value, 32);

    return {
      decimal,
      binary,
      octal,
      hex,
      twosComplement8,
      twosComplement16,
      twosComplement32,
      bitCount,
      isNegative,
    };
  } catch (e) {
    return {
      decimal: '', binary: '', octal: '', hex: '',
      twosComplement8: null, twosComplement16: null, twosComplement32: '',
      bitCount: 0, isNegative: false,
      error: (e as Error).message,
    };
  }
}

function getTwosComplement(value: bigint, bits: 8 | 16 | 32): string | null {
  const min = -(1n << BigInt(bits - 1));
  const max = (1n << BigInt(bits - 1)) - 1n;
  if (value < min || value > max) return null;
  return formatTwosComplement(value, bits);
}

function formatTwosComplement(value: bigint, bits: number): string {
  const mod = 1n << BigInt(bits);
  const unsigned = ((value % mod) + mod) % mod;
  return unsigned.toString(2).padStart(bits, '0');
}

export function getValidCharsHint(base: Base): string {
  switch (base) {
    case 2:  return 'Only 0 and 1 allowed';
    case 8:  return 'Digits 0–7 allowed';
    case 10: return 'Digits 0–9 allowed';
    case 16: return 'Digits 0–9 and A–F allowed';
  }
}

export const BASE_LABELS: Record<Base, string> = {
  2:  'BIN',
  8:  'OCT',
  10: 'DEC',
  16: 'HEX',
};

export const BASE_NAMES: Record<Base, string> = {
  2:  'Binary',
  8:  'Octal',
  10: 'Decimal',
  16: 'Hexadecimal',
};

export const SAMPLE_VALUES: { label: string; value: string; base: Base }[] = [
  { label: '255 (decimal)', value: '255', base: 10 },
  { label: 'FF (hex)', value: 'FF', base: 16 },
  { label: '11111111 (binary)', value: '11111111', base: 2 },
  { label: '-128 (signed)', value: '-128', base: 10 },
  { label: 'DEADBEEF (hex)', value: 'DEADBEEF', base: 16 },
];
