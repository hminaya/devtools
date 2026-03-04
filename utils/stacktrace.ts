export type Language = 'javascript' | 'python' | 'java' | 'csharp' | 'go' | 'php' | 'ruby' | 'unknown';

export interface FormatOptions {
  language: Language;
  removeSensitiveData: boolean;
  showHighlighting: boolean;
}

export interface FormatResult {
  success: boolean;
  output?: string;
  error?: string;
  detectedLanguage?: Language;
}

export interface StacktraceLine {
  original: string;
  formatted: string;
  indent: number;
  isError: boolean;
  filePath?: string;
  lineNumber?: string;
  functionName?: string;
}

export interface HighlightedPart {
  text: string;
  type: 'error' | 'filePath' | 'lineNumber' | 'functionName' | 'normal';
}

type LanguagePatterns = {
  error: RegExp;
  frame: RegExp;
  frameAlternative?: RegExp;
  frameAlt?: RegExp;
  frameNative?: RegExp;
  frameUnknown?: RegExp;
  frameAlt2?: RegExp;
};

const LANGUAGE_PATTERNS: Record<string, LanguagePatterns> = {
  javascript: {
    error: /^(Error|TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|AggregateError):\s*/i,
    frame: /^\s+at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/,
    frameAlternative: /^\s+at\s+(.+?):(\d+):(\d+)$/,
  },
  python: {
    error: /^(Traceback \(most recent call last\):|.*Error:|.*Exception:)/i,
    frame: /^\s+File "(.+?)", line (\d+), in (.+)$/,
    frameAlt: /^\s+File "(.+?)", line (\d+)$/,
  },
  java: {
    error: /^(Exception|Error|Caused by:|Suppressed:)/i,
    frame: /^\s+at\s+([^(]+)\(([^:]+):(\d+)\)$/,
    frameNative: /^\s+at\s+([^(]+)\(Native Method\)$/,
    frameUnknown: /^\s+at\s+([^(]+)\(Unknown Source\)$/,
  },
  csharp: {
    error: /^(Exception|Error|at)/i,
    frame: /^\s+at\s+(.+?)\s+in\s+(.+?):line\s+(\d+)$/,
    frameAlt: /^\s+at\s+(.+?)\((.+?),\s*(\d+)\)$/,
  },
  go: {
    error: /^(panic:|fatal error:)/i,
    frame: /^(\S+?)\s+([^:]+):(\d+)/,
  },
  php: {
    error: /^(PHP (Fatal error|Warning|Notice)|Uncaught (Error|Exception|Throwable):)/i,
    frame: /^#\d+\s+(.+?)\((\d+):\s*(.+?)\)$/,
    frameAlt: /^#\d+\s+(.+?):(\d+)/,
  },
  ruby: {
    error: /^(.*Error|.*Exception|RuntimeError)/i,
    frame: /^\s+from\s+(.+?):(\d+):in\s+`(.+?)'$/,
    frameAlt: /^\s+from\s+(.+?):(\d+)$/,
  },
};

export function detectLanguage(trace: string): Language {
  const normalized = trace.trim();

  if (/Error|TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|AggregateError/i.test(normalized)) {
    if (/\s+at\s+/.test(normalized)) {
      return 'javascript';
    }
  }

  if (/Traceback \(most recent call last\):|File ".*", line \d+, in/.test(normalized)) {
    return 'python';
  }

  if (/Exception in thread|at\s+[\w.]+\(|Caused by:/i.test(normalized)) {
    return 'java';
  }

  if (/\s+in\s+.*:\s*line\s+\d+|at\s+.*\(.*:\d+\)/.test(normalized)) {
    return 'csharp';
  }

  if (/goroutine\s+\d+\s+\[running\]:|panic:/.test(normalized)) {
    return 'go';
  }

  if (/Stack trace:|#\d+\s+.*\(\d+:/.test(normalized)) {
    return 'php';
  }

  if (/from\s+.*:\d+:in\s+`/.test(normalized)) {
    return 'ruby';
  }

  return 'unknown';
}

export function formatStackTrace(trace: string, options: FormatOptions): FormatResult {
  if (!trace.trim()) {
    return {
      success: false,
      error: 'Input is empty',
    };
  }

  const language = options.language === 'unknown' ? detectLanguage(trace) : options.language;
  const lines = trace.split('\n');
  const processedLines: StacktraceLine[] = [];
  let currentIndent = 0;

  for (const line of lines) {
    const processed = processLine(line, language, currentIndent);
    processedLines.push(processed);

    if (processed.isError) {
      currentIndent = 0;
    } else if (processed.formatted.trim()) {
      currentIndent = 2;
    }
  }

  let output = processedLines
    .map(l => ' '.repeat(l.indent) + l.formatted)
    .join('\n');

  if (options.removeSensitiveData) {
    output = anonymizeStackTrace(output);
  }

  return {
    success: true,
    output,
    detectedLanguage: language,
  };
}

function processLine(line: string, language: Language, currentIndent: number): StacktraceLine {
  const trimmed = line.trim();

  if (!trimmed) {
    return {
      original: line,
      formatted: '',
      indent: 0,
      isError: false,
    };
  }

  const patterns = LANGUAGE_PATTERNS[language];

  if (patterns && patterns.error.test(trimmed)) {
    return {
      original: line,
      formatted: trimmed,
      indent: 0,
      isError: true,
    };
  }

  let filePath: string | undefined;
  let lineNumber: string | undefined;
  let functionName: string | undefined;

  if (patterns && patterns.frame) {
    const match = trimmed.match(patterns.frame);
    if (match && match[1] && match[2] && match[3]) {
      functionName = match[1];
      filePath = match[2];
      lineNumber = match[3];
    } else if (patterns.frameAlternative) {
      const altMatch = trimmed.match(patterns.frameAlternative);
      if (altMatch && altMatch[1] && altMatch[2] && altMatch[3]) {
        functionName = altMatch[1];
        filePath = altMatch[2];
        lineNumber = altMatch[3];
      }
    }
  }

  return {
    original: line,
    formatted: trimmed,
    indent: currentIndent || 0,
    isError: false,
    filePath,
    lineNumber,
    functionName,
  };
}

export function anonymizeStackTrace(trace: string): string {
  return trace
    .replace(/\/[Uu]sers\/[^\/]+/g, '...')
    .replace(/\/home\/[^\/]+/g, '~')
    .replace(/\/Users\/[^\/]+/g, '...')
    .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\...')
    .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\...')
    .replace(/\/private\/var\/folders\/[^\/]+/g, '...')
    .replace(/C:\\Documents and Settings\\[^\\]+/g, 'C:\\Documents and Settings\\...');
}

export function highlightStackTrace(trace: string, language: Language): HighlightedPart[] {
  const lines = trace.split('\n');
  const result: HighlightedPart[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed) {
      result.push({ text: line, type: 'normal' });
      continue;
    }

    const patterns = LANGUAGE_PATTERNS[language];

    if (patterns?.error.test(trimmed)) {
      const errorMatch = trimmed.match(/^(Error|TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|AggregateError|Exception|Traceback|panic|Fatal|PHP (?:Fatal error|Warning|Notice)|Uncaught Error):(.*)/i);

      if (errorMatch && errorMatch[0]) {
        const prefixLength = errorMatch[0].length - (errorMatch[2] || '').length;
        result.push({ text: line.substring(0, prefixLength), type: 'error' });
        result.push({ text: errorMatch[2] || '', type: 'normal' });
        if (i < lines.length - 1) {
          result.push({ text: '\n', type: 'normal' });
        }
        continue;
      }

      result.push({ text: line, type: 'error' });
    } else if (patterns?.frame) {
      let remaining = line;

      if (patterns.frame.test(trimmed)) {
        const match = trimmed.match(patterns.frame);
        if (match) {
          const indent = line.substring(0, line.indexOf(trimmed));
          result.push({ text: indent, type: 'normal' });

          const functionNameMatch = trimmed.match(/^(\s+at\s+)(.+?)\s+/);
          if (functionNameMatch && functionNameMatch[1] && functionNameMatch[2]) {
            result.push({ text: functionNameMatch[1], type: 'normal' });
            result.push({ text: functionNameMatch[2], type: 'functionName' });
            remaining = trimmed.substring(functionNameMatch[0].length);
          }

          const filePathMatch = remaining.match(/^\((.+?):(\d+):\d+\)$/);
          if (filePathMatch && filePathMatch[1] && filePathMatch[2]) {
            result.push({ text: '(', type: 'normal' });
            result.push({ text: filePathMatch[1], type: 'filePath' });
            result.push({ text: ':', type: 'normal' });
            result.push({ text: filePathMatch[2], type: 'lineNumber' });
            result.push({ text: remaining.substring(filePathMatch[0].length), type: 'normal' });
          } else {
            result.push({ text: remaining, type: 'normal' });
          }
        }
      } else {
        result.push({ text: line, type: 'normal' });
      }
    } else {
      result.push({ text: line, type: 'normal' });
    }

    if (i < lines.length - 1) {
      result.push({ text: '\n', type: 'normal' });
    }
  }

  return result;
}

const SAMPLES: Record<Language, string[]> = {
  javascript: [
    `Error: User not found
    at Object.getUser (/app/src/services/userService.js:45:12)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at async /app/src/controllers/userController.js:23:18
    at async /app/src/middleware/auth.js:15:22`,

    `TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (/app/src/components/ProductList.jsx:18:32)
    at renderWithHooks (/app/node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (/app/node_modules/react-dom/cjs/react-dom.development.js:17811:13)
    at beginWork (/app/node_modules/react-dom/cjs/react-dom.development.js:19049:16)
    at HTMLUnknownElement.callCallback (/app/node_modules/react-dom/cjs/react-dom.development.js:3945:14)`,

    `RangeError: Maximum call stack size exceeded
    at flatten (/app/src/utils/arrayUtils.js:12:18)
    at flatten (/app/src/utils/arrayUtils.js:14:10)
    at flatten (/app/src/utils/arrayUtils.js:14:10)
    at flatten (/app/src/utils/arrayUtils.js:14:10)
    at Object.<anonymous> (/app/src/index.js:8:1)`,

    `SyntaxError: Unexpected token '<'
    at wrapSafe (node:internal/modules/cjs/loader:1383:18)
    at Module._compile (node:internal/modules/cjs/loader:1412:20)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1551:10)
    at Module.load (node:internal/modules/cjs/loader:1282:32)
    at Function.Module._load (node:internal/modules/cjs/loader:1098:12)`,
  ],

  python: [
    `Traceback (most recent call last):
  File "/app/main.py", line 42, in <module>
    user = get_user(user_id)
  File "/app/services/user_service.py", line 28, in get_user
    raise ValueError("User not found")
ValueError: User not found`,

    `Traceback (most recent call last):
  File "/app/api/views.py", line 67, in post
    result = self.serializer.save()
  File "/app/serializers/order_serializer.py", line 34, in save
    total = sum(item.price for item in self.validated_data['items'])
  File "/app/serializers/order_serializer.py", line 34, in <genexpr>
    total = sum(item.price for item in self.validated_data['items'])
AttributeError: 'NoneType' object has no attribute 'price'`,

    `Traceback (most recent call last):
  File "/app/worker.py", line 15, in <module>
    from tasks.email import send_welcome_email
  File "/app/tasks/email.py", line 3, in <module>
    import boto3
ModuleNotFoundError: No module named 'boto3'`,

    `Traceback (most recent call last):
  File "/app/scripts/migrate.py", line 52, in run_migration
    conn.execute(sql)
  File "/usr/local/lib/python3.11/sqlite3/__init__.py", line 57, in execute
    return self._execute(sql, parameters)
sqlite3.OperationalError: table "users" already exists`,
  ],

  java: [
    `Exception in thread "main" java.lang.NullPointerException
    at com.example.UserService.getUserById(UserService.java:45)
    at com.example.Main.main(Main.java:23)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
Caused by: java.lang.IllegalArgumentException: Invalid user ID
    at com.example.UserService.validateId(UserService.java:32)`,

    `Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 3
    at com.example.DataProcessor.processChunk(DataProcessor.java:78)
    at com.example.DataProcessor.process(DataProcessor.java:45)
    at com.example.BatchJob.run(BatchJob.java:22)
    at org.springframework.batch.core.step.tasklet.TaskletStep$ChunkTransactionCallback.doInTransaction(TaskletStep.java:407)
    at org.springframework.transaction.support.TransactionTemplate.execute(TransactionTemplate.java:140)`,

    `org.springframework.web.bind.MissingServletRequestParameterException: Required request parameter 'userId' for method parameter type Long is not present
    at org.springframework.web.method.annotation.RequestParamMethodArgumentResolver.handleMissingValueInternal(RequestParamMethodArgumentResolver.java:212)
    at org.springframework.web.method.annotation.AbstractNamedValueMethodArgumentResolver.handleMissingValue(AbstractNamedValueMethodArgumentResolver.java:185)
    at com.example.api.UserController.getProfile(UserController.java:55)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)`,

    `java.io.FileNotFoundException: /var/data/config.json (No such file or directory)
    at java.io.FileInputStream.open0(Native Method)
    at java.io.FileInputStream.open(FileInputStream.java:195)
    at java.io.FileInputStream.<init>(FileInputStream.java:138)
    at com.example.config.ConfigLoader.load(ConfigLoader.java:31)
    at com.example.Application.main(Application.java:14)`,
  ],

  csharp: [
    `System.NullReferenceException: Object reference not set to an instance of an object.
   at UserService.GetUserById(Int32 userId) in C:\\Projects\\App\\Services\\UserService.cs:45
   at Program.Main(String[] args) in C:\\Projects\\App\\Program.cs:23
   at Program.<Main>(String[] args)`,

    `System.ArgumentNullException: Value cannot be null. (Parameter 'email')
   at App.Services.EmailService.SendWelcome(String email, String name) in C:\\Projects\\App\\Services\\EmailService.cs:28
   at App.Controllers.AuthController.Register(RegisterRequest request) in C:\\Projects\\App\\Controllers\\AuthController.cs:62
   at lambda_method(Closure, Object, Object[])
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.SyncObjectResultExecutor.Execute(IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)`,

    `System.Net.Http.HttpRequestException: Response status code does not indicate success: 404 (Not Found).
   at System.Net.Http.HttpResponseMessage.EnsureSuccessStatusCode()
   at App.Services.PaymentGateway.ChargeAsync(Decimal amount, String token) in C:\\Projects\\App\\Services\\PaymentGateway.cs:74
   at App.Services.OrderService.PlaceOrderAsync(Order order) in C:\\Projects\\App\\Services\\OrderService.cs:112
   at App.Controllers.OrderController.Checkout(CheckoutRequest request) in C:\\Projects\\App\\Controllers\\OrderController.cs:89`,

    `System.InvalidOperationException: Sequence contains no elements
   at System.Linq.ThrowHelper.ThrowNoElementsException()
   at System.Linq.Enumerable.First[TSource](IEnumerable\`1 source)
   at App.Repositories.ProductRepository.GetFeatured() in C:\\Projects\\App\\Repositories\\ProductRepository.cs:56
   at App.Services.HomeService.GetHomePage() in C:\\Projects\\App\\Services\\HomeService.cs:33`,
  ],

  go: [
    `panic: runtime error: invalid memory address or nil pointer dereference

[signal SIGSEGV: segmentation violation code=0x1 addr=0x8 pc=0x45a3b2]

goroutine 1 [running]:
main.GetUserById(0x0, 0x0)
    /app/main.go:45 +0x52
main.main()
    /app/main.go:23 +0x4a`,

    `panic: runtime error: index out of range [3] with length 3

goroutine 7 [running]:
main.processItems(...)
    /app/handlers/items.go:62 +0x1a8
net/http.HandlerFunc.ServeHTTP(0x1234560, {0x13b5f80?, 0xc000108000}, 0xc000104500)
    /usr/local/go/src/net/http/server.go:2122 +0x28
net/http.(*ServeMux).ServeHTTP(0xc000080040, {0x13b5f80, 0xc000108000}, 0xc000104500)
    /usr/local/go/src/net/http/server.go:2500 +0x149`,

    `panic: interface conversion: interface {} is string, not int

goroutine 1 [running]:
main.parseConfig(0xc00001a100, {0xc000014050, 0x4})
    /app/config/parser.go:38 +0x123
main.loadSettings()
    /app/config/settings.go:21 +0x8b
main.main()
    /app/main.go:15 +0x31`,

    `fatal error: concurrent map read and map write

goroutine 18 [running]:
runtime.throw2({0x5c3e4a?, 0x0?})
    /usr/local/go/src/runtime/panic.go:1077 +0x5c
runtime.mapaccess1_faststr(0xc000100000, {0xc00002a040, 0x5})
    /usr/local/go/src/runtime/map_faststr.go:28 +0x286
main.cacheHandler.func1()
    /app/handlers/cache.go:44 +0x91`,
  ],

  php: [
    `PHP Fatal error:  Uncaught TypeError: Argument 1 passed to UserService::getUserById() must be of the type int, string given
Stack trace:
#0 /app/index.php(23): UserService->getUserById('invalid')
#1 {main}
  thrown in /app/services/UserService.php on line 45`,

    `PHP Fatal error:  Uncaught Error: Call to undefined method Database::fetchOne()
Stack trace:
#0 /app/repositories/OrderRepository.php(34): Database->fetchOne('SELECT * FROM o...')
#1 /app/services/OrderService.php(58): OrderRepository->findById(42)
#2 /app/controllers/OrderController.php(91): OrderService->getOrder(42)
#3 /app/index.php(12): OrderController->show()
#4 {main}
  thrown in /app/repositories/OrderRepository.php on line 34`,

    `PHP Notice:  Undefined variable: userId
PHP Warning:  Division by zero in /app/src/Calculator.php on line 17
Stack trace:
#0 /app/src/ReportGenerator.php(44): Calculator->computeAverage(Array)
#1 /app/src/ReportController.php(29): ReportGenerator->generate()
#2 /app/public/index.php(8): ReportController->run()`,

    `PHP Fatal error:  Uncaught PDOException: SQLSTATE[42S02]: Base table or view not found: 1146 Table 'mydb.sessions' doesn't exist
Stack trace:
#0 /app/src/SessionHandler.php(22): PDOStatement->execute()
#1 /app/src/Middleware/Auth.php(38): SessionHandler->get('abc123')
#2 /app/src/Router.php(74): Auth->handle(Object(Request))
#3 /app/public/index.php(15): Router->dispatch()
#4 {main}
  thrown in /app/src/SessionHandler.php on line 22`,
  ],

  ruby: [
    `RuntimeError: User not found
    from /app/services/user_service.rb:28:in 'get_user'
    from /app/controllers/user_controller.rb:23:in 'show'
    from /app/middleware/auth.rb:15:in 'authenticate'`,

    `NoMethodError: undefined method 'full_name' for nil:NilClass
    from /app/app/views/orders/show.html.erb:14:in '_app_views_orders_show_html_erb___3456789'
    from /app/app/controllers/orders_controller.rb:42:in 'show'
    from /usr/local/bundle/gems/actionpack-7.0.4/lib/action_controller/metal/basic_implicit_render.rb:6:in 'send_action'
    from /usr/local/bundle/gems/actionpack-7.0.4/lib/abstract_controller/base.rb:215:in 'process_action'`,

    `ArgumentError: wrong number of arguments (given 3, expected 1..2)
    from /app/lib/mailer/notification_mailer.rb:19:in 'send_digest'
    from /app/app/jobs/digest_job.rb:12:in 'perform'
    from /usr/local/bundle/gems/activejob-7.0.4/lib/active_job/execution.rb:37:in 'block in perform_now'
    from /usr/local/bundle/gems/activesupport-7.0.4/lib/active_support/callbacks.rb:118:in 'block in run_callbacks'`,

    `ActiveRecord::RecordNotFound: Couldn't find Product with 'id'=99999
    from /usr/local/bundle/gems/activerecord-7.0.4/lib/active_record/core.rb:289:in 'find'
    from /app/app/controllers/products_controller.rb:55:in 'set_product'
    from /usr/local/bundle/gems/activesupport-7.0.4/lib/active_support/callbacks.rb:453:in 'run_callbacks'
    from /app/app/controllers/products_controller.rb:1:in '<class:ProductsController>'`,
  ],

  unknown: [
    `Error: Unknown error occurred
    at unknown location
    caused by: something went wrong`,
  ],
};

export function generateSampleTrace(language: Language, index?: number): string {
  const langSamples = SAMPLES[language] || SAMPLES.javascript;
  if (index !== undefined) {
    return langSamples[index % langSamples.length] ?? langSamples[0] ?? '';
  }
  return langSamples[0] ?? '';
}

export function getSampleCount(language: Language): number {
  return (SAMPLES[language] || SAMPLES.javascript).length;
}

export function validateStackTrace(trace: string): { isValid: boolean; error?: string; suggestion?: string } {
  if (!trace.trim()) {
    return {
      isValid: false,
      error: 'Input is empty',
      suggestion: 'Please paste a stack trace to format',
    };
  }

  const language = detectLanguage(trace);

  if (language === 'unknown') {
    return {
      isValid: false,
      error: 'Could not detect stack trace format',
      suggestion: 'The input does not match known stack trace patterns. Supported languages: JavaScript, Python, Java, C#, Go, PHP, Ruby',
    };
  }

  return {
    isValid: true,
  };
}

export function getLanguageName(language: Language): string {
  const names: Record<Language, string> = {
    javascript: 'JavaScript/Node.js',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    go: 'Go',
    php: 'PHP',
    ruby: 'Ruby',
    unknown: 'Unknown',
  };

  return names[language];
}
