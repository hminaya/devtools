import { useId } from 'react';

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
  rows?: number;
  className?: string;
}

function TextArea({
  value,
  onChange,
  label,
  placeholder,
  readOnly = false,
  error,
  rows = 10,
  className = '',
}: TextAreaProps) {
  const generatedId = useId();

  return (
    <div className="flex flex-col gap-2">
      {label && <label htmlFor={generatedId} className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</label>}
      <textarea
        id={generatedId}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        className={`w-full resize-y rounded-xl border px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-300'
        } ${readOnly ? 'bg-slate-50' : 'bg-white'} ${className}`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

export default TextArea;
