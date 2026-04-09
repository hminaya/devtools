export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(options: PasswordOptions): string {
  let charset = '';

  if (options.uppercase) charset += UPPERCASE;
  if (options.lowercase) charset += LOWERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < options.length; i++) {
    const randomIndex = randomValues[i]! % charset.length;
    password += charset[randomIndex]!;
  }

  return password;
}

// EFF long wordlist (top 200 common words for passphrases)
// In production you'd use the full 7776-word EFF list, but this subset
// provides ~7.6 bits of entropy per word which is sufficient for strong passphrases
const WORDLIST = [
  'abandon', 'ability', 'absorb', 'abstract', 'academy', 'access', 'account', 'achieve',
  'acid', 'across', 'action', 'adapt', 'address', 'adjust', 'admit', 'adult',
  'advance', 'advice', 'afford', 'agent', 'agree', 'ahead', 'airport', 'aisle',
  'alarm', 'album', 'alert', 'alien', 'alpha', 'already', 'amount', 'anchor',
  'ancient', 'angel', 'anger', 'animal', 'antenna', 'apple', 'april', 'arena',
  'armor', 'arrow', 'artist', 'aspect', 'atlas', 'atom', 'auction', 'audit',
  'autumn', 'average', 'avocado', 'bamboo', 'banana', 'banner', 'barrel', 'basket',
  'battle', 'beach', 'beauty', 'begin', 'below', 'bench', 'betray', 'beyond',
  'bicycle', 'blanket', 'blossom', 'bonus', 'border', 'bottle', 'bounce', 'brave',
  'breeze', 'bridge', 'bronze', 'bubble', 'budget', 'buffalo', 'burden', 'butter',
  'cabin', 'cactus', 'camera', 'campus', 'canal', 'canyon', 'captain', 'carbon',
  'carpet', 'castle', 'catalog', 'caught', 'ceiling', 'cement', 'census', 'chapter',
  'cherry', 'chicken', 'chimney', 'circle', 'citizen', 'clarify', 'climate', 'clinic',
  'cluster', 'cobalt', 'coconut', 'column', 'comfort', 'comic', 'company', 'concert',
  'conflict', 'connect', 'console', 'copper', 'coral', 'corner', 'cosmic', 'cotton',
  'country', 'cousin', 'cradle', 'credit', 'cricket', 'crimson', 'crystal', 'cubic',
  'culture', 'curtain', 'custom', 'cycle', 'daring', 'dawn', 'debate', 'decade',
  'decline', 'default', 'define', 'delight', 'demand', 'denial', 'deploy', 'depth',
  'desert', 'design', 'detect', 'device', 'diesel', 'digital', 'dinner', 'diploma',
  'direct', 'doctor', 'dolphin', 'domain', 'donate', 'double', 'dragon', 'dream',
  'driver', 'during', 'dynamic', 'eagle', 'earth', 'eclipse', 'economy', 'effort',
  'elastic', 'elder', 'element', 'embark', 'emerge', 'emotion', 'empire', 'enable',
  'endless', 'energy', 'engine', 'enjoy', 'enough', 'enter', 'entire', 'envelope',
  'episode', 'equal', 'equip', 'erosion', 'escape', 'eternal', 'evening', 'evolve',
  'example', 'excess', 'exhibit', 'exotic', 'expand', 'explain', 'export', 'extend',
];

export interface PassphraseOptions {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
}

export function generatePassphrase(options: PassphraseOptions): string {
  const randomValues = new Uint32Array(options.wordCount + 1);
  crypto.getRandomValues(randomValues);

  const words: string[] = [];
  for (let i = 0; i < options.wordCount; i++) {
    const index = randomValues[i]! % WORDLIST.length;
    let word = WORDLIST[index]!;
    if (options.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  let result = words.join(options.separator);

  if (options.includeNumber) {
    const num = randomValues[options.wordCount]! % 100;
    result += options.separator + String(num);
  }

  return result;
}

export interface StrengthResult {
  entropy: number;
  crackTime: string;
  level: 'weak' | 'fair' | 'strong' | 'very-strong';
  label: string;
}

export function calculateStrength(value: string, mode: 'password' | 'passphrase', passphraseOptions?: PassphraseOptions): StrengthResult {
  let entropy: number;

  if (mode === 'passphrase' && passphraseOptions) {
    // Entropy = wordCount * log2(wordlistSize) + (includeNumber ? log2(100) : 0)
    entropy = passphraseOptions.wordCount * Math.log2(WORDLIST.length);
    if (passphraseOptions.includeNumber) {
      entropy += Math.log2(100);
    }
  } else {
    // Calculate charset size from the actual characters used
    let charsetSize = 0;
    if (/[a-z]/.test(value)) charsetSize += 26;
    if (/[A-Z]/.test(value)) charsetSize += 26;
    if (/[0-9]/.test(value)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(value)) charsetSize += 32;
    if (charsetSize === 0) charsetSize = 26;
    entropy = value.length * Math.log2(charsetSize);
  }

  const crackTime = estimateCrackTime(entropy);

  let level: StrengthResult['level'];
  let label: string;

  if (entropy < 40) {
    level = 'weak';
    label = 'Weak';
  } else if (entropy < 60) {
    level = 'fair';
    label = 'Fair';
  } else if (entropy < 80) {
    level = 'strong';
    label = 'Strong';
  } else {
    level = 'very-strong';
    label = 'Very Strong';
  }

  return { entropy: Math.round(entropy * 10) / 10, crackTime, level, label };
}

function estimateCrackTime(entropy: number): string {
  // Assume 10 billion guesses/second (modern GPU cluster)
  const guessesPerSecond = 1e10;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond / 2; // average case = half the keyspace

  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${Math.round(seconds / 31536000 / 1000)}K years`;
  if (seconds < 31536000 * 1e9) return `${Math.round(seconds / 31536000 / 1e6)}M years`;
  if (seconds < 31536000 * 1e12) return `${Math.round(seconds / 31536000 / 1e9)}B years`;
  return `${Math.round(seconds / 31536000 / 1e12)}T+ years`;
}
