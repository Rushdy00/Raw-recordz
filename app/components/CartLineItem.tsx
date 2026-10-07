import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, Money, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import {TrashIcon} from '~/components/Icons';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * One cart line: square thumbnail, uppercase title, size, a stepper built from
 * square boxes, and remove as a small underlined link. Child lines (bundles,
 * warranties) render nested beneath their parent.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image} = merchandise;
  // An optimistic line may not carry every field yet, so default before use.
  const selectedOptions = merchandise.selectedOptions ?? [];
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  // "Size" is the option the design surfaces; fall back to the variant title.
  const size =
    selectedOptions.find((option) => /size/i.test(option.name))?.value ??
    (title && title !== 'Default Title' ? title : null);

  /*
   * RAW RECORDZ's own pieces are added against a borrowed Storefront variant, so
   * Shopify returns its product's title and image for the line. When the line
   * carries RAW RECORDZ's identity as attributes, prefer those.
   */
  const attr = (key: string) =>
    line.attributes?.find((item) => item.key === key)?.value || null;

  const displayTitle = attr('_vestige_title') ?? product.title;
  const overrideImageUrl = attr('_vestige_image');
  const displayImage = overrideImageUrl
    ? {
        id: `attr-${id}`,
        url: overrideImageUrl,
        altText: displayTitle,
        width: 1200,
        height: 1500,
      }
    : image;

  return (
    <li>
      {/*
        One row: thumbnail, then vendor and title, then price, stepper and
        remove. It collapses to a stacked block on narrow screens.
      */}
      <div className="flex gap-4 px-5 py-5 lg:items-start lg:gap-6 lg:px-6">
        <Link
          to={lineItemUrl}
          prefetch="intent"
          onClick={() => layout === 'aside' && close()}
          tabIndex={-1}
          aria-hidden="true"
          className="shrink-0"
        >
          <div className="h-[128px] w-[100px] overflow-hidden bg-shell">
            {displayImage ? (
              <Image
                alt={displayImage.altText || displayTitle}
                data={displayImage}
                sizes="100px"
                loading="lazy"
                className="h-full w-full object-cover object-top"
              />
            ) : null}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="min-w-0 lg:max-w-[420px] lg:flex-1">
            {/* A RAW RECORDZ piece is ours regardless of the borrowed variant. */}
            <p className="text-[13px] text-silver">
              {overrideImageUrl ? 'RAW RECORDZ' : product.vendor}
            </p>

            <Link
              to={lineItemUrl}
              prefetch="intent"
              onClick={() => layout === 'aside' && close()}
              className="mt-1 block text-[13px] leading-[1.5] hover:underline"
            >
              {displayTitle}
              {size ? ` - ${size}` : ''}
            </Link>
          </div>

          <div className="text-[13px] lg:w-[120px] lg:shrink-0 lg:pl-4 lg:text-left">
            {line?.cost?.totalAmount ? (
              <Money data={line.cost.totalAmount} />
            ) : null}
          </div>

          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div className="pl-6">
          <p id={childrenLabelId} className="sr-only">
            Line items included with {displayTitle}
          </p>
          <ul aria-labelledby={childrenLabelId} className="border-t border-[#E2E2E2]">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Quantity stepper. The controls are disabled while a line is optimistic —
 * the server has not yet confirmed it exists.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  // Bare steppers either side of a circled count, then remove as a trash
  // icon — the count is the only thing that needs an outline.
  const stepClass =
    'flex h-9 w-9 items-center justify-center text-[18px] leading-none disabled:text-silver';

  return (
    <div className="flex items-center gap-2 lg:w-[150px] lg:shrink-0 lg:justify-end">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          type="submit"
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className={stepClass}
        >
          <span aria-hidden="true">&#8722;</span>
        </button>
      </CartLineUpdateButton>

      <span className="is-round flex h-8 w-8 shrink-0 items-center justify-center border border-ink text-[13px] tabular-nums">
        {quantity}
      </span>

      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          type="submit"
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className={stepClass}
        >
          <span aria-hidden="true">&#43;</span>
        </button>
      </CartLineUpdateButton>

      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        aria-label="Remove from cart"
        className="ml-2 flex h-9 w-9 items-center justify-center text-ink disabled:text-silver"
      >
        <TrashIcon />
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Unique key per update so rapid +/- clicks cancel each other rather than
 * running concurrently.
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
