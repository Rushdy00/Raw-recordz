import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section aria-labelledby="search-articles" className="border-t border-ink">
      <h2
        id="search-articles"
        className="px-5 py-8 text-[11px] tracking-[0.3em] uppercase lg:px-8"
      >
        Articles
      </h2>
      <ul className="px-5 pb-10 lg:px-8">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <li key={article.id} className="border-b border-[#E2E2E2]">
              <Link
                prefetch="intent"
                to={articleUrl}
                className="block py-4 text-[12px] tracking-[0.14em] uppercase"
              >
                {article.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section aria-labelledby="search-pages" className="border-t border-ink">
      <h2
        id="search-pages"
        className="px-5 py-8 text-[11px] tracking-[0.3em] uppercase lg:px-8"
      >
        Pages
      </h2>
      <ul className="px-5 pb-10 lg:px-8">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <li key={page.id} className="border-b border-[#E2E2E2]">
              <Link
                prefetch="intent"
                to={pageUrl}
                className="block py-4 text-[12px] tracking-[0.14em] uppercase"
              >
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section aria-labelledby="search-products">
      <h2
        id="search-products"
        className="px-5 py-8 text-[11px] tracking-[0.3em] uppercase lg:px-8"
      >
        Products
      </h2>

      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <li key={product.id} className="bg-paper">
                <Link
                  prefetch="intent"
                  to={productUrl}
                  className="flex h-full flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-shell">
                    {image ? (
                      <Image
                        data={image}
                        alt={image.altText || product.title}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-5">
                    <p className="text-[12px] leading-[1.3] tracking-[0.14em] uppercase">
                      <span className="clamp-2">{product.title}</span>
                    </p>
                    <span className="text-[12px] tracking-[0.14em]">
                      {price ? <Money data={price} /> : null}
                    </span>
                  </div>
                </Link>
              </li>
            );
          });

          return (
            <div>
              <div className="flex justify-center">
                <PreviousLink className="px-5 py-4 text-[11px] tracking-[0.22em] underline uppercase">
                  {isLoading ? 'Loading…' : 'Load previous'}
                </PreviousLink>
              </div>

              <ul className="hairline-grid grid-cols-2 lg:grid-cols-4">
                {ItemsMarkup}
              </ul>

              <div className="flex justify-center">
                <NextLink className="px-5 py-4 text-[11px] tracking-[0.22em] underline uppercase">
                  {isLoading ? 'Loading…' : 'Load more'}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </section>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="px-5 py-[100px] text-[12px] tracking-[0.22em] text-silver uppercase lg:px-8">
      No results. Try a different search.
    </p>
  );
}
