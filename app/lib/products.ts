/**
 * RAW RECORDZ's own products.
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
  /**
   * How many photographs this piece has, in `<code>-<n>.webp` form.
   *
   * Omitted means the single `<code>.webp` shot the first pieces were shot
   * with. Anything higher reads `<code>-1.webp` … `<code>-<shots>.webp`, in
   * order, and that order is the gallery's — front, side, angle, back.
   */
  shots?: number;
  /**
   * Size & Fit copy for pieces the default — written for tops — does not
   * describe.
   */
  fit?: string;
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
  {
    code: '11202',
    shots: 5,
    variantIds: [
      'gid://shopify/ProductVariant/43696903847958',
      'gid://shopify/ProductVariant/43696903979030',
      'gid://shopify/ProductVariant/43696904110102',
      'gid://shopify/ProductVariant/43696904241174',
    ],
    handle: 'scaled-hood-scarf-long-sleeve',
    title: 'Scaled Hood Scarf Long Sleeve — Rust',
    price: '184.00',
    description:
      'A ribbed knit hood runs into a fringed scarf long enough to wrap twice and still fall past the hip. The body is mineral-washed to a dry rust and printed with a tonal scale pattern that surfaces only in raking light. Snap-fastened cuffs, raw shoulder seams.',
    soldOut: ['X-Large'],
  },
  {
    code: '11704',
    shots: 2,
    variantIds: [
      'gid://shopify/ProductVariant/43696903880726',
      'gid://shopify/ProductVariant/43696904011798',
      'gid://shopify/ProductVariant/43696904142870',
      'gid://shopify/ProductVariant/43696904273942',
    ],
    handle: 'brindle-hooded-layer',
    title: 'Brindle Hooded Layer — Ash',
    price: '178.00',
    description:
      'Cut from a fine open knit printed edge to edge with a brindle stripe, worn as a second skin over the shoulder. The hood falls into a draped cowl at the throat and the front panel is left unjoined, so the piece hangs asymmetrically from a single shoulder line.',
  },
  {
    code: '13817',
    shots: 3,
    variantIds: [
      'gid://shopify/ProductVariant/43696903946262',
      'gid://shopify/ProductVariant/43696904077334',
      'gid://shopify/ProductVariant/43696904208406',
      'gid://shopify/ProductVariant/43696904339478',
    ],
    handle: 'armoured-panel-hoodie',
    title: 'Armoured Panel Hoodie — Bone',
    price: '248.00',
    description:
      'Padded panels are stitched over the chest and spine in a single continuous line, mapped to the body beneath. Eyeletted shoulder yokes carry an embroidered knot in oxblood thread. Heavy brushed fleece, sun-bleached at the seams, with a ribbed hem in contrast clay.',
    soldOut: ['Small'],
  },
  {
    code: '40001',
    shots: 3,
    variantIds: [
      'gid://shopify/ProductVariant/43696932126742',
      'gid://shopify/ProductVariant/43696932257814',
      'gid://shopify/ProductVariant/43696932388886',
      'gid://shopify/ProductVariant/43696932519958',
    ],
    handle: 'raw-denim-wide-leg-jean',
    title: 'Raw Denim Wide-Leg Jean — Indigo',
    price: '228.00',
    description:
      'Cut from a 14oz unwashed selvedge denim, left rigid so it creases and fades to the wearer. A four-button exposed fly sits on a mid rise, and a triple-needle seam in tobacco thread runs the full outseam, twisting forward as the leg widens. The hem is left long to stack and break over the shoe.',
    fit: 'Sits on the hip with a mid rise and a full wide leg from thigh to hem, cut on a 34" inseam so the hem pools. Raw denim gives up to an inch at the waist with wear — between sizes, take the smaller one. Wash cold and rarely; expect the indigo to transfer at first.',
    soldOut: ['Large'],
  },
];

/** Every photograph of a piece, in gallery order. */
function toImages(seed: LocalProductSeed) {
  const urls = seed.shots
    ? Array.from(
        {length: seed.shots},
        (_, index) => `/products/${seed.code}-${index + 1}.webp`,
      )
    : [`/products/${seed.code}.webp`];

  return urls.map((url, index) => ({
    id: `gid://vestige/ProductImage/${seed.code}-${index + 1}`,
    url,
    altText: seed.title,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  }));
}

/** Builds a Storefront-shaped card so the local products render unchanged. */
function toCard(seed: LocalProductSeed): VestigeProductCardFragment {
  const money = {amount: seed.price, currencyCode: 'USD' as const};

  const images = toImages(seed);
  const [image] = images;

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
    // Pieces shot once have no second frame for the card's hover crossfade;
    // the card skips it rather than fading into itself.
    images: {nodes: images},
    priceRange: {minVariantPrice: money},
    compareAtPriceRange: {minVariantPrice: money},
    selectedOrFirstAvailableVariant: firstAvailable
      ? {id: firstAvailable.id, availableForSale: true}
      : {id: variants[0].id, availableForSale: false},
    variants: {nodes: variants},
  } as VestigeProductCardFragment;
}

/** Every RAW RECORDZ product, in the order they appear in the grid. */
export const LOCAL_PRODUCTS: VestigeProductCardFragment[] = SEEDS.map(toCard);

/** Full detail for the product page, keyed by handle. */
export const LOCAL_PRODUCT_DETAIL = new Map(
  SEEDS.map((seed) => [
    seed.handle,
    {
      ...seed,
      card: toCard(seed),
      images: toImages(seed),
      imageUrl: toImages(seed)[0].url,
      imageWidth: IMAGE_WIDTH,
      imageHeight: IMAGE_HEIGHT,
      sizes: SIZES,
    },
  ]),
);

export function localProductByHandle(handle: string) {
  return LOCAL_PRODUCT_DETAIL.get(handle) ?? null;
}
