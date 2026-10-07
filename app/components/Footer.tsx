import {Link, useFetcher} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {
  BRAND_STORY_LINES,
  FOOTER_LINKS,
  NEWSLETTER_PITCH,
  SOCIAL_LINKS,
} from '~/lib/vestige';
import {useRegion} from '~/components/RegionModal';
import {PaymentMarks} from '~/components/PaymentMarks';
import {
  InstagramIcon,
  LineIcon,
  TikTokIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from '~/components/Icons';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
  /** Attached to the fixed wrapper so its height can be measured. */
  revealRef?: React.Ref<HTMLDivElement>;
  /** False while the page content still covers the footer. */
  revealed?: boolean;
}

const SOCIAL_ICONS: Record<string, (props: {className?: string}) => JSX.Element> =
  {
    Instagram: InstagramIcon,
    TikTok: TikTokIcon,
    YouTube: YouTubeIcon,
    LINE: LineIcon,
    WhatsApp: WhatsAppIcon,
  };

/**
 * Footer, in stacked bands divided by hairlines: brand statement beside the
 * newsletter signup, then socials, then the link row, then payment marks with
 * the region selector, and finally the copyright.
 *
 * It is fixed to the bottom of the viewport behind the page content, which
 * scrolls away to reveal it; the inner footer fades up as it does.
 */
export function Footer({revealRef, revealed = true}: FooterProps) {
  const {open, country} = useRegion();

  return (
    <div ref={revealRef} className="footer-reveal" data-revealed={revealed}>
    <footer className="footer-reveal-inner border-t border-ink bg-paper">
      {/* Brand statement | newsletter */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-ink px-5 py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-10">
          {BRAND_STORY_LINES.map((line) => (
            <p
              key={line}
              className="mb-4 max-w-[560px] text-[14px] leading-[1.6] font-semibold text-ink last:mb-0"
            >
              {line}
            </p>
          ))}
        </div>

        <div className="px-5 py-8 lg:px-8 lg:py-10">
          <NewsletterSignup />
        </div>
      </div>

      {/* Socials */}
      <div className="flex items-center justify-center gap-7 border-t border-ink px-5 py-5">
        {SOCIAL_LINKS.map((social) => {
          const Icon = SOCIAL_ICONS[social.name];
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="flex h-10 w-10 items-center justify-center text-ink"
            >
              {Icon ? <Icon /> : social.name}
            </a>
          );
        })}
      </div>

      {/* Link row */}
      <nav
        aria-label="Footer"
        className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 border-t border-ink px-5 py-5"
      >
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.title}
            to={link.url}
            prefetch="intent"
            className="py-1 text-[13px] tracking-[0.06em] uppercase hover:underline"
          >
            {link.title}
          </Link>
        ))}
      </nav>

      {/*
        Payment marks and the region selector. The floating CHAT and REWARDS
        pills are fixed over the bottom corners, so this band is inset and
        given extra bottom padding to sit clear of them.
      */}
      <div className="flex flex-col gap-5 border-t border-ink px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-8">
        <PaymentMarks />

        <button
          type="button"
          onClick={open}
          className="flex items-center gap-2 self-start border border-ink px-4 py-2 text-[13px] lg:self-auto"
        >
          {country.name} ({country.currency} {country.symbol})
          <span aria-hidden="true" className="text-[11px] leading-none">
            &#9660;
          </span>
        </button>
      </div>

      {/*
        The floating CHAT and REWARDS pills are fixed over the bottom corners,
        so this last band is inset past them and padded to clear them.
      */}
      <div className="border-t border-ink px-5 pt-4 pb-24 text-center lg:px-[190px] lg:pt-5 lg:pb-8 lg:text-right">
        <p className="text-[12px] text-silver">
          © 2026 RAW RECORDZ. All rights reserved.
        </p>
      </div>
    </footer>
    </div>
  );
}

/**
 * Newsletter signup. Posts to the same /newsletter action as the popup, so a
 * subscriber is created once and Klaviyo is forwarded to when configured.
 */
function NewsletterSignup() {
  const fetcher = useFetcher<{ok?: boolean; error?: string}>();
  const succeeded = fetcher.data?.ok;

  return (
    <div>
      <p className="text-[14px] leading-[1.6] text-ink">{NEWSLETTER_PITCH}</p>

      {succeeded ? (
        <p
          role="status"
          className="mt-4 border border-ink px-4 py-4 text-[13px] text-ink"
        >
          You&apos;re on the list. Your code arrives by email before the next
          drop.
        </p>
      ) : (
        <fetcher.Form method="POST" action="/newsletter" className="mt-4">
          <label htmlFor="footer-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="your@email.address"
            className="w-full border border-ink px-4 py-3 text-[14px] placeholder:text-silver"
          />

          {fetcher.data?.error ? (
            <p role="alert" className="mt-2 text-[12px] text-ink">
              {fetcher.data.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={fetcher.state !== 'idle'}
            className="mt-2 flex h-[52px] w-full items-center justify-center bg-ink text-[14px] tracking-[0.08em] text-paper uppercase disabled:bg-silver"
          >
            {fetcher.state === 'idle' ? 'Subscribe' : 'Sending…'}
          </button>
        </fetcher.Form>
      )}
    </div>
  );
}
