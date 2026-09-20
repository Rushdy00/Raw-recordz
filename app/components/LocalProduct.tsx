import {useState} from 'react';
import {Analytics, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Accordion} from '~/components/Accordion';
import {ProductGallery} from '~/components/ProductGallery';
import {useAside} from '~/components/Aside';
import type {localProductByHandle} from '~/lib/products';

type LocalProductData = NonNullable<ReturnType<typeof localProductByHandle>>;

/**
 * Product page for VESTIGE's own pieces.
 *
 * The Storefront product page leans on `getProductOptions` and the encoded
 * variant helpers, which expect the API's shape. Rather than fake that, local
 * products render here and share the gallery, accordions and cart button.
 */
export function LocalProduct({product}: {product: LocalProductData}) {
  const {open} = useAside();
  const variants = product.card.variants?.nodes ?? [];

  const [selectedId, setSelectedId] = useState(
    () =>
      variants.find((variant) => variant.availableForSale)?.id ??
      variants[0]?.id,
  );

  const selected = variants.find((variant) => variant.id === selectedId);
  const soldOut = selected ? !selected.availableForSale : true;
  const price = selected?.price ?? product.card.priceRange.minVariantPrice;

  const image = {
    id: `local-${product.code}`,
    url: product.imageUrl,
    altText: product.title,
    width: product.imageWidth,
    height: product.imageHeight,
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px]">
        <div className="min-w-0 border-b border-ink lg:border-r lg:border-b-0">
          <ProductGallery images={[image]} title={product.title} />
        </div>

        <div className="lg:sticky lg:top-[132px] lg:h-fit">
          <div className="px-5 py-10 lg:px-10 lg:py-14">
            <p className="text-[11px] tracking-[0.3em] text-silver uppercase">
              Limited Series / 2026 FW
            </p>

            <h1 className="mt-5 text-[22px] leading-[1.25] tracking-[0.14em] uppercase">
              {product.title}
            </h1>

            <div className="mt-4 text-[14px] tracking-[0.14em]">
              <Money data={price} />
            </div>

            {/* Size selector: 58x48 squares, matching the Storefront page. */}
            <fieldset className="mt-10 flex flex-col gap-3">
              <legend className="mb-3 text-[11px] tracking-[0.3em] text-silver uppercase">
                Size
              </legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isSelected = variant.id === selectedId;
                  const available = variant.availableForSale;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!available}
                      aria-pressed={isSelected}
                      aria-label={
                        available
                          ? `Size ${variant.title}`
                          : `Size ${variant.title}, sold out`
                      }
                      onClick={() => setSelectedId(variant.id)}
                      className={[
                        'flex h-[48px] w-[58px] items-center justify-center border text-[11px] tracking-[0.14em] uppercase',
                        isSelected
                          ? 'border-ink bg-ink text-paper'
                          : available
                            ? 'border-ink bg-paper text-ink'
                            : 'cursor-not-allowed border-silver bg-paper text-silver',
                      ].join(' ')}
                    >
                      {variant.title}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8">
              <AddToCartButton
                disabled={!selected || soldOut}
                onClick={() => open('cart')}
                lines={
                  selected
                    ? [
                        {
                          merchandiseId: selected.id,
                          quantity: 1,
                          // See ProductCard: carries VESTIGE's identity onto
                          // a line backed by a borrowed Storefront variant.
                          attributes: [
                            {key: '_vestige_title', value: product.title},
                            {key: '_vestige_image', value: product.imageUrl},
                          ],
                          selectedVariant: {
                            ...selected,
                            product: {
                              handle: product.handle,
                              title: product.title,
                            },
                          },
                        },
                      ]
                    : []
                }
              >
                {soldOut ? 'Sold out' : 'Add to cart'}
              </AddToCartButton>
            </div>

            <p className="mt-5 text-[11px] leading-[1.7] tracking-[0.14em] text-silver uppercase">
              Free shipping over $300 · Ships within two business days
            </p>

            <div className="mt-12 border-t border-ink">
              <Accordion title="Details" defaultOpen>
                <p className="text-[13px] leading-[1.8]">
                  {product.description}
                </p>
              </Accordion>

              <Accordion title="Size & Fit">
                <div className="space-y-3 text-[13px] leading-[1.8]">
                  <p>
                    Cut true to size with a deliberately generous shoulder and a
                    straight body. Between sizes, take the smaller one for a
                    closer line.
                  </p>
                  <p className="text-silver">
                    The model is 178cm and wears a size S.
                  </p>
                </div>
              </Accordion>

              <Accordion title="Shipping & Returns">
                <div className="space-y-3 text-[13px] leading-[1.8]">
                  <p>
                    Orders over $300 ship free and arrive within three to five
                    business days. International delivery is calculated at
                    checkout.
                  </p>
                  <p className="text-silver">
                    Unworn pieces may be returned within fourteen days with the
                    edition tag attached.
                  </p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.card.id,
              title: product.title,
              price: price.amount,
              vendor: 'VESTIGE',
              variantId: selected?.id ?? '',
              variantTitle: selected?.title ?? '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}
