import {useCallback, useEffect, useRef} from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Shared behaviour for every overlay in the storefront: it traps focus, closes
 * on Escape, restores focus to whatever opened it, and locks page scrolling.
 *
 * Rendering is left to the caller so the cart drawer, newsletter popup and
 * country modal can each keep their own layout.
 */
export function useOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const focusFirst = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const target =
      container.querySelector<HTMLElement>('[data-autofocus]') ??
      container.querySelector<HTMLElement>(FOCUSABLE);

    if (target) {
      target.focus();
      return true;
    }

    // Contents may still be streaming in (the cart drawer awaits its lines).
    // Focus the panel itself so the trap has somewhere to hold focus.
    container.setAttribute('tabindex', '-1');
    container.focus();
    return false;
  }, []);

  useEffect(() => {
    if (!open) return;

    // Remember what had focus so it can be restored on close.
    restoreRef.current = document.activeElement as HTMLElement | null;
    document.body.classList.add('overlay-open');

    // Focus after paint, then retry once the deferred contents arrive.
    let raf = requestAnimationFrame(() => {
      if (!focusFirst()) {
        raf = requestAnimationFrame(() => focusFirst());
      }
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      // `offsetParent` is null inside position:fixed ancestors, so measure the
      // rendered box instead to decide what is really focusable.
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 || el === document.activeElement;
      });

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Cycle within the overlay rather than escaping to the page behind it.
      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.classList.remove('overlay-open');
      restoreRef.current?.focus?.();
    };
  }, [open, onClose, focusFirst]);

  return containerRef;
}

/**
 * The dimmed backdrop shared by the newsletter popup, the country modal and
 * the cart drawer. Clicking it closes the overlay.
 */
export function OverlayScrim({
  onClose,
  align = 'center',
  children,
  labelledBy,
  scrimClassName = 'bg-[rgba(0,0,0,0.62)]',
}: {
  onClose: () => void;
  align?: 'center' | 'right';
  /** Backdrop tint. Glass panels take a lighter one so the page reads through. */
  scrimClassName?: string;
  children: React.ReactNode;
  labelledBy: string;
}) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex ${
        align === 'center'
          ? 'items-center justify-center p-4'
          : 'items-stretch justify-end'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 h-full w-full cursor-default ${scrimClassName}`}
      />
      {children}
    </div>
  );
}

/** The square ✕ used in the corner of every overlay. */
export function CloseButton({
  onClose,
  label = 'Close',
  className = '',
}: {
  onClose: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center text-[18px] leading-none text-ink ${className}`}
    >
      <span aria-hidden="true">&#10005;</span>
    </button>
  );
}
