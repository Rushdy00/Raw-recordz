import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {FloatingPills} from '~/components/FloatingPills';
import {NewsletterPopup} from '~/components/NewsletterPopup';
import {RegionProvider, type Country} from '~/components/RegionModal';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {useFooterReveal} from '~/hooks/useFooterReveal';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  countries?: Country[] | null;
  selectedCountry?: string | null;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  countries,
  selectedCountry,
}: PageLayoutProps) {
  const {contentRef, footerRef, sentinelRef, revealed} = useFooterReveal();

  return (
    <RegionProvider countries={countries} selectedCountry={selectedCountry}>
      <Aside.Provider>
        <CartAside cart={cart} />
        <SearchAside />
        <MobileMenuAside />

        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          />
        )}

        {/*
          The content layer is opaque and stacked above the fixed footer, so
          scrolling past its end uncovers the footer beneath it.
        */}
        <div ref={contentRef} className="content-layer">
          <main>
            {children}
            <div ref={sentinelRef} className="footer-sentinel" aria-hidden="true" />
          </main>
        </div>

        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
          revealRef={footerRef}
          revealed={revealed}
        />

        <FloatingPills />
        <NewsletterPopup />
      </Aside.Provider>
    </RegionProvider>
  );
}

/** Cart drawer — the primary cart UI. Its heading carries the live count. */
function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Suspense
      fallback={
        <Aside type="cart" heading="CART">
          <p className="px-6 py-8 text-[12px] tracking-[0.14em] text-silver uppercase">
            Loading cart…
          </p>
        </Aside>
      }
    >
      <Await resolve={cart}>
        {(resolved) => <CartAsideContents cart={resolved} />}
      </Await>
    </Suspense>
  );
}

function CartAsideContents({cart}: {cart: CartApiQueryFragment | null}) {
  const optimisticCart = useOptimisticCart(cart);
  const count = optimisticCart?.totalQuantity ?? 0;

  return (
    <Aside type="cart" heading={`CART (${count})`}>
      <CartMain cart={cart} layout="aside" />
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();

  return (
    <Aside type="search" heading="SEARCH">
      <div className="flex flex-col gap-6 px-6 py-6">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="flex gap-2">
              <label htmlFor="predictive-search" className="sr-only">
                Search
              </label>
              <input
                id="predictive-search"
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="SEARCH"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                data-autofocus
                className="min-w-0 flex-1 border border-ink px-4 py-3 text-[12px] tracking-[0.22em] uppercase placeholder:text-silver"
              />
              <button
                onClick={goToSearch}
                className="border border-ink px-4 text-[11px] tracking-[0.22em] uppercase"
              >
                Go
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return (
                <p className="text-[12px] tracking-[0.14em] text-silver uppercase">
                  Searching…
                </p>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    className="text-[11px] tracking-[0.22em] underline uppercase"
                  >
                    View all results
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside() {
  return (
    <Aside type="mobile" heading="MENU">
      <HeaderMenu />
    </Aside>
  );
}
