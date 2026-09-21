/**
 * Accepted-payment row.
 *
 * Card-network and wallet logos are trademarked artwork with their own usage
 * terms, so these are neutral labelled chips rather than copies of the real
 * marks. Swap in the licensed badges — Shopify provides them — before launch.
 */
const METHODS = [
  'Apple Pay',
  'G Pay',
  'Mastercard',
  'PayPal',
  'Shop Pay',
  'UnionPay',
  'Amex',
  'Visa',
];

export function PaymentMarks() {
  return (
    <ul aria-label="Accepted payment methods" className="flex flex-wrap items-center gap-2">
      {METHODS.map((method) => (
        <li
          key={method}
          className="flex h-[26px] items-center border border-[#D6D6D6] px-2 text-[9px] tracking-[0.06em] text-ink"
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
