/**
 * 1px-stroke line icons. All are decorative — the buttons that contain them
 * carry the accessible label.
 */

import logo from '~/assets/logo.webp';

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

/**
 * The RAW RECORDZ logo. The artwork is dark, so it sits directly on paper;
 * over campaign imagery pass `brightness-0 invert` to knock it out to white.
 */
export function BrandLogo({className = ''}: IconProps) {
  return (
    <img
      src={logo}
      alt="RAW RECORDZ"
      width={900}
      height={301}
      className={`w-auto shrink-0 ${className}`}
    />
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

/*
 * Social marks. Drawn as simple glyphs rather than the platforms' official
 * logo files, which are trademarked assets with their own usage terms.
 */

export function InstagramIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M14.2 3h2.3c.3 1.9 1.4 3.4 3.5 3.7v2.4c-1.3 0-2.5-.4-3.5-1.1v5.9c0 3-2.2 5.1-5 5.1S6.5 16.9 6.5 14s2.2-5.1 5-5.1c.3 0 .5 0 .8.1v2.5a2.6 2.6 0 1 0 1.9 2.5V3Z" />
    </svg>
  );
}

export function YouTubeIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M22.2 8.2a2.7 2.7 0 0 0-1.9-1.9C18.6 5.8 12 5.8 12 5.8s-6.6 0-8.3.5A2.7 2.7 0 0 0 1.8 8.2 28 28 0 0 0 1.3 12c0 1.3.2 2.5.5 3.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 8.3.5 8.3.5s6.6 0 8.3-.5a2.7 2.7 0 0 0 1.9-1.9c.3-1.3.5-2.5.5-3.8s-.2-2.5-.5-3.8ZM10 15.1V8.9l5.3 3.1-5.3 3.1Z" />
    </svg>
  );
}

export function LineIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M12 3C6.8 3 2.6 6.4 2.6 10.6c0 3.8 3.3 6.9 7.8 7.5.3.1.7.2.8.5.1.3 0 .7 0 .9l-.1.8c0 .2-.2.9.8.5s5.4-3.2 7.4-5.4c1.3-1.4 2.1-3 2.1-4.8C21.4 6.4 17.2 3 12 3ZM8.2 13.1H6.6a.4.4 0 0 1-.4-.4V9.3a.4.4 0 1 1 .8 0v3h1.2a.4.4 0 0 1 0 .8Zm2-0.4a.4.4 0 1 1-.8 0V9.3a.4.4 0 1 1 .8 0v3.4Zm3.9 0a.4.4 0 0 1-.7.2l-1.7-2.3v2.1a.4.4 0 0 1-.8 0V9.3a.4.4 0 0 1 .7-.2l1.7 2.3V9.3a.4.4 0 0 1 .8 0v3.4Zm2.8-2.1a.4.4 0 0 1 0 .8h-1.2v.8h1.2a.4.4 0 0 1 0 .8h-1.6a.4.4 0 0 1-.4-.4V9.3a.4.4 0 0 1 .4-.4h1.6a.4.4 0 0 1 0 .8h-1.2v.8h1.2Z" />
    </svg>
  );
}

export function WhatsAppIcon({className = ''}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M21 11.7a8.6 8.6 0 0 1-12.8 7.5L3.2 20.6l1.4-4.9A8.6 8.6 0 1 1 21 11.7Z" />
      <path d="M8.9 8.3c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .6.4l.6 1.5c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.7 2.3c.3.1.4 0 .6-.1l.5-.6c.2-.2.3-.1.5 0l1.4.7c.2.1.3.2.3.4s0 .8-.3 1.1c-.3.4-.9.7-1.4.7-1 0-2.6-.6-4-1.9a8 8 0 0 1-2.2-3c-.3-.8-.2-1.7.1-2.2Z" />
    </svg>
  );
}
