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

  return (
    <section
      className="flex h-full flex-col"
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <p id={`cart-lines-${layout}`} className="sr-only">
        Line items
      </p>

      <ul
        aria-labelledby={`cart-lines-${layout}`}
        className="flex-1 overflow-y-auto"
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

      <CartSummary cart={cart} layout={layout} />
    </section>
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
