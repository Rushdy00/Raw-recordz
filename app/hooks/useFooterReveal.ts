import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router';

/**
 * Drives the footer reveal: the footer is fixed behind the page, and the
 * content layer scrolls away to uncover it.
 *
 * The content layer needs a bottom margin exactly as tall as the footer so the
 * page scrolls far enough to show all of it. That height is measured here and
 * published as `--footer-h`, which the stylesheet falls back from to a fixed
 * default until this runs.
 *
 * Everything touching `window` or the observers lives in effects, so the
 * server render is untouched.
 */
export function useFooterReveal() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Starts revealed so the footer is at full size without JavaScript.
  const [revealed, setRevealed] = useState(true);
  const location = useLocation();

  // Re-runs on navigation as well: the new route's content is measured afresh.
  useEffect(() => {
    const content = contentRef.current;
    const footer = footerRef.current;
    if (!content || !footer) return;

    const measure = () => {
      const {height} = footer.getBoundingClientRect();
      content.style.setProperty('--footer-h', `${height}px`);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    // Fires for viewport resizes and for changes to the footer's own content.
    const observer = new ResizeObserver(measure);
    observer.observe(footer);
    return () => observer.disconnect();
  }, [location.key]);

  // The sentinel closes <main>; once it is on screen the footer is showing.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      setRevealed(entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // A fixed footer is never scrolled into view by the browser, so keyboard
  // focus landing in it would otherwise sit hidden behind the content.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const onFocusIn = () => {
      window.scrollTo({top: document.documentElement.scrollHeight});
    };
    footer.addEventListener('focusin', onFocusIn);
    return () => footer.removeEventListener('focusin', onFocusIn);
  }, []);

  return {contentRef, footerRef, sentinelRef, revealed};
}
