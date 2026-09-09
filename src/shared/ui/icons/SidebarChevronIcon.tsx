interface SidebarChevronIconProps {
  className?: string;
}

export function SidebarChevronIcon({ className }: SidebarChevronIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 7.41 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m7.41 1.41-1.41-1.41-6 6 6 6 1.41-1.41-4.59-4.59z" fill="currentColor" />
    </svg>
  );
}
