import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {useFetcher} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import type {CountryCode} from '@shopify/hydrogen/storefront-api-types';
import {CloseButton, OverlayScrim, useOverlay} from '~/components/Overlay';
import {COUNTRY_FALLBACK, LANGUAGE_FALLBACK} from '~/lib/vestige';

export type Country = {
  isoCode: string;
  name: string;
  currency: string;
  symbol: string;
};

export type Language = {isoCode: string; name: string};

type RegionContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  country: Country;
  language: Language;
  countries: Country[];
};

const RegionContext = createContext<RegionContextValue | null>(null);

export function useRegion() {
  const value = useContext(RegionContext);
  if (!value) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return value;
}

/**
 * Holds the selected market. `countries` comes from the Storefront API's
 * `localization` query; the placeholder list is used when a store has not
 * configured markets yet.
 */
export function RegionProvider({
  children,
  countries,
  selectedCountry,
}: {
  children: ReactNode;
  countries?: Country[] | null;
  selectedCountry?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const list = useMemo(
    () => (countries?.length ? countries : COUNTRY_FALLBACK),
    [countries],
  );

  const country = useMemo(
    () =>
      list.find((item) => item.isoCode === selectedCountry) ??
      list.find((item) => item.isoCode === 'US') ??
      list[0],
    [list, selectedCountry],
  );

  const value = useMemo<RegionContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      country,
      language: LANGUAGE_FALLBACK[0],
      countries: list,
    }),
    [isOpen, country, list],
  );

  return (
    <RegionContext.Provider value={value}>
      {children}
      {isOpen ? <RegionModal /> : null}
    </RegionContext.Provider>
  );
}

/**
 * Country / region modal.
 *
 * Selecting a country updates the cart's buyer identity and redirects through
 * Hydrogen's cart action, which is what actually switches market and currency.
 */
function RegionModal() {
  const {close, countries, country} = useRegion();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(country.isoCode);
  const [language, setLanguage] = useState(LANGUAGE_FALLBACK[0].isoCode);
  const containerRef = useOverlay({open: true, onClose: close});
  const fetcher = useFetcher();
  const titleId = useId();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.currency.toLowerCase().includes(term) ||
        item.isoCode.toLowerCase().includes(term),
    );
  }, [countries, query]);

  const confirm = useCallback(() => {
    const target = countries.find((item) => item.isoCode === selected);
    if (!target) {
      close();
      return;
    }

    // Hydrogen switches market by updating the cart's buyer identity and
    // returning to a localized path.
    fetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.BuyerIdentityUpdate,
          inputs: {
            buyerIdentity: {countryCode: target.isoCode as CountryCode},
          },
        }),
      },
      {method: 'POST', action: '/cart'},
    );

    close();
  }, [countries, selected, fetcher, close]);

  return (
    <OverlayScrim onClose={close} labelledBy={titleId}>
      <div
        ref={containerRef}
        data-overlay-panel
        className="relative z-10 flex max-h-[80vh] w-full max-w-[520px] flex-col border border-ink bg-paper"
      >
        <div className="flex items-center justify-between border-b border-ink px-6 py-5">
          <h2 id={titleId} className="text-[13px] tracking-[0.3em] uppercase">
            Country / Region
          </h2>
          <CloseButton onClose={close} label="Close region selector" />
        </div>

        <div className="border-b border-ink px-6 py-4">
          <label htmlFor="region-search" className="sr-only">
            Search countries
          </label>
          <input
            id="region-search"
            data-autofocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="SEARCH"
            className="w-full border border-ink px-4 py-3 text-[12px] tracking-[0.22em] uppercase placeholder:text-silver"
          />
        </div>

        <ul className="flex-1 overflow-y-auto">
          {filtered.map((item) => {
            const isSelected = item.isoCode === selected;
            return (
              <li key={item.isoCode} className="border-b border-[#E2E2E2]">
                <button
                  type="button"
                  onClick={() => setSelected(item.isoCode)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center justify-between px-6 py-4 text-left text-[12px] tracking-[0.14em] uppercase ${
                    isSelected ? 'bg-shell' : ''
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-silver">
                    {item.currency} {item.symbol}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="px-6 py-6 text-[12px] tracking-[0.14em] text-silver uppercase">
              No matching countries
            </li>
          ) : null}
        </ul>

        <div className="border-t border-ink px-6 py-4">
          <label
            htmlFor="region-language"
            className="mb-2 block text-[11px] tracking-[0.3em] text-silver uppercase"
          >
            Language
          </label>
          <select
            id="region-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="mb-4 w-full border border-ink px-4 py-3 text-[12px] tracking-[0.22em] uppercase"
          >
            {LANGUAGE_FALLBACK.map((item) => (
              <option key={item.isoCode} value={item.isoCode}>
                {item.name}
              </option>
            ))}
          </select>

          <button type="button" onClick={confirm} className="btn-ink">
            Confirm
          </button>
        </div>
      </div>
    </OverlayScrim>
  );
}
