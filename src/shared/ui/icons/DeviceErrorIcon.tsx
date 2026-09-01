export function DeviceErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-device-error-icon-height w-device-error-icon-width text-foreground"
      fill="none"
      viewBox="0 0 112 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="62" rx="6" stroke="currentColor" strokeWidth="1.5" width="98" x="7" y="7" />
      <circle cx="40" cy="34" fill="currentColor" r="2.5" />
      <circle cx="72" cy="34" fill="currentColor" r="2.5" />
      <path
        d="M40 52c4.5-4.5 9.8-6.75 16-6.75S67.5 47.5 72 52"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="m47 69-6 14m24-14 6 14M34 83h44"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
