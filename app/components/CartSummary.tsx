import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {Link, useFetcher} from 'react-router';
import {useAside} from '~/components/Aside';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

/** Cart footer: discount and gift card entry, subtotal, and checkout. */
export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountCodeInputId = useId();
  const giftCardInputId = useId();
  const noteId = useId();
  const [noteOpen, setNoteOpen] = useState(false);
  const {close} = useAside();

  return (
    <div aria-labelledby={summaryId} className="flex flex-col">
      <h4 id={summaryId} className="sr-only">
        Totals
      </h4>

      {/* Subtotal */}
      <dl className="flex items-baseline justify-between border-b border-ink px-5 py-4 lg:px-6">
        <dt className="text-[14px] font-semibold">Subtotal:</dt>
        <dd className="text-[14px] font-semibold">
          {cart?.cost?.subtotalAmount?.amount ? (
            <>
              <Money data={cart.cost.subtotalAmount} />
            </>
          ) : (
            '—'
          )}
        </dd>
      </dl>

      <p className="border-b border-ink px-5 py-3 text-center text-[12px] text-ink lg:px-6">
        Taxes, discounts and{' '}
        <Link to="/pages/shipping" className="underline" onClick={close}>
          shipping
        </Link>{' '}
        calculated at checkout.
      </p>

      {/* Order note */}
      <div className="border-b border-ink">
        <button
          type="button"
          aria-expanded={noteOpen}
          aria-controls={noteId}
          onClick={() => setNoteOpen((open) => !open)}
          className="flex w-full items-center justify-between px-5 py-4 text-left text-[13px] tracking-[0.06em] uppercase lg:px-6"
        >
          Add order note
          <span aria-hidden="true" className="text-[10px]">
            &#9660;
          </span>
        </button>

        <div id={noteId} hidden={!noteOpen} className="px-5 pb-4 lg:px-6">
          <CartNoteForm note={cart?.note} />
        </div>
      </div>

      {/* Checkout */}
      <div className="px-5 py-4 lg:px-6">
        {cart?.checkoutUrl ? (
          <a
            href={cart.checkoutUrl}
            target="_self"
            data-testid={`checkout-${layout}`}
            className="flex h-[52px] w-full items-center justify-center gap-2 bg-ink text-[14px] tracking-[0.06em] text-paper uppercase"
          >
            Check out <span aria-hidden="true">&rarr;</span>
          </a>
        ) : null}

        {/*
          Accelerated checkout. These are real buttons in a live store; here
          they route through the same checkout so nothing is a dead end.
        */}
        {cart?.checkoutUrl ? (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <ExpressButton href={cart.checkoutUrl} label="Shop Pay" className="bg-[#5A31F4] text-paper" />
            <ExpressButton href={cart.checkoutUrl} label="PayPal" className="bg-[#FFC439] text-ink" />
            <ExpressButton href={cart.checkoutUrl} label="G Pay" className="bg-ink text-paper" />
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-[13px] tracking-[0.06em] uppercase">
          <Link to="/cart" onClick={close} className="hover:underline">
            View cart
          </Link>
          <button type="button" onClick={close} className="hover:underline">
            Continue shopping
          </button>
        </div>
      </div>

      {/* Discounts and gift cards stay available, below the fold. */}
      <div className="border-t border-ink px-5 py-4 lg:px-6">
        <CartDiscounts
          discountCodes={cart?.discountCodes}
          discountCodeInputId={discountCodeInputId}
        />
        <CartGiftCard
          giftCardCodes={cart?.appliedGiftCards}
          giftCardInputId={giftCardInputId}
        />
      </div>
    </div>
  );
}

/** One accelerated-checkout button. */
function ExpressButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  return (
    <a
      href={href}
      target="_self"
      className={`flex h-[44px] items-center justify-center text-[13px] font-semibold ${className}`}
    >
      {label}
    </a>
  );
}

/** Order note, saved to the cart. */
function CartNoteForm({note}: {note?: string | null}) {
  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.NoteUpdate}>
      <label htmlFor="cart-note" className="sr-only">
        Order note
      </label>
      <textarea
        id="cart-note"
        name="note"
        rows={3}
        defaultValue={note ?? ''}
        placeholder="Special instructions for your order"
        className="w-full border border-ink px-3 py-2 text-[13px]"
      />
      <button
        type="submit"
        className="mt-2 border border-ink px-4 py-2 text-[11px] tracking-[0.14em] uppercase"
      >
        Save note
      </button>
    </CartForm>
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
