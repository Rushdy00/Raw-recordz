import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/ProductCard';
import {BackToTop} from '~/components/SeasonConcept';
import {VESTIGE_PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import type {VestigeProductCardFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: 'VESTIGE — All'}];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 8});

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {variables: {...paginationVariables}}),
  ]);

  return {products};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div>
      <header className="border-b border-ink px-5 py-14 lg:px-8 lg:py-20">
        <h1 className="text-[13px] tracking-[0.3em] uppercase">All</h1>
      </header>

      <PaginatedResourceSection<VestigeProductCardFragment>
        connection={products}
        resourcesClassName="hairline-grid grid-cols-1 lg:grid-cols-[repeat(2,minmax(0,1fr))]"
      >
        {({node: product, index}) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={index < 2 ? 'eager' : 'lazy'}
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        )}
      </PaginatedResourceSection>

      <BackToTop />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...VestigeProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${VESTIGE_PRODUCT_CARD_FRAGMENT}
` as const;
