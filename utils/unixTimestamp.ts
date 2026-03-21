export interface HumanResult {
  iso8601: string;
  utcString: string;
  formatted: string;      // e.g. "Saturday, March 15, 2025"
  time: string;           // e.g. "14:30:00"
  dayOfWeek: string;
  relative: string;       // e.g. "3 days ago"
  detectedUnit: 'seconds' | 'milliseconds';
  epochSeconds: string;
  epochMilliseconds: string;
}

export interface EpochResult {
  seconds: string;
  milliseconds: string;
}

export type Unit = 'auto' | 'seconds' | 'milliseconds';

/**
 * If the number looks like it's in milliseconds (>= year 2001 in ms), treat as ms.
 * Threshold: 10^12 (which is year 2001-09-08 in ms ≈ year 33658 in seconds).
 */
export function detectUnit(value: string): 'seconds' | 'milliseconds' {
  const n = parseFloat(value);
  return Math.abs(n) >= 1e12 ? 'milliseconds' : 'seconds';
}

export function epochToHuman(
  epochStr: string,
  unit: Unit,
  timezone: string
): HumanResult | { error: string } {
  const raw = parseFloat(epochStr);
  if (isNaN(raw)) return { error: 'Invalid number' };

  const detectedUnit = unit === 'auto' ? detectUnit(epochStr) : unit;
  const ms = detectedUnit === 'milliseconds' ? raw : raw * 1000;
  const date = new Date(ms);

  if (!isFinite(date.getTime())) return { error: 'Timestamp out of range' };

  try {
    const tzOptions: Intl.DateTimeFormatOptions = { timeZone: timezone };

    const iso8601 = date.toISOString();
    const utcString = date.toUTCString();

    const formatted = new Intl.DateTimeFormat('en-US', {
      ...tzOptions,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }).format(date);

    const time = new Intl.DateTimeFormat('en-US', {
      ...tzOptions,
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(date);

    const dayOfWeek = new Intl.DateTimeFormat('en-US', { ...tzOptions, weekday: 'long' }).format(date);

    const relative = getRelativeTime(ms);

    return {
      iso8601,
      utcString,
      formatted,
      time,
      dayOfWeek,
      relative,
      detectedUnit,
      epochSeconds: Math.floor(ms / 1000).toString(),
      epochMilliseconds: Math.floor(ms).toString(),
    };
  } catch {
    return { error: `Invalid timezone: ${timezone}` };
  }
}

export function humanToEpoch(dateStr: string): EpochResult | { error: string } {
  const trimmed = dateStr.trim();
  if (!trimmed) return { error: 'Empty input' };

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    return { error: 'Cannot parse date. Try ISO 8601 format: 2024-03-15T14:30:00Z' };
  }

  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000).toString(),
    milliseconds: ms.toString(),
  };
}

export function getCurrentEpoch(): { seconds: number; milliseconds: number } {
  const ms = Date.now();
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}

export function getRelativeTime(ms: number): string {
  const diffMs = ms - Date.now();
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs > 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const weeks   = Math.floor(days / 7);
  const months  = Math.floor(days / 30.44);
  const years   = Math.floor(days / 365.25);

  let label: string;
  if (seconds < 5)       label = 'just now';
  else if (seconds < 60) label = `${seconds} second${seconds !== 1 ? 's' : ''}`;
  else if (minutes < 60) label = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  else if (hours < 24)   label = `${hours} hour${hours !== 1 ? 's' : ''}`;
  else if (days < 7)     label = `${days} day${days !== 1 ? 's' : ''}`;
  else if (weeks < 5)    label = `${weeks} week${weeks !== 1 ? 's' : ''}`;
  else if (months < 12)  label = `${months} month${months !== 1 ? 's' : ''}`;
  else                   label = `${years} year${years !== 1 ? 's' : ''}`;

  if (label === 'just now') return label;
  return isFuture ? `in ${label}` : `${label} ago`;
}

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];
