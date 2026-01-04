// File size conversion utilities

// SI Units (Decimal, base 10)
export type SIUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

// IEC Units (Binary, base 2)
export type IECUnit = 'B' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB';

// All units combined
export type FileSizeUnit = SIUnit | IECUnit;

export interface FileSizeConversions {
  decimal: {
    bytes: string;
    kilobytes: string;
    megabytes: string;
    gigabytes: string;
    terabytes: string;
    petabytes: string;
  };
  binary: {
    bytes: string;
    kibibytes: string;
    mebibytes: string;
    gibibytes: string;
    tebibytes: string;
    pebibytes: string;
  };
}

// SI unit multipliers (base 10)
const SI_MULTIPLIERS: Record<SIUnit, number> = {
  B: 1,
  KB: 1000,
  MB: 1000 ** 2,
  GB: 1000 ** 3,
  TB: 1000 ** 4,
  PB: 1000 ** 5,
};

// IEC unit multipliers (base 2)
const IEC_MULTIPLIERS: Record<IECUnit, number> = {
  B: 1,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
  TiB: 1024 ** 4,
  PiB: 1024 ** 5,
};

/**
 * Convert a file size value to bytes
 */
export function toBytes(value: number, unit: FileSizeUnit): number {
  if (unit in SI_MULTIPLIERS) {
    return value * SI_MULTIPLIERS[unit as SIUnit];
  }
  return value * IEC_MULTIPLIERS[unit as IECUnit];
}

/**
 * Format a number with appropriate precision
 */
function formatNumber(num: number): string {
  // If the number is very small or very large, use scientific notation
  if (num !== 0 && (Math.abs(num) < 0.000001 || Math.abs(num) >= 1e15)) {
    return num.toExponential(6);
  }

  // For integers or numbers with minimal decimals, show up to 2 decimal places
  if (num === Math.floor(num)) {
    return num.toString();
  }

  // For decimals, show up to 6 significant figures
  const str = num.toPrecision(6);
  // Remove trailing zeros after decimal point
  return parseFloat(str).toString();
}

/**
 * Convert file size to all units
 */
export function convertFileSize(
  value: number,
  fromUnit: FileSizeUnit
): FileSizeConversions {
  const bytes = toBytes(value, fromUnit);

  return {
    decimal: {
      bytes: formatNumber(bytes / SI_MULTIPLIERS.B),
      kilobytes: formatNumber(bytes / SI_MULTIPLIERS.KB),
      megabytes: formatNumber(bytes / SI_MULTIPLIERS.MB),
      gigabytes: formatNumber(bytes / SI_MULTIPLIERS.GB),
      terabytes: formatNumber(bytes / SI_MULTIPLIERS.TB),
      petabytes: formatNumber(bytes / SI_MULTIPLIERS.PB),
    },
    binary: {
      bytes: formatNumber(bytes / IEC_MULTIPLIERS.B),
      kibibytes: formatNumber(bytes / IEC_MULTIPLIERS.KiB),
      mebibytes: formatNumber(bytes / IEC_MULTIPLIERS.MiB),
      gibibytes: formatNumber(bytes / IEC_MULTIPLIERS.GiB),
      tebibytes: formatNumber(bytes / IEC_MULTIPLIERS.TiB),
      pebibytes: formatNumber(bytes / IEC_MULTIPLIERS.PiB),
    },
  };
}

/**
 * Get all available units with their display names
 */
export function getAllUnits(): Array<{ value: FileSizeUnit; label: string; type: 'SI' | 'IEC' }> {
  return [
    // SI Units (Decimal)
    { value: 'B', label: 'Bytes (B)', type: 'SI' },
    { value: 'KB', label: 'Kilobytes (KB)', type: 'SI' },
    { value: 'MB', label: 'Megabytes (MB)', type: 'SI' },
    { value: 'GB', label: 'Gigabytes (GB)', type: 'SI' },
    { value: 'TB', label: 'Terabytes (TB)', type: 'SI' },
    { value: 'PB', label: 'Petabytes (PB)', type: 'SI' },
    // IEC Units (Binary)
    { value: 'KiB', label: 'Kibibytes (KiB)', type: 'IEC' },
    { value: 'MiB', label: 'Mebibytes (MiB)', type: 'IEC' },
    { value: 'GiB', label: 'Gibibytes (GiB)', type: 'IEC' },
    { value: 'TiB', label: 'Tebibytes (TiB)', type: 'IEC' },
    { value: 'PiB', label: 'Pebibytes (PiB)', type: 'IEC' },
  ];
}
