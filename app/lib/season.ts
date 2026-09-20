/**
 * Normalizes the Storefront API responses for the hero metaobject and the
 * season metafields into the plain shapes the components render.
 *
 * Both sources are optional: a store that has not defined `hero_slides` or the
 * `season.*` metafields still renders the storefront using the placeholder
 * content in `~/lib/vestige`.
 */

import {
  HERO_SLIDES_FALLBACK,
  SEASON_FALLBACK,
  type HeroSlide,
  type SeasonStatement,
} from '~/lib/vestige';

type MetaobjectField = {
  key: string;
  value?: string | null;
  reference?: {
    image?: {
      id?: string | null;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
  } | null;
};

type MetaobjectNode = {
  id: string;
  handle?: string | null;
  fields: MetaobjectField[];
};

/**
 * Turns `hero_slides` metaobjects into HeroSlide objects. Copy lines are read
 * from `copy_1`..`copy_4`, or from a single newline-separated `copy` field.
 */
export function heroSlidesFromMetaobjects(
  nodes?: MetaobjectNode[] | null,
): HeroSlide[] {
  if (!nodes?.length) return HERO_SLIDES_FALLBACK;

  const slides = nodes
    .map((node): HeroSlide | null => {
      const byKey = new Map(node.fields.map((field) => [field.key, field]));
      const read = (key: string) => byKey.get(key)?.value?.trim() || '';

      const headline = read('headline');
      if (!headline) return null;

      const numbered = ['copy_1', 'copy_2', 'copy_3', 'copy_4']
        .map(read)
        .filter(Boolean);

      const copy = numbered.length
        ? numbered
        : read('copy')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 4);

      const image = byKey.get('image')?.reference?.image ?? null;

      return {
        id: node.id,
        eyebrow: read('eyebrow') || 'FALL / WINTER 2026 COLLECTION',
        headline,
        copy,
        link: read('link') || '/collections/all',
        image: image
          ? {
              url: image.url,
              altText: image.altText || headline,
              width: image.width ?? 2400,
              height: image.height ?? 1600,
            }
          : null,
      };
    })
    .filter((slide): slide is HeroSlide => slide !== null);

  return slides.length ? slides : HERO_SLIDES_FALLBACK;
}

type SeasonMetafields = {
  core?: {value: string} | null;
  philosophy?: {value: string} | null;
  designPrinciple?: {value: string} | null;
} | null;

/**
 * Pairs each season metafield with its label, keeping the placeholder
 * statement for any metafield the store has not defined.
 */
export function seasonStatementsFromMetafields(
  shop?: SeasonMetafields,
): SeasonStatement[] {
  const values = [
    shop?.core?.value,
    shop?.philosophy?.value,
    shop?.designPrinciple?.value,
  ];

  return SEASON_FALLBACK.map((fallback, index) => {
    const value = values[index]?.trim();
    return value ? {label: fallback.label, statement: value} : fallback;
  });
}

/**
 * Reads a product's `product.edition_size` metafield into the PDP's
 * "120 UNITS MADE" line. Returns null when the metafield is absent.
 */
export function editionLine(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^\d+$/.test(trimmed)
    ? `${trimmed} UNITS MADE`
    : trimmed.toUpperCase();
}
