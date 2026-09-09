export function ConnectionErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-error-icon-height w-error-icon-width text-foreground"
      fill="none"
      viewBox="0 0 140 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="82" rx="7" stroke="currentColor" strokeWidth="2" width="126" x="7" y="7" />
      <path
        d="M70 89v17M45 113h50M54 106h32"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="48" cy="40" fill="currentColor" r="2.5" />
      <circle cx="92" cy="40" fill="currentColor" r="2.5" />
      <path
        d="M48 65c6-7 13-10 22-10s16 3 22 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
