import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

/**
 * Cart contents, shared by the drawer and the /cart route.
 * `useOptimisticCart` applies pending mutations so quantity and removal
 * changes render immediately.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  const hasItems = (cart?.totalQuantity ?? 0) > 0;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  if (!hasItems) {
    return <CartEmpty layout={layout} />;
  }

  const lines = (
    <ul
      aria-labelledby={`cart-lines-${layout}`}
      className="divide-y divide-[#E2E2E2]"
    >
      {(cart?.lines?.nodes ?? []).map((line) => {
        // Child lines render nested under their parent, not at the root.
        if ('parentRelationship' in line && line.parentRelationship?.parent) {
          return null;
        }
        return (
          <CartLineItem
            key={line.id}
            line={line}
            layout={layout}
            childrenMap={childrenMap}
          />
        );
      })}
    </ul>
  );

  return (
    <section
      className="flex min-h-0 flex-col"
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <FreeShippingProgress
        subtotal={Number(cart?.cost?.subtotalAmount?.amount ?? 0)}
        currencyCode={cart?.cost?.subtotalAmount?.currencyCode}
      />

      <p id={`cart-lines-${layout}`} className="sr-only">
        Line items
      </p>

      {/*
        Line items on the left, summary on the right. The summary keeps its
        own border so the two columns read as separate panels, and stacks
        beneath the items on narrow screens.
      */}
      <div className="flex min-h-0 flex-col lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1 overflow-y-auto">{lines}</div>

        <div className="border-t border-ink lg:w-[420px] lg:shrink-0 lg:border-t-0 lg:border-l">
          <CartSummary cart={cart} layout={layout} />
        </div>
      </div>
    </section>
  );
}

/** Free shipping threshold, in the cart's own currency. */
const FREE_SHIPPING_MINIMUM = 300;

/**
 * Progress towards free shipping. Once the threshold is met it congratulates
 * rather than disappearing, so the bar does not flicker in and out as
 * quantities change.
 */
function FreeShippingProgress({
  subtotal,
  currencyCode,
}: {
  subtotal: number;
  currencyCode?: string;
}) {
  const remaining = Math.max(0, FREE_SHIPPING_MINIMUM - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_MINIMUM) * 100);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits: 2,
  }).format(remaining);

  return (
    <div className="border-b border-ink px-5 py-3 text-center lg:px-6">
      <p className="text-[13px]">
        {remaining > 0 ? (
          <>
            Spend <strong className="font-bold">{formatted}</strong> more for
            free shipping!
          </>
        ) : (
          <>You have earned free shipping.</>
        )}
      </p>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Progress towards free shipping"
        className="mx-auto mt-2 h-[6px] w-full max-w-[220px] bg-[#D9D9D9]"
      >
        <div className="h-full bg-ink" style={{width: `${pct}%`}} />
      </div>
    </div>
  );
}

function CartEmpty({layout}: {layout: CartMainProps['layout']}) {
  const {close} = useAside();

  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6 py-16">
      <h3 className="text-[15px] tracking-[0.22em] uppercase">
        Your cart is empty
      </h3>
      <p className="text-[12px] leading-[1.7] text-silver">
        Pieces are released in numbered runs. Start with the current drop.
      </p>
      <Link
        to="/collections/all"
        onClick={layout === 'aside' ? close : undefined}
        prefetch="intent"
        className="btn-ink mt-2"
      >
        Continue shopping
      </Link>
    </div>
  );
}
