import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductCard} from '~/components/ProductCard';
import {BackToTop} from '~/components/SeasonConcept';
import {VESTIGE_PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import type {VestigeProductCardFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `VESTIGE — ${data?.collection.title ?? 'Collection'}`},
    {name: 'description', content: data?.collection.description ?? ''},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 8});

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <div>
      <header className="border-b border-ink px-5 py-14 lg:px-8 lg:py-20">
        <h1 className="text-[13px] tracking-[0.3em] uppercase">
          {collection.title}
        </h1>
        {collection.description ? (
          <p className="mt-6 max-w-[640px] text-[14px] leading-[1.85] text-ink">
            {collection.description}
          </p>
        ) : null}
      </header>

      <PaginatedResourceSection<VestigeProductCardFragment>
        connection={collection.products}
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

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/collection
const COLLECTION_QUERY = `#graphql
  ${VESTIGE_PRODUCT_CARD_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...VestigeProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
