import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, Money, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
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

  return (
    <li className="border-b border-ink">
      <div className="flex gap-4 px-6 py-5">
        <Link
          to={lineItemUrl}
          prefetch="intent"
          onClick={() => layout === 'aside' && close()}
          tabIndex={-1}
          aria-hidden="true"
          className="shrink-0"
        >
          <div className="h-[110px] w-[86px] overflow-hidden bg-shell">
            {image ? (
              <Image
                alt={image.altText || product.title}
                data={image}
                height={220}
                width={172}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Link
            to={lineItemUrl}
            prefetch="intent"
            onClick={() => layout === 'aside' && close()}
            className="text-[12px] leading-[1.4] tracking-[0.14em] uppercase"
          >
            <span className="clamp-2">{product.title}</span>
          </Link>

          {size ? (
            <p className="text-[11px] tracking-[0.14em] text-silver uppercase">
              Size {size}
            </p>
          ) : null}

          <div className="text-[12px] tracking-[0.14em]">
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
            Line items included with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="border-t border-ink">
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

  const boxClass =
    'flex h-8 w-8 items-center justify-center border border-ink text-[13px] leading-none disabled:border-silver disabled:text-silver';

  return (
    <div className="mt-1 flex items-center gap-4">
      <div className="flex items-center">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            type="submit"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className={boxClass}
          >
            <span aria-hidden="true">&#8722;</span>
          </button>
        </CartLineUpdateButton>

        <span className="flex h-8 w-9 items-center justify-center border-t border-b border-ink text-[12px] tabular-nums">
          {quantity}
        </span>

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            type="submit"
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className={boxClass}
          >
            <span aria-hidden="true">&#43;</span>
          </button>
        </CartLineUpdateButton>
      </div>

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
        className="text-[10px] tracking-[0.22em] text-silver underline uppercase"
      >
        Remove
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
