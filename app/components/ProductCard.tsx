import {useId, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {VestigeProductCardFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

type CardVariant = NonNullable<
  VestigeProductCardFragment['variants']
>['nodes'][number];

/**
 * Labels a variant by its option values — "Red / S" — rather than its title,
 * which collapses to just the size on multi-option products and would show
 * "Medium" five times over.
 */
function variantLabel(variant: CardVariant) {
  const values = variant.selectedOptions
    ?.map((option) => option.value)
    .filter(Boolean);
  return values?.length ? values.join(' / ') : variant.title;
}

/**
 * One cell of a product grid.
 *
 * The card is a white block in a black grid: the 1px black lines between cards
 * are the grid's background showing through, so the card itself carries no
 * border. The image sits on `--color-shell` at a fixed aspect ratio so the grid
 * never shifts as images load.
 *
 * A variant selector sits directly above the black action bar so a shopper can
 * choose a size and add to cart from the grid, without opening the product
 * page. Single-variant products show the bar alone.
 */
export function ProductCard({
  product,
  imageHeightClass = 'h-[480px] lg:h-[860px]',
  loading = 'lazy',
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: {
  product: VestigeProductCardFragment;
  /** Tailwind height classes for the image well. */
  imageHeightClass?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
}) {
  const {open} = useAside();
  const selectId = useId();

  const variants = useMemo(
    () => product.variants?.nodes ?? [],
    [product.variants],
  );

  // Default to the variant the API selects, else the first one in stock.
  const defaultVariantId =
    product.selectedOrFirstAvailableVariant?.id ??
    variants.find((variant) => variant.availableForSale)?.id ??
    variants[0]?.id;

  const [selectedId, setSelectedId] = useState<string | undefined>(
    defaultVariantId,
  );

  const selected =
    variants.find((variant) => variant.id === selectedId) ?? variants[0];

  const soldOut = selected ? !selected.availableForSale : true;
  const hasChoice = variants.length > 1;

  // The chosen variant's price wins; fall back to the range for odd catalogues.
  const price = selected?.price ?? product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount)
      ? compareAt
      : null;

  const gallery = product.images?.nodes ?? [];

  // The chosen variant's own shot wins, so picking a colour changes the card.
  const image = selected?.image ?? product.featuredImage ?? gallery[0];

  // Hover reveals the next shot. Skip it when that would just crossfade the
  // image into itself (single-image products, or a variant-specific shot).
  const hoverImage = gallery.find((shot) => shot.id !== image?.id) ?? null;

  return (
    <article className="group flex min-w-0 flex-col bg-paper">
      <Link
        to={`/products/${product.handle}`}
        prefetch="intent"
        className="block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className={`relative ${imageHeightClass} w-full overflow-hidden bg-shell`}
        >
          {image ? (
            <Image
              data={image}
              alt={image.altText || product.title}
              sizes={sizes}
              loading={loading}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-shell" />
          )}

          {/*
            Second shot, stacked on top and faded in on hover or keyboard
            focus within the card. `.hover-swap` hides it outright on touch
            screens, which cannot hover, and `motion-reduce` holds it hidden
            so the card stays still for anyone who asked for less motion.
          */}
          {hoverImage ? (
            <Image
              data={hoverImage}
              alt=""
              aria-hidden="true"
              sizes={sizes}
              loading="lazy"
              className="hover-swap absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:opacity-0 motion-reduce:group-focus-within:opacity-0"
            />
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 px-5 pt-6 lg:px-7 lg:pt-8">
        <h3 className="text-[13px] leading-[1.3] tracking-[0.14em] uppercase">
          <Link
            to={`/products/${product.handle}`}
            prefetch="intent"
            className="block min-h-[2.6em] py-1"
          >
            <span className="clamp-2">{product.title}</span>
          </Link>
        </h3>

        <div className="flex items-baseline gap-3 pb-4 text-[13px] tracking-[0.14em]">
          <Money data={price} />
          {onSale ? (
            <s className="text-silver">
              <Money data={onSale} />
            </s>
          ) : null}
        </div>
      </div>

      {/*
        Action row. Selector and black bar sit side by side on one line: the
        selector on the left in its own hairline box with the chevron divided
        off, the bar on the right carrying price and label. Products with a
        single variant give the whole row to the bar.
      */}
      <div className="card-actions mt-auto flex items-stretch px-5 pb-6 lg:px-7 lg:pb-7">
        {hasChoice ? (
          <div className="relative flex w-[45%] shrink-0 items-stretch border-y border-l border-ink">
            <label htmlFor={selectId} className="sr-only">
              Select a variant of {product.title}
            </label>
            <select
              id={selectId}
              value={selected?.id ?? ''}
              onChange={(event) => setSelectedId(event.target.value)}
              className="h-[48px] w-full appearance-none bg-paper pr-11 pl-4 text-left text-[13px] lg:pl-5"
            >
              {variants.map((variant) => (
                <option
                  key={variant.id}
                  value={variant.id}
                  disabled={!variant.availableForSale}
                >
                  {variantLabel(variant)}
                  {variant.availableForSale ? '' : ' — Sold out'}
                </option>
              ))}
            </select>
            {/* Chevron, boxed off by a hairline as in the reference. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center border-l border-ink text-[11px] leading-none"
            >
              &#9660;
            </span>
          </div>
        ) : null}

        <AddToCartButton
          disabled={!selected || soldOut}
          onClick={() => open('cart')}
          lines={
            selected
              ? [
                  {
                    merchandiseId: selected.id,
                    quantity: 1,
                    // Lets the optimistic cart render the line — with the right
                    // size and price — before the server responds.
                    selectedVariant: {
                      ...selected,
                      product: {
                        handle: product.handle,
                        title: product.title,
                      },
                      image: selected.image ?? product.featuredImage,
                    },
                  },
                ]
              : []
          }
          className="btn-card px-4"
        >
          <span className="tabular-nums">
            <Money data={price} />
          </span>
          <span>{soldOut ? 'Sold out' : 'ADD TO CART'}</span>
        </AddToCartButton>
      </div>
    </article>
  );
}
