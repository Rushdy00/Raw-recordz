import {Link} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {BRAND_STORY, FOOTER_LINKS} from '~/lib/vestige';
import {useRegion} from '~/components/RegionModal';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/**
 * Two-column footer: brand story on the left, links on the right, with the
 * region / language selectors and copyright in a sub-footer beneath.
 */
export function Footer(_props: FooterProps) {
  const {open, country, language} = useRegion();

  return (
    <footer className="border-t border-ink bg-paper">
      <div className="grid grid-cols-1 gap-12 px-5 py-[100px] lg:grid-cols-[1fr_auto] lg:gap-24 lg:px-8 lg:py-[120px]">
        <div className="max-w-[640px]">
          <p className="text-[14px] leading-[1.85] text-ink">{BRAND_STORY}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-4 lg:min-w-[220px]">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.title}
              to={link.url}
              prefetch="intent"
              className="text-[12px] tracking-[0.22em] uppercase hover:underline"
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sub-footer */}
      <div className="flex flex-col gap-5 border-t border-ink px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={open}
            className="border border-ink px-4 py-2 text-[11px] tracking-[0.22em] uppercase"
          >
            {country.name} ({country.currency} {country.symbol})
          </button>
          <button
            type="button"
            onClick={open}
            className="border border-ink px-4 py-2 text-[11px] tracking-[0.22em] uppercase"
          >
            {language.name}
          </button>
        </div>

        <p className="text-[11px] tracking-[0.22em] text-silver uppercase">
          © 2026 VESTIGE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
