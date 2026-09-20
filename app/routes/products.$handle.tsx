import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Money,
} from '@shopify/hydrogen';
import {ProductForm} from '~/components/ProductForm';
import {ProductGallery} from '~/components/ProductGallery';
import {Accordion} from '~/components/Accordion';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {editionLine} from '~/lib/season';
import {localProductByHandle} from '~/lib/products';
import {LocalProduct} from '~/components/LocalProduct';

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.local?.title ?? data?.product?.title ?? '';
  const handle = data?.local?.handle ?? data?.product?.handle ?? '';
  const description =
    data?.local?.description ??
    data?.product?.seo?.description ??
    data?.product?.description ??
    '';

  return [
    {title: `VESTIGE — ${title}`},
    {rel: 'canonical', href: `/products/${handle}`},
    {name: 'description', content: description},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // VESTIGE's own pieces are served from local data, not the Storefront API.
  const local = localProductByHandle(handle);
  if (local) {
    return {product: null, local};
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product, local: null};
}

export default function Product() {
  const {local} = useLoaderData<typeof loader>();

  // Hooks below assume the Storefront product shape, so local pieces render
  // through their own component rather than being forced into it.
  if (local) {
    return <LocalProduct product={local} />;
  }

  return <StorefrontProduct />;
}

function StorefrontProduct() {
  // This component only renders when the loader returned a Storefront
  // product, so the non-null assertion holds and hooks stay unconditional.
  const {product} = useLoaderData<typeof loader>() as {
    product: NonNullable<Awaited<ReturnType<typeof loader>>['product']>;
  };

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  // Gallery: the selected variant's image first, then the rest of the media.
  const mediaImages = product.images?.nodes ?? [];
  const images = selectedVariant?.image
    ? [
        selectedVariant.image,
        ...mediaImages.filter((image) => image.id !== selectedVariant.image?.id),
      ]
    : mediaImages;

  const edition = editionLine(product.editionSize?.value);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px]">
        {/* Gallery */}
        <div className="min-w-0 border-b border-ink lg:border-r lg:border-b-0">
          <ProductGallery images={images} title={title} />
        </div>

        {/* Sticky detail column */}
        <div className="lg:sticky lg:top-[132px] lg:h-fit">
          <div className="px-5 py-10 lg:px-10 lg:py-14">
            <p className="text-[11px] tracking-[0.3em] text-silver uppercase">
              Limited Series / 2026 FW
            </p>

            <h1 className="mt-5 text-[22px] leading-[1.25] tracking-[0.14em] uppercase">
              {title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3 text-[14px] tracking-[0.14em]">
              {selectedVariant?.price ? (
                <Money data={selectedVariant.price} />
              ) : null}
              {selectedVariant?.compareAtPrice &&
              Number(selectedVariant.compareAtPrice.amount) >
                Number(selectedVariant.price?.amount ?? 0) ? (
                <s className="text-silver">
                  <Money data={selectedVariant.compareAtPrice} />
                </s>
              ) : null}
            </div>

            <div className="mt-10">
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />
            </div>

            <p className="mt-5 text-[11px] leading-[1.7] tracking-[0.14em] text-silver uppercase">
              Free shipping over $300 · Ships within two business days
              {edition ? ` · ${edition}` : ''}
            </p>

            <div className="mt-12 border-t border-ink">
              <Accordion title="Details" defaultOpen>
                <div
                  className="text-[13px] leading-[1.8] [&_a]:underline"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              </Accordion>

              <Accordion title="Size & Fit">
                <div className="space-y-3 text-[13px] leading-[1.8]">
                  <p>
                    Cut true to size with a deliberately generous shoulder and a
                    straight body. Between sizes, take the smaller one for a
                    closer line.
                  </p>
                  <p className="text-silver">
                    The model is 186cm and wears a size Medium.
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
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 8) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    editionSize: metafield(namespace: "product", key: "edition_size") {
      value
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
