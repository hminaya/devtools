import { detectLanguage, type Language } from './stacktrace';

export interface FrameInfo {
  raw: string;
  functionName?: string;
  filePath?: string;
  lineNumber?: string;
  columnNumber?: string;
  isApplicationCode: boolean;
  isRootCause: boolean;
}

export interface ErrorExplanation {
  type: string;
  description: string;
  commonCauses: string[];
  suggestedFixes: string[];
}

export interface AnalysisResult {
  language: Language;
  errorType: string;
  errorMessage: string;
  explanation: ErrorExplanation | null;
  frames: FrameInfo[];
  rootCauseFrame: FrameInfo | null;
  totalFrames: number;
  applicationFrames: number;
  frameworkFrames: number;
}

const FRAMEWORK_PATTERNS: RegExp[] = [
  // Node.js internals
  /^node:/,
  /node:internal\//,
  /^internal\//,
  // JavaScript frameworks & libraries
  /node_modules\//,
  /react-dom/,
  /react\.development/,
  /react\.production/,
  /webpack/,
  /turbopack/,
  /next[\\/]dist/,
  // Python standard lib & frameworks
  /\/usr\/lib\/python/,
  /\/usr\/local\/lib\/python/,
  /site-packages\//,
  /dist-packages\//,
  /lib\/python\d/,
  /django\//,
  /flask\//,
  /celery\//,
  /gunicorn\//,
  // Java / JVM
  /^java\./,
  /^javax\./,
  /^sun\./,
  /^com\.sun\./,
  /^jdk\./,
  /^org\.springframework\./,
  /^org\.apache\./,
  /^org\.hibernate\./,
  /^io\.netty\./,
  /Native Method/,
  /Unknown Source/,
  // C# / .NET
  /^System\./,
  /^Microsoft\./,
  /^lambda_method/,
  // Go standard lib
  /^runtime\./,
  /^net\/http\./,
  /\/usr\/local\/go\/src\//,
  /^reflect\./,
  /^sync\./,
  // PHP
  /\{main\}/,
  /vendor\//,
  // Ruby
  /\/gems\//,
  /\/usr\/local\/bundle\//,
  /rubygems/,
  /active_support/,
  /action_controller/,
  /action_dispatch/,
  /activerecord/,
];

function isFrameworkCode(frame: string): boolean {
  return FRAMEWORK_PATTERNS.some(p => p.test(frame));
}

const ERROR_EXPLANATIONS: Record<string, ErrorExplanation> = {
  // JavaScript
  'TypeError': {
    type: 'TypeError',
    description: 'A value was used in a way that is incompatible with its type. This often happens when accessing properties on null or undefined.',
    commonCauses: [
      'Accessing a property on null or undefined (e.g., obj.property when obj is null)',
      'Calling a non-function value as a function',
      'Passing wrong argument types to a function',
      'Missing data from an API response',
    ],
    suggestedFixes: [
      'Add null/undefined checks before accessing properties (optional chaining: obj?.property)',
      'Verify API responses contain expected data before using them',
      'Use TypeScript or runtime type validation',
      'Check that variables are initialized before use',
    ],
  },
  'ReferenceError': {
    type: 'ReferenceError',
    description: 'A variable was referenced that does not exist in the current scope.',
    commonCauses: [
      'Misspelled variable or function name',
      'Using a variable before it is declared',
      'Missing import or require statement',
      'Variable defined in a different scope',
    ],
    suggestedFixes: [
      'Check spelling of the variable name',
      'Ensure the variable is declared with let, const, or var before use',
      'Add the missing import statement',
      'Use strict mode to catch these errors earlier',
    ],
  },
  'SyntaxError': {
    type: 'SyntaxError',
    description: 'The code contains a syntax error and could not be parsed.',
    commonCauses: [
      'Missing or extra brackets, braces, or parentheses',
      'Unexpected token (e.g., serving HTML instead of JS)',
      'Invalid JSON being parsed',
      'Using newer syntax not supported by the runtime',
    ],
    suggestedFixes: [
      'Check for matching brackets and braces',
      'Validate JSON data before parsing with JSON.parse()',
      'Ensure your bundler/transpiler supports the syntax used',
      'Check that API responses return expected content types',
    ],
  },
  'RangeError': {
    type: 'RangeError',
    description: 'A numeric value is out of its allowed range, or a recursive function exceeded the call stack.',
    commonCauses: [
      'Infinite recursion (Maximum call stack size exceeded)',
      'Invalid array length (negative or too large)',
      'Number formatting with invalid precision',
      'Passing out-of-range values to typed arrays',
    ],
    suggestedFixes: [
      'Add a base case to recursive functions',
      'Convert recursive algorithms to iterative ones',
      'Validate numeric inputs before using them',
      'Check for circular references in data structures',
    ],
  },
  // Python
  'ValueError': {
    type: 'ValueError',
    description: 'A function received an argument of the correct type but with an inappropriate value.',
    commonCauses: [
      'Passing a string to int() that is not a valid number',
      'Invalid arguments to date/time constructors',
      'Empty sequence passed to a function expecting elements',
      'Invalid format strings',
    ],
    suggestedFixes: [
      'Validate input values before passing them to functions',
      'Use try/except to handle conversion errors',
      'Add input validation at the entry points of your application',
      'Provide default values for optional parameters',
    ],
  },
  'KeyError': {
    type: 'KeyError',
    description: 'A dictionary was accessed with a key that does not exist.',
    commonCauses: [
      'Accessing a dict key that was never set',
      'Typo in the key name',
      'Missing data from API response or config',
      'Key removed or renamed elsewhere in code',
    ],
    suggestedFixes: [
      'Use dict.get(key, default) instead of dict[key]',
      'Check if key exists with "if key in dict"',
      'Use collections.defaultdict for auto-initializing dicts',
      'Validate API responses match expected schema',
    ],
  },
  'AttributeError': {
    type: 'AttributeError',
    description: 'An object does not have the attribute or method being accessed. Often means the object is None when it should not be.',
    commonCauses: [
      'Calling a method on None (NoneType has no attribute X)',
      'Misspelled attribute or method name',
      'Using the wrong type of object',
      'Forgetting to return a value from a function',
    ],
    suggestedFixes: [
      'Check for None before accessing attributes',
      'Verify the function returns the expected type',
      'Use hasattr() to check if an attribute exists',
      'Review function signatures and return types',
    ],
  },
  'ImportError': {
    type: 'ImportError',
    description: 'A module or name could not be imported.',
    commonCauses: [
      'Package not installed in the environment',
      'Circular imports between modules',
      'Typo in the module or name being imported',
      'Virtual environment not activated',
    ],
    suggestedFixes: [
      'Install the missing package: pip install <package>',
      'Check your virtual environment is activated',
      'Resolve circular imports by restructuring code',
      'Verify the module path is correct',
    ],
  },
  'ModuleNotFoundError': {
    type: 'ModuleNotFoundError',
    description: 'A module could not be found. This is a subclass of ImportError.',
    commonCauses: [
      'Package not installed (missing from requirements.txt)',
      'Wrong Python version or virtual environment',
      'Module name typo',
      'Running from wrong directory',
    ],
    suggestedFixes: [
      'Install the package: pip install <package>',
      'Add the package to requirements.txt or pyproject.toml',
      'Verify you are using the correct virtual environment',
      'Check your PYTHONPATH includes the module directory',
    ],
  },
  // Java
  'NullPointerException': {
    type: 'NullPointerException',
    description: 'A method was called or a field was accessed on a null reference.',
    commonCauses: [
      'Calling a method on an uninitialized object',
      'Returning null from a method and not checking the result',
      'Auto-unboxing a null wrapper type (e.g., null Integer to int)',
      'Accessing elements of a null array or collection',
    ],
    suggestedFixes: [
      'Add null checks before accessing objects',
      'Use Optional<T> to represent nullable values',
      'Initialize fields in constructors',
      'Use @NonNull/@Nullable annotations',
    ],
  },
  'ArrayIndexOutOfBoundsException': {
    type: 'ArrayIndexOutOfBoundsException',
    description: 'An array was accessed with an index that is negative or greater than or equal to the array length.',
    commonCauses: [
      'Loop index goes past the array length',
      'Off-by-one error in index calculation',
      'Hardcoded index that exceeds array size',
      'Array is smaller than expected',
    ],
    suggestedFixes: [
      'Check array length before accessing: if (i < array.length)',
      'Use enhanced for-each loop when possible',
      'Validate index inputs at the boundary',
      'Use List<T> with bounds-checked .get() instead of raw arrays',
    ],
  },
  'ClassCastException': {
    type: 'ClassCastException',
    description: 'An object was cast to a type that it is not an instance of.',
    commonCauses: [
      'Incorrect type assumption in a generic collection',
      'Wrong cast after an instanceof check',
      'Incompatible class versions',
      'Deserialization returning unexpected types',
    ],
    suggestedFixes: [
      'Use instanceof before casting',
      'Use generics to ensure type safety at compile time',
      'Review type hierarchy and use proper interfaces',
      'Check serialization/deserialization compatibility',
    ],
  },
  'FileNotFoundException': {
    type: 'FileNotFoundException',
    description: 'An attempt to open a file at a specified path failed because the file does not exist.',
    commonCauses: [
      'File path is incorrect or uses wrong separators',
      'File was deleted or moved',
      'Insufficient permissions to access the file',
      'Running from a different working directory than expected',
    ],
    suggestedFixes: [
      'Verify the file exists before opening',
      'Use absolute paths or resolve paths relative to a known base',
      'Check file permissions',
      'Use ClassLoader.getResource() for bundled resources',
    ],
  },
  // C#
  'NullReferenceException': {
    type: 'NullReferenceException',
    description: 'An attempt was made to dereference a null object reference.',
    commonCauses: [
      'Accessing a member of a null object',
      'LINQ query returning null unexpectedly',
      'Uninitialized dependency or service',
      'Missing configuration or environment variable',
    ],
    suggestedFixes: [
      'Use null-conditional operator: obj?.Property',
      'Enable nullable reference types in your project',
      'Add null checks or use the null-coalescing operator (??)',
      'Verify dependency injection is configured correctly',
    ],
  },
  'ArgumentNullException': {
    type: 'ArgumentNullException',
    description: 'A null value was passed to a method that does not accept it as a valid argument.',
    commonCauses: [
      'Passing null to a method that requires a non-null parameter',
      'Missing required form or request data',
      'Uninitialized variable passed as argument',
      'Null returned from a service or repository',
    ],
    suggestedFixes: [
      'Validate arguments at the start of methods',
      'Use ArgumentNullException.ThrowIfNull() guard',
      'Check for null before passing values to methods',
      'Provide default values where appropriate',
    ],
  },
  'InvalidOperationException': {
    type: 'InvalidOperationException',
    description: 'A method call is invalid for the current state of the object.',
    commonCauses: [
      'Calling .First() on an empty sequence',
      'Modifying a collection while iterating over it',
      'Using a disposed object',
      'Invalid state transitions',
    ],
    suggestedFixes: [
      'Use .FirstOrDefault() instead of .First()',
      'Check if the sequence has elements before calling .First() or .Single()',
      'Use .Any() to verify a collection is not empty',
      'Ensure proper lifecycle management of disposable objects',
    ],
  },
  // Go
  'panic': {
    type: 'panic',
    description: 'The program encountered an unrecoverable error and panicked. Go panics crash the goroutine unless recovered.',
    commonCauses: [
      'Nil pointer dereference',
      'Index out of range on a slice or array',
      'Type assertion failure on an interface',
      'Concurrent map read/write without synchronization',
    ],
    suggestedFixes: [
      'Check for nil before dereferencing pointers',
      'Validate slice/array bounds before accessing',
      'Use the comma-ok idiom for type assertions: v, ok := i.(Type)',
      'Use sync.RWMutex or sync.Map for concurrent map access',
    ],
  },
  // PHP
  'Uncaught TypeError': {
    type: 'Uncaught TypeError',
    description: 'A value did not match the expected type in a type-hinted parameter or return type.',
    commonCauses: [
      'Passing wrong argument type to a type-hinted function',
      'Returning wrong type from a function with return type declaration',
      'Null passed where a non-nullable type was expected',
      'String passed where int was expected (strict_types)',
    ],
    suggestedFixes: [
      'Check argument types before passing to functions',
      'Use nullable types (?Type) where null is valid',
      'Enable strict_types at the top of PHP files',
      'Add input validation at controller boundaries',
    ],
  },
  // Ruby
  'NoMethodError': {
    type: 'NoMethodError',
    description: 'A method was called on an object that does not define it. Often the object is nil.',
    commonCauses: [
      'Calling a method on nil (undefined method for nil:NilClass)',
      'Misspelled method name',
      'Missing include or require',
      'Using wrong class or module',
    ],
    suggestedFixes: [
      'Use the safe navigation operator: obj&.method',
      'Check for nil with .nil? or .present? before calling',
      'Verify the object is the expected type with .is_a?',
      'Check method name spelling and availability',
    ],
  },
  'ActiveRecord::RecordNotFound': {
    type: 'ActiveRecord::RecordNotFound',
    description: 'A database record could not be found with the given ID or conditions.',
    commonCauses: [
      'Using .find() with an ID that does not exist',
      'Record was deleted between lookup and access',
      'Wrong ID passed from URL parameters',
      'Accessing data across wrong tenants or scopes',
    ],
    suggestedFixes: [
      'Use .find_by() which returns nil instead of raising',
      'Rescue ActiveRecord::RecordNotFound and return 404',
      'Validate IDs before querying',
      'Add proper scoping to queries',
    ],
  },
};

function extractErrorInfo(trace: string, language: Language): { type: string; message: string } {
  const lines = trace.trim().split('\n');

  if (language === 'python') {
    // Python errors are at the end
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]!.trim();
      const match = line.match(/^(\w+(?:\.\w+)*(?:Error|Exception|Warning))\s*:\s*(.*)$/);
      if (match) return { type: match[1]!, message: match[2] || '' };
      // ModuleNotFoundError, etc
      const match2 = line.match(/^(ModuleNotFoundError|ImportError|KeyError|ValueError|AttributeError|IndexError|OSError|IOError|RuntimeError|StopIteration|StopAsyncIteration|ArithmeticError|LookupError|SyntaxError|IndentationError|TabError|SystemError|TypeError|AssertionError|EOFError|NameError|UnboundLocalError|RecursionError|NotImplementedError|PermissionError|FileNotFoundError|FileExistsError|IsADirectoryError|ConnectionError|TimeoutError|UnicodeError|UnicodeDecodeError|UnicodeEncodeError|sqlite3\.\w+Error|psycopg2\.\w+Error)\s*:\s*(.*)$/);
      if (match2) return { type: match2[1]!, message: match2[2] || '' };
    }
  }

  if (language === 'go') {
    const firstLine = lines[0]?.trim() || '';
    const panicMatch = firstLine.match(/^(panic|fatal error):\s*(.*)$/);
    if (panicMatch) return { type: 'panic', message: panicMatch[2] || '' };
  }

  // JS, Java, C#, PHP, Ruby - error is usually on the first line
  for (const line of lines) {
    const trimmed = line.trim();

    // Java - qualified exceptions
    const javaMatch = trimmed.match(/^(?:Exception in thread ".*?"\s+)?(\w+(?:\.\w+)*(?:Exception|Error))\s*:\s*(.*)$/);
    if (javaMatch) return { type: javaMatch[1]!.split('.').pop()!, message: javaMatch[2] || '' };

    // C# - System.* exceptions
    const csharpMatch = trimmed.match(/^(System\.(?:\w+\.)*\w+(?:Exception|Error))\s*:\s*(.*)$/);
    if (csharpMatch) return { type: csharpMatch[1]!.split('.').pop()!, message: csharpMatch[2] || '' };

    // JS - standard errors
    const jsMatch = trimmed.match(/^(TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|AggregateError|Error)\s*:\s*(.*)$/);
    if (jsMatch) return { type: jsMatch[1]!, message: jsMatch[2] || '' };

    // PHP
    const phpMatch = trimmed.match(/^PHP (?:Fatal error|Warning|Notice):\s+(?:Uncaught\s+)?(\w+(?:Error|Exception))\s*:\s*(.*)$/i);
    if (phpMatch) return { type: phpMatch[1]!, message: phpMatch[2] || '' };

    // Ruby - includes ActiveRecord etc
    const rubyMatch = trimmed.match(/^(\w+(?:::\w+)*(?:Error|Exception))\s*:\s*(.*)$/);
    if (rubyMatch) return { type: rubyMatch[1]!, message: rubyMatch[2] || '' };
  }

  return { type: 'Unknown Error', message: lines[0]?.trim() || '' };
}

function parseFrames(trace: string, language: Language): FrameInfo[] {
  const lines = trace.split('\n');
  const frames: FrameInfo[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let frame: Omit<FrameInfo, 'isApplicationCode' | 'isRootCause'> | null = null;

    if (language === 'javascript') {
      const match = trimmed.match(/^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/);
      if (match) {
        frame = { raw: trimmed, functionName: match[1], filePath: match[2], lineNumber: match[3], columnNumber: match[4] };
      } else {
        const altMatch = trimmed.match(/^\s*at\s+(.+?):(\d+):(\d+)$/);
        if (altMatch) {
          frame = { raw: trimmed, filePath: altMatch[1], lineNumber: altMatch[2], columnNumber: altMatch[3] };
        }
      }
    } else if (language === 'python') {
      const match = trimmed.match(/^File "(.+?)", line (\d+)(?:, in (.+))?$/);
      if (match) {
        frame = { raw: trimmed, filePath: match[1], lineNumber: match[2], functionName: match[3] };
      }
    } else if (language === 'java') {
      const match = trimmed.match(/^\s*at\s+([^(]+)\(([^:]+):(\d+)\)$/);
      if (match) {
        frame = { raw: trimmed, functionName: match[1], filePath: match[2], lineNumber: match[3] };
      } else {
        const nativeMatch = trimmed.match(/^\s*at\s+([^(]+)\((Native Method|Unknown Source)\)$/);
        if (nativeMatch) {
          frame = { raw: trimmed, functionName: nativeMatch[1], filePath: nativeMatch[2] };
        }
      }
    } else if (language === 'csharp') {
      const match = trimmed.match(/^\s*at\s+(.+?)\s+in\s+(.+?):(?:line\s+)?(\d+)$/);
      if (match) {
        frame = { raw: trimmed, functionName: match[1], filePath: match[2], lineNumber: match[3] };
      } else {
        const altMatch = trimmed.match(/^\s*at\s+(.+)$/);
        if (altMatch && !trimmed.match(/^at\s*$/)) {
          frame = { raw: trimmed, functionName: altMatch[1] };
        }
      }
    } else if (language === 'go') {
      const match = trimmed.match(/^(.+?)\(.*\)$/);
      if (match && !trimmed.startsWith('goroutine') && !trimmed.startsWith('[signal')) {
        frame = { raw: trimmed, functionName: match[1] };
      } else {
        const fileMatch = trimmed.match(/^\s*(.+?):(\d+)\s/);
        if (fileMatch) {
          frame = { raw: trimmed, filePath: fileMatch[1], lineNumber: fileMatch[2] };
          // Attach to previous frame if possible
          if (frames.length > 0 && !frames[frames.length - 1]!.filePath) {
            frames[frames.length - 1]!.filePath = fileMatch[1];
            frames[frames.length - 1]!.lineNumber = fileMatch[2];
            continue;
          }
        }
      }
    } else if (language === 'php') {
      const match = trimmed.match(/^#\d+\s+(.+?)\((\d+)\):\s*(.+)$/);
      if (match) {
        frame = { raw: trimmed, filePath: match[1], lineNumber: match[2], functionName: match[3] };
      } else {
        const altMatch = trimmed.match(/^#\d+\s+(.+?):(\d+)/);
        if (altMatch) {
          frame = { raw: trimmed, filePath: altMatch[1], lineNumber: altMatch[2] };
        }
      }
    } else if (language === 'ruby') {
      const match = trimmed.match(/^(?:from\s+)?(.+?):(\d+):in\s+[`'](.+?)'$/);
      if (match) {
        frame = { raw: trimmed, filePath: match[1], lineNumber: match[2], functionName: match[3] };
      } else {
        const altMatch = trimmed.match(/^(?:from\s+)?(.+?):(\d+)$/);
        if (altMatch) {
          frame = { raw: trimmed, filePath: altMatch[1], lineNumber: altMatch[2] };
        }
      }
    }

    if (frame) {
      const identifyString = [frame.functionName, frame.filePath].filter(Boolean).join(' ');
      const isApp = !isFrameworkCode(identifyString);
      frames.push({ ...frame, isApplicationCode: isApp, isRootCause: false });
    }
  }

  return frames;
}

export function analyzeStackTrace(trace: string): AnalysisResult {
  const language = detectLanguage(trace);
  const { type: errorType, message: errorMessage } = extractErrorInfo(trace, language);
  const frames = parseFrames(trace, language);

  // Find root cause: first application frame (for most languages)
  // For Python, the last application frame is the root cause (traceback is reversed)
  let rootCauseFrame: FrameInfo | null = null;
  if (language === 'python') {
    for (let i = frames.length - 1; i >= 0; i--) {
      if (frames[i]!.isApplicationCode) {
        frames[i]!.isRootCause = true;
        rootCauseFrame = frames[i]!;
        break;
      }
    }
  } else {
    for (const frame of frames) {
      if (frame.isApplicationCode) {
        frame.isRootCause = true;
        rootCauseFrame = frame;
        break;
      }
    }
  }

  // Look up explanation
  const explanation = ERROR_EXPLANATIONS[errorType] || null;

  return {
    language,
    errorType,
    errorMessage,
    explanation,
    frames,
    rootCauseFrame,
    totalFrames: frames.length,
    applicationFrames: frames.filter(f => f.isApplicationCode).length,
    frameworkFrames: frames.filter(f => !f.isApplicationCode).length,
  };
}
