export interface TextStats {
  characters: number;          // total characters
  charactersNoSpaces: number;  // excluding any whitespace
  letters: number;             // [a-zA-Z]
  digits: number;              // [0-9]
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  nonEmptyLines: number;
  whitespaceChars: number;
  averageWordLength: number;
  averageSentenceLengthWords: number;
  readingTimeMinutes: number;  // 200 wpm
  longestWord: string;
}

const SENTENCE_END = /[.!?]+(\s|$)/;
const SENTENCE_BOUNDARY = /(?<=[.!?])\s+(?=[A-Z0-9"'(\[])/;

export function computeTextStats(text: string): TextStats {
  const characters = text.length;
  const whitespaceChars = (text.match(/\s/g)?.length) ?? 0;
  const charactersNoSpaces = characters - whitespaceChars;
  const letters = (text.match(/[a-zA-Z]/g)?.length) ?? 0;
  const digits = (text.match(/[0-9]/g)?.length) ?? 0;

  const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
  const nonEmptyLines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0).length;

  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;

  // Words: runs of word characters (incl. apostrophes/hyphens within words).
  const wordMatches = text.match(/[A-Za-z0-9]+(?:['\-’][A-Za-z0-9]+)*/g) ?? [];
  const words = wordMatches.length;
  const wordLengthSum = wordMatches.reduce((sum, w) => sum + w.length, 0);
  const averageWordLength = words > 0 ? wordLengthSum / words : 0;
  const longestWord = wordMatches.reduce((best, w) => w.length > best.length ? w : best, '');

  // Sentences: split on terminal punctuation followed by space/next sentence.
  const trimmed = text.trim();
  const sentences = trimmed.length === 0 ? 0 : trimmed
    .split(SENTENCE_BOUNDARY)
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z0-9]/.test(s) && SENTENCE_END.test(s + ' ')).length;
  const adjustedSentences = Math.max(sentences, trimmed.length > 0 && words > 0 ? 1 : 0);
  const averageSentenceLengthWords = adjustedSentences > 0 ? words / adjustedSentences : 0;
  const readingTimeMinutes = words / 200;

  return {
    characters,
    charactersNoSpaces,
    letters,
    digits,
    words,
    sentences: adjustedSentences,
    paragraphs,
    lines,
    nonEmptyLines,
    whitespaceChars,
    averageWordLength,
    averageSentenceLengthWords,
    readingTimeMinutes,
    longestWord,
  };
}

export function formatReadingTime(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}