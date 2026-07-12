import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('xml', markup);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('yaml', yaml);

interface CodeDisplayProps {
  code: string;
  language: string;
  label?: string;
  showLineNumbers?: boolean;
}

function CodeDisplay({ code, language, label, showLineNumbers = false }: CodeDisplayProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</span>}
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
        {language === 'text' ? (
          <pre className="m-0 max-h-[720px] overflow-auto whitespace-pre-wrap break-words bg-white p-4 font-mono text-sm leading-6 text-slate-900">
            {code || ''}
          </pre>
        ) : (
          <SyntaxHighlighter
            language={language}
            style={oneLight}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              maxHeight: '720px',
              overflowY: 'auto',
              background: 'white',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              },
            }}
          >
            {code || ''}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}

export default CodeDisplay;
