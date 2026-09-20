import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {VestigeProductCardFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

/**
 * One cell of a product grid.
 *
 * The card is a white block in a black grid: the 1px black lines between cards
 * are the grid's background showing through, so the card itself carries no
 * border. The image sits on `--color-shell` at a fixed aspect ratio so the grid
 * never shifts as images load.
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
  const image = product.featuredImage;
  const variant = product.selectedOrFirstAvailableVariant;
  const soldOut = variant ? !variant.availableForSale : false;

  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const price = product.priceRange.minVariantPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount)
      ? compareAt
      : null;

  return (
    <article className="flex min-w-0 flex-col bg-paper">
      <Link
        to={`/products/${product.handle}`}
        prefetch="intent"
        className="block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className={`${imageHeightClass} w-full overflow-hidden bg-shell`}
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
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 px-5 py-6 lg:px-7 lg:py-8">
        <h3 className="min-h-[2.6em] text-[13px] leading-[1.3] tracking-[0.14em] uppercase">
          <Link to={`/products/${product.handle}`} prefetch="intent">
            <span className="clamp-2">{product.title}</span>
          </Link>
        </h3>

        <div className="flex items-baseline gap-3 text-[13px] tracking-[0.14em]">
          <Money data={price} />
          {onSale ? (
            <s className="text-silver">
              <Money data={onSale} />
            </s>
          ) : null}
        </div>

        <div className="mt-auto pt-2">
          <AddToCartButton
            disabled={!variant || soldOut}
            onClick={() => open('cart')}
            lines={
              variant
                ? [{merchandiseId: variant.id, quantity: 1}]
                : []
            }
            className="btn-ink"
          >
            {soldOut ? 'Sold out' : 'Add to cart'}
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}
