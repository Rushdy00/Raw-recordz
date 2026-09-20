import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Analytics} from '@shopify/hydrogen';
import {Hero} from '~/components/Hero';
import {ProductCard} from '~/components/ProductCard';
import {BackToTop, SeasonConcept} from '~/components/SeasonConcept';
import {
  DROP_COLLECTION_QUERY,
  DROP_FALLBACK_QUERY,
  HERO_SLIDES_QUERY,
  SEASON_METAFIELDS_QUERY,
} from '~/lib/fragments';
import {heroSlidesFromMetaobjects, seasonStatementsFromMetafields} from '~/lib/season';
import {DROP_COLLECTION_HANDLE, DROP_TITLE} from '~/lib/vestige';

const DROP_PRODUCT_COUNT = 6;

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'VESTIGE — 2026 FW Obsidian Line'},
    {
      name: 'description',
      content:
        'Contemporary avant-garde clothing built from ancient heritage. Numbered runs, released once.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

/**
 * Everything on the homepage is above or near the fold on a tall viewport, so
 * the hero, drop grid and season copy are all loaded critically.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [heroData, dropData, seasonData] = await Promise.all([
    storefront
      .query(HERO_SLIDES_QUERY, {
        variables: {first: 8},
        cache: storefront.CacheShort(),
      })
      .catch(() => null),
    storefront
      .query(DROP_COLLECTION_QUERY, {
        variables: {handle: DROP_COLLECTION_HANDLE, first: DROP_PRODUCT_COUNT},
        cache: storefront.CacheShort(),
      })
      .catch(() => null),
    storefront
      .query(SEASON_METAFIELDS_QUERY, {cache: storefront.CacheShort()})
      .catch(() => null),
  ]);

  // Stores that have not created the drop collection show the newest products
  // so the grid is never empty.
  let dropProducts = dropData?.collection?.products?.nodes ?? [];
  if (!dropProducts.length) {
    const fallback = await storefront
      .query(DROP_FALLBACK_QUERY, {
        variables: {first: DROP_PRODUCT_COUNT},
        cache: storefront.CacheShort(),
      })
      .catch(() => null);
    dropProducts = fallback?.products?.nodes ?? [];
  }

  return {
    slides: heroSlidesFromMetaobjects(heroData?.metaobjects?.nodes),
    dropProducts,
    dropTitle: dropData?.collection?.title
      ? `RELEASED 08.24 | ${dropData.collection.title.toUpperCase()}`
      : DROP_TITLE,
    seasonStatements: seasonStatementsFromMetafields(seasonData?.shop),
  };
}

export default function Homepage() {
  const {slides, dropProducts, dropTitle, seasonStatements} =
    useLoaderData<typeof loader>();

  return (
    <div>
      <Hero slides={slides} />

      {/* Drop section */}
      <section aria-labelledby="drop-title">
        <h2
          id="drop-title"
          className="px-5 py-10 text-[13px] tracking-[0.3em] uppercase lg:px-8 lg:py-14"
        >
          {dropTitle}
        </h2>

        <div className="hairline-grid grid-cols-1 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
          {dropProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              /* The first row is close enough to the fold to load eagerly. */
              loading={index < 2 ? 'eager' : 'lazy'}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ))}
        </div>
      </section>

      <SeasonConcept statements={seasonStatements} />

      <BackToTop />

      <Analytics.CollectionView
        data={{
          collection: {
            id: DROP_COLLECTION_HANDLE,
            handle: DROP_COLLECTION_HANDLE,
          },
        }}
      />
    </div>
  );
}
