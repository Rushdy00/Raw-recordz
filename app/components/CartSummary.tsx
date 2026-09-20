import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef} from 'react';
import {useFetcher} from 'react-router';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

/** Cart footer: discount and gift card entry, subtotal, and checkout. */
export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountCodeInputId = useId();
  const giftCardInputId = useId();

  return (
    <div
      aria-labelledby={summaryId}
      className="border-t border-ink bg-paper px-6 py-6"
    >
      <h4 id={summaryId} className="sr-only">
        Totals
      </h4>

      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountCodeInputId={discountCodeInputId}
      />

      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardInputId={giftCardInputId}
      />

      <dl className="mt-5 flex items-baseline justify-between">
        <dt className="text-[11px] tracking-[0.3em] uppercase">Subtotal</dt>
        <dd className="text-[14px] tracking-[0.14em]">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '—'
          )}
        </dd>
      </dl>

      <p className="mt-2 text-[10px] tracking-[0.14em] text-silver uppercase">
        Shipping and taxes calculated at checkout
      </p>

      {cart?.checkoutUrl ? (
        <a
          href={cart.checkoutUrl}
          target="_self"
          className="btn-ink mt-5"
          data-testid={`checkout-${layout}`}
        >
          Checkout
        </a>
      ) : null}
    </div>
  );
}

function CartDiscounts({
  discountCodes,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountCodeInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts" className="mb-3">
      {codes.length ? (
        <UpdateDiscountForm>
          <div className="mb-3 flex items-center justify-between text-[11px] tracking-[0.14em] uppercase">
            <span>{codes.join(', ')}</span>
            <button
              type="submit"
              aria-label="Remove discount"
              className="text-silver underline"
            >
              Remove
            </button>
          </div>
        </UpdateDiscountForm>
      ) : null}

      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="DISCOUNT CODE"
            className="min-w-0 flex-1 border border-ink px-3 py-2 text-[11px] tracking-[0.14em] uppercase placeholder:text-silver"
          />
          <button
            type="submit"
            aria-label="Apply discount code"
            className="border border-ink px-4 text-[11px] tracking-[0.14em] uppercase"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  useEffect(() => {
    if (giftCardAddFetcher.data && giftCardCodeInput.current) {
      giftCardCodeInput.current.value = '';
    }
  }, [giftCardAddFetcher.data]);

  return (
    <section aria-label="Gift cards">
      {giftCardCodes?.length ? (
        <ul className="mb-3">
          {giftCardCodes.map((giftCard) => (
            <li
              key={giftCard.id}
              className="mb-2 flex items-center justify-between text-[11px] tracking-[0.14em] uppercase"
            >
              <span>
                ***{giftCard.lastCharacters} <Money data={giftCard.amountUsed} />
              </span>
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="flex gap-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="GIFT CARD"
            ref={giftCardCodeInput}
            className="min-w-0 flex-1 border border-ink px-3 py-2 text-[11px] tracking-[0.14em] uppercase placeholder:text-silver"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Apply gift card code"
            className="border border-ink px-4 text-[11px] tracking-[0.14em] uppercase"
          >
            Apply
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
}: {
  giftCardId: string;
  lastCharacters: string;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{giftCardCodes: [giftCardId]}}
    >
      <button
        type="submit"
        aria-label={`Remove gift card ending in ${lastCharacters}`}
        className="text-silver underline"
      >
        Remove
      </button>
    </CartForm>
  );
}
