interface LogoProps {
  size?: number;
  className?: string;
}

function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#2563EB" />
      <path
        d="M9 10.5 14.5 16 9 21.5"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 21.5h6" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}

export default Logo;
