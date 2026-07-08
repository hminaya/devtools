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
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed'
      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed';

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
