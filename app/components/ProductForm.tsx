import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

/**
 * Option selectors and the add-to-cart action.
 *
 * Option values render as 58×48 square outlined boxes: selected is solid
 * black, unavailable is grey-on-grey and not clickable. Selecting a value
 * writes it to the URL search params, per the Hydrogen variant pattern, so the
 * chosen variant is linkable and survives a reload.
 */
export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="flex flex-col gap-8">
      {productOptions.map((option) => {
        // A single-value option is not a choice; don't render a selector.
        if (option.optionValues.length === 1) return null;

        return (
          <fieldset key={option.name} className="flex flex-col gap-3">
            <legend className="mb-3 text-[11px] tracking-[0.3em] text-silver uppercase">
              {option.name}
            </legend>

            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const boxClass = [
                  'flex h-[48px] w-[58px] items-center justify-center border text-[11px] tracking-[0.14em] uppercase',
                  selected
                    ? 'border-ink bg-ink text-paper'
                    : available
                      ? 'border-ink bg-paper text-ink'
                      : // Sold out: grey border, grey text, not clickable.
                        'border-silver bg-paper text-silver cursor-not-allowed',
                ].join(' ');

                // A combined-listing value lives on another product URL, so it
                // must be a real anchor for crawlers.
                if (isDifferentProduct) {
                  return (
                    <Link
                      className={boxClass}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      aria-current={selected ? 'true' : undefined}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={boxClass}
                    key={option.name + name}
                    disabled={!exists || !available}
                    aria-pressed={selected}
                    aria-label={
                      available
                        ? `${option.name} ${name}`
                        : `${option.name} ${name}, sold out`
                    }
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <>{name}</>;

  return (
    <span
      aria-label={name}
      className="block h-[26px] w-[26px] border border-ink"
      style={{backgroundColor: color || 'transparent'}}
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : null}
    </span>
  );
}
