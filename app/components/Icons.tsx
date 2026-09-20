/**
 * 1px-stroke line icons. All are decorative — the buttons that contain them
 * carry the accessible label.
 */

type IconProps = {className?: string};

const base = 'h-[18px] w-[18px]';

export function AccountIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

export function SearchIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5 21 21" />
    </svg>
  );
}

export function BagIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M4 7h16l-1.2 14H5.2L4 7Z" />
      <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
    </svg>
  );
}

export function MenuIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

export function ChatIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      focusable="false"
      className={`h-[14px] w-[14px] ${className}`}
    >
      <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" />
    </svg>
  );
}

/** The 34px outlined square monogram that opens the header. */
export function Monogram({size = 34}: {size?: number}) {
  return (
    <span
      aria-hidden="true"
      style={{width: size, height: size}}
      className="inline-flex shrink-0 items-center justify-center border border-ink font-sans text-[15px] leading-none"
    >
      V
    </span>
  );
}

export function TrashIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      focusable="false"
      className={`h-[17px] w-[17px] ${className}`}
    >
      <path d="M4 7h16" />
      <path d="M10 4h4" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
