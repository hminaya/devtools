/**
 * String case conversion utilities.
 * Supports: camelCase, PascalCase, snake_case, kebab-case,CONSTANT_CASE,
 * dot.case, path/case, lower, upper, title, sentence, reverse.
 */

export type CaseName =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'dot'
  | 'path'
  | 'lower'
  | 'upper'
  | 'title'
  | 'sentence';

export const CASE_OPTIONS: { value: CaseName; label: string; example: string }[] = [
  { value: 'camel',    label: 'camelCase',         example: 'myVariableName' },
  { value: 'pascal',   label: 'PascalCase',        example: 'MyVariableName' },
  { value: 'snake',    label: 'snake_case',        example: 'my_variable_name' },
  { value: 'kebab',    label: 'kebab-case',        example: 'my-variable-name' },
  { value: 'constant', label: 'CONSTANT_CASE',     example: 'MY_VARIABLE_NAME' },
  { value: 'dot',      label: 'dot.case',          example: 'my.variable.name' },
  { value: 'path',     label: 'path/case',        example: 'my/variable/name' },
  { value: 'lower',    label: 'lower case',        example: 'my variable name' },
  { value: 'upper',    label: 'UPPER CASE',        example: 'MY VARIABLE NAME' },
  { value: 'title',    label: 'Title Case',        example: 'My Variable Name' },
  { value: 'sentence', label: 'Sentence case',    example: 'My variable name' },
];

// Split a string into word tokens using a robust set of conventions:
// - whitespace
// - underscores, dashes, dots, slashes
// - camelCase / PascalCase boundaries
// - numbers adjacent to letters
function splitWords(input: string): string[] {
  // Insert space at case transitions and boundary chars, then split.
  const spaced = input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')     // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')  // ALLCapsWord -> ALL Caps Word
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2')     // letter -> number
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')     // number -> letter
    .replace(/[_\-./\\]+/g, ' ');               // separators -> space
  return spaced.split(/\s+/).map((w) => w.trim()).filter((w) => w.length > 0);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function toCase(input: string, target: CaseName): string {
  if (!input) return '';
  const words = splitWords(input);
  if (words.length === 0) return '';

  switch (target) {
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : capitalize(w)).join('');
    case 'pascal':
      return words.map(capitalize).join('');
    case 'snake':
      return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'constant':
      return words.map((w) => w.toUpperCase()).join('_');
    case 'dot':
      return words.map((w) => w.toLowerCase()).join('.');
    case 'path':
      return words.map((w) => w.toLowerCase()).join('/');
    case 'lower':
      return words.map((w) => w.toLowerCase()).join(' ');
    case 'upper':
      return words.map((w) => w.toUpperCase()).join(' ');
    case 'title':
      return words.map(capitalize).join(' ');
    case 'sentence':
      return words.map((w, i) => i === 0 ? capitalize(w) : w.toLowerCase()).join(' ');
    default:
      return input;
  }
}

export function toAllCases(input: string): Record<CaseName, string> {
  const cases: CaseName[] = ['camel', 'pascal', 'snake', 'kebab', 'constant', 'dot', 'path', 'lower', 'upper', 'title', 'sentence'];
  const result = {} as Record<CaseName, string>;
  for (const c of cases) {
    result[c] = toCase(input, c);
  }
  return result;
}