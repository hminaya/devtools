'use client';

import { usePathname } from 'next/navigation';
import { getToolActionFromLabel, getToolIdFromPath, trackToolEvent } from '../../utils/analytics';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

function Button({ label, onClick, variant = 'primary', disabled = false, type = 'button' }: ButtonProps) {
  const pathname = usePathname();
  const baseClasses = 'min-h-10 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:shadow-none';

  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:-translate-y-px hover:bg-blue-700 focus:ring-blue-100 disabled:bg-slate-300'
      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-100 disabled:bg-slate-100 disabled:text-slate-400';

  const handleClick = () => {
    const eventName = getToolActionFromLabel(label);

    if (eventName) {
      trackToolEvent(eventName, {
        tool_id: getToolIdFromPath(pathname),
        action: label,
      });
    }

    onClick?.();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      {label}
    </button>
  );
}

export default Button;
