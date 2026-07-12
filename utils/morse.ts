/**
 * Morse code (ITU-R M.1677-1) translator.
 *
 * Supports:
 *   - Encode: letters, digits, common punctuation, and a few procedural signals
 *     (SOS = ...---... as a special case is NOT done automatically — sentinels
 *     read each char individually; users typing SOS get three dots, three dashes,
 *     three dots concatenated since the standard does not encode digraphs).
 *   - Decode: letters separated by single space; words by ' / '
 *     Tolerates extra whitespace.
 */

const LETTERS_TO_MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.',
};

const MORSE_TO_LETTERS: Record<string, string> = Object.fromEntries(
  Object.entries(LETTERS_TO_MORSE).map(([k, v]) => [v, k]),
);

export function encodeMorse(input: string): string {
  return input
    .toUpperCase()
    .split(/\s+/)              // words separated by whitespace become word breaks
    .filter((w) => w.length > 0)
    .map((word) =>
      word
        .split('')
        .map((ch) => LETTERS_TO_MORSE[ch] ?? '')   // unknown chars dropped
        .filter((m) => m.length > 0)
        .join(' ')                                  // letters separated by space
    )
    .filter((w) => w.length > 0)
    .join(' / ');                                   // words separated by ' / '
}

export function decodeMorse(input: string): string {
  const cleaned = input.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  // Words separated by ' / ' (or by 3+ spaces). Letters within a word by single space.
  const words = cleaned.split(/\s+\/\s+|\s{3,}/);
  return words
    .map((word) =>
      word
        .split(' ')
        .map((letter) => MORSE_TO_LETTERS[letter] ?? '')
        .join('')
    )
    .join(' ');
}

export const MORSE_REFERENCE = Object.entries(LETTERS_TO_MORSE).map(([k, v]) => ({ char: k, morse: v }));