/**
 * VESTIGE's own products.
 *
 * Each entry is keyed by the number in its photograph's filename
 * (`0729person_<number>.webp`) — a different number is a different product.
 * The images live in `public/products/`, so they are served same-origin and
 * need no CSP exception.
 *
 * These take the place of the demo catalogue in every product grid. Once a
 * real Shopify store is linked, delete this file and the grids fall back to
 * the Storefront API automatically.
 */

import type {VestigeProductCardFragment} from 'storefrontapi.generated';

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 1500;

/** Sizes every piece is cut in. */
const SIZES = ['Small', 'Medium', 'Large', 'X-Large'] as const;

type LocalProductSeed = {
  /** The number from the photograph's filename. */
  code: string;
  handle: string;
  title: string;
  price: string;
  description: string;
  /** Sizes that have sold out of this run. */
  soldOut?: string[];
  /**
   * Real Storefront variant ids, one per size, in SIZES order.
   *
   * The cart is Shopify's: it only accepts merchandise ids that exist in the
   * connected store, and silently drops anything invented. Each piece is
   * therefore backed by a real variant so add-to-cart and checkout work.
   * Swap these for the store's own ids once the catalogue is uploaded.
   */
  variantIds: string[];
};

const SEEDS: LocalProductSeed[] = [
  {
    code: '26202',
    variantIds: [
      'gid://shopify/ProductVariant/43695846621206',
      'gid://shopify/ProductVariant/43695846653974',
      'gid://shopify/ProductVariant/43695846686742',
      'gid://shopify/ProductVariant/43695846719510',
    ],
    handle: 'hooded-veil-long-sleeve',
    title: 'Hooded Veil Long Sleeve — Bone',
    price: '168.00',
    description:
      'A draped hood falls into a single continuous panel that wraps the throat and hangs past the hem. Cut from a lightweight slub knit with a faint tonal stripe, finished with exposed shoulder seams and thumbhole cuffs.',
    soldOut: ['Small'],
  },
  {
    code: '26204',
    variantIds: [
      'gid://shopify/ProductVariant/43695847276566',
      'gid://shopify/ProductVariant/43695847309334',
      'gid://shopify/ProductVariant/43695847342102',
      'gid://shopify/ProductVariant/43695847374870',
    ],
    handle: 'shrouded-knit-long-sleeve',
    title: 'Shrouded Knit Long Sleeve — Bone',
    price: '172.00',
    description:
      'The hood is cut deep enough to close over the face and falls in soft folds at the collar. Raw-edged seams run the length of the sleeve, and the body is left long so it collects at the waist.',
  },
  {
    code: '26208',
    variantIds: [
      'gid://shopify/ProductVariant/43695847407638',
      'gid://shopify/ProductVariant/43695847440406',
      'gid://shopify/ProductVariant/43695847473174',
      'gid://shopify/ProductVariant/43695847505942',
    ],
    handle: 'studded-elbow-hooded-knit',
    title: 'Studded Elbow Hooded Knit — Bone',
    price: '189.00',
    description:
      'Hand-set metal studs mass across both elbow patches in an irregular field. A drawcord gathers the hood at the nape, and the shoulder line is dropped well past the joint.',
    soldOut: ['Medium', 'X-Large'],
  },
  {
    code: '26238',
    variantIds: [
      'gid://shopify/ProductVariant/43695847538710',
      'gid://shopify/ProductVariant/43695847571478',
      'gid://shopify/ProductVariant/43695847604246',
      'gid://shopify/ProductVariant/43695847637014',
    ],
    handle: 'draped-scarf-hooded-top',
    title: 'Draped Scarf Hooded Top — Bone',
    price: '196.00',
    description:
      'A scarf panel is knitted in one with the hood and left to hang loose to the knee. Studded forearm plates and an asymmetric wrap front give the piece its line when the arms are raised.',
  },
];

/** Builds a Storefront-shaped card so the local products render unchanged. */
function toCard(seed: LocalProductSeed): VestigeProductCardFragment {
  const url = `/products/${seed.code}.webp`;
  const money = {amount: seed.price, currencyCode: 'USD' as const};

  const image = {
    id: `gid://vestige/ProductImage/${seed.code}`,
    url,
    altText: seed.title,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  };

  const variants = SIZES.map((size, index) => ({
    id: seed.variantIds[index],
    title: size,
    availableForSale: !seed.soldOut?.includes(size),
    price: money,
    image,
    selectedOptions: [{name: 'Size', value: size}],
  }));

  const firstAvailable = variants.find((variant) => variant.availableForSale);

  return {
    id: `gid://vestige/Product/${seed.code}`,
    title: seed.title,
    handle: seed.handle,
    featuredImage: image,
    // A single photograph per product, so there is no second shot for the
    // hover crossfade; the card skips it rather than fading into itself.
    images: {nodes: [image]},
    priceRange: {minVariantPrice: money},
    compareAtPriceRange: {minVariantPrice: money},
    selectedOrFirstAvailableVariant: firstAvailable
      ? {id: firstAvailable.id, availableForSale: true}
      : {id: variants[0].id, availableForSale: false},
    variants: {nodes: variants},
  } as VestigeProductCardFragment;
}

/** Every VESTIGE product, in the order they appear in the grid. */
export const LOCAL_PRODUCTS: VestigeProductCardFragment[] = SEEDS.map(toCard);

/** Full detail for the product page, keyed by handle. */
export const LOCAL_PRODUCT_DETAIL = new Map(
  SEEDS.map((seed) => [
    seed.handle,
    {
      ...seed,
      card: toCard(seed),
      imageUrl: `/products/${seed.code}.webp`,
      imageWidth: IMAGE_WIDTH,
      imageHeight: IMAGE_HEIGHT,
      sizes: SIZES,
    },
  ]),
);

export function localProductByHandle(handle: string) {
  return LOCAL_PRODUCT_DETAIL.get(handle) ?? null;
}
