export interface JsonResult {
  success: boolean;
  output?: string;
  error?: string;
  suggestion?: string;
  autoFixed?: boolean;
}

/**
 * Attempts to parse and format JSON, with auto-fix for common issues
 */
export function parseAndFormatJson(
  input: string,
  indent: number = 2,
  attemptAutoFix: boolean = true
): JsonResult {
  if (!input.trim()) {
    return {
      success: false,
      error: 'Input is empty',
    };
  }

  // First, try to parse normally
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, indent);
    return {
      success: true,
      output: formatted,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';

    // If auto-fix is enabled, try to fix common issues
    if (attemptAutoFix) {
      const fixResult = tryAutoFixJson(input, indent);
      if (fixResult.success) {
        return {
          ...fixResult,
          autoFixed: true,
          suggestion: 'Auto-fixed: Added quotes around unquoted property names',
        };
      }
    }

    // Provide helpful error messages for common issues
    const helpfulError = getHelpfulErrorMessage(input, errorMessage);
    return {
      success: false,
      error: helpfulError.error,
      suggestion: helpfulError.suggestion,
    };
  }
}

/**
 * Attempts to fix common JSON issues like unquoted property names
 */
function tryAutoFixJson(input: string, indent: number): JsonResult {
  try {
    // Fix unquoted property names
    // This regex finds patterns like: word: (unquoted key followed by colon)
    // and replaces with: "word":
    let fixed = input.replace(
      /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
      '$1"$2":'
    );

    // Try parsing the fixed version
    const parsed = JSON.parse(fixed);
    const formatted = JSON.stringify(parsed, null, indent);

    return {
      success: true,
      output: formatted,
    };
  } catch {
    return {
      success: false,
    };
  }
}

/**
 * Provides helpful error messages based on the error type
 */
function getHelpfulErrorMessage(
  input: string,
  originalError: string
): { error: string; suggestion?: string } {
  // Check for unquoted property names
  if (
    originalError.includes('Expected property name') ||
    originalError.includes('Unexpected token')
  ) {
    // Look for patterns like: id: or name: (unquoted keys)
    const unquotedKeyPattern = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/;
    if (unquotedKeyPattern.test(input)) {
      return {
        error: originalError,
        suggestion:
          'Your input looks like a JavaScript object. In JSON, property names must be in double quotes. Example: {"id": "value"} instead of {id: "value"}',
      };
    }
  }

  // Check for single quotes
  if (input.includes("'")) {
    return {
      error: originalError,
      suggestion:
        'JSON requires double quotes (") for strings, not single quotes (\').',
    };
  }

  // Check for trailing commas
  if (/,\s*[}\]]/.test(input)) {
    return {
      error: originalError,
      suggestion: 'JSON does not allow trailing commas before closing braces or brackets.',
    };
  }

  // Check for comments
  if (input.includes('//') || input.includes('/*')) {
    return {
      error: originalError,
      suggestion: 'JSON does not support comments. Remove all // or /* */ comments.',
    };
  }

  // Default: return original error
  return {
    error: originalError,
  };
}

/**
 * Minifies JSON by removing all whitespace
 */
export function minifyJson(input: string): JsonResult {
  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    return {
      success: true,
      output: minified,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
    const helpfulError = getHelpfulErrorMessage(input, errorMessage);
    return {
      success: false,
      error: helpfulError.error,
      suggestion: helpfulError.suggestion,
    };
  }
}
