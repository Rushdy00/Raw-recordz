import {useEffect, useId, useState} from 'react';
import {useFetcher} from 'react-router';
import {CloseButton, OverlayScrim, useOverlay} from '~/components/Overlay';
import {Monogram} from '~/components/Icons';

const STORAGE_KEY = 'vestige:newsletter-seen';
const DELAY_MS = 8000;

/**
 * First-visit newsletter popup.
 *
 * Fires once per visitor: a localStorage flag is written as soon as the popup
 * is shown, so dismissing, subscribing or simply leaving all prevent it from
 * appearing again.
 */
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<{ok?: boolean; error?: string}>();
  const titleId = useId();
  const containerRef = useOverlay({open, onClose: () => setOpen(false)});

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // Private browsing or blocked storage: show the popup, don't crash.
      seen = false;
    }
    if (seen) return;

    const timeout = setTimeout(() => {
      setOpen(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Ignore: the popup simply may appear again on a later visit.
      }
    }, DELAY_MS);

    return () => clearTimeout(timeout);
  }, []);

  if (!open) return null;

  const succeeded = fetcher.data?.ok;

  return (
    <OverlayScrim onClose={() => setOpen(false)} labelledBy={titleId}>
      <div
        ref={containerRef}
        data-overlay-panel
        className="relative z-10 w-full max-w-[440px] border border-ink bg-paper p-8 lg:p-10"
      >
        <div className="flex items-start justify-between">
          <Monogram />
          <CloseButton
            onClose={() => setOpen(false)}
            label="Close newsletter signup"
          />
        </div>

        {succeeded ? (
          <div className="mt-8">
            <h2
              id={titleId}
              className="font-display text-[34px] leading-[0.9] uppercase"
            >
              You&apos;re on the list
            </h2>
            <p className="mt-4 text-[12px] leading-[1.6] tracking-[0.14em] text-silver uppercase">
              Your code arrives by email before the next drop.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ink mt-8"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <h2
              id={titleId}
              className="mt-8 font-display text-[34px] leading-[0.9] uppercase"
            >
              Unlock 10% off your first drop
            </h2>

            <p className="mt-4 text-[12px] leading-[1.6] tracking-[0.14em] text-silver uppercase">
              Members get early access, archive pricing and repair priority.
            </p>

            <fetcher.Form method="POST" action="/newsletter" className="mt-8">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                data-autofocus
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="EMAIL ADDRESS"
                className="w-full border border-ink px-4 py-4 text-[12px] tracking-[0.22em] uppercase placeholder:text-silver"
              />

              {fetcher.data?.error ? (
                <p
                  role="alert"
                  className="mt-3 text-[11px] tracking-[0.14em] uppercase"
                >
                  {fetcher.data.error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={fetcher.state !== 'idle'}
                className="btn-ink mt-4"
              >
                {fetcher.state === 'idle' ? 'Continue' : 'Sending…'}
              </button>
            </fetcher.Form>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 block w-full text-center text-[11px] tracking-[0.22em] text-silver underline uppercase"
            >
              Maybe later
            </button>

            <p className="mt-6 text-[9px] leading-[1.6] text-silver">
              By subscribing you agree to receive marketing email from VESTIGE
              and accept our privacy policy. Unsubscribe at any time from the
              footer of any message.
            </p>
          </>
        )}
      </div>
    </OverlayScrim>
  );
}
