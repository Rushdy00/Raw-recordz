import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, NavLink, useLocation} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {
  AccountIcon,
  BagIcon,
  MenuIcon,
  Monogram,
  SearchIcon,
} from '~/components/Icons';
import {ANNOUNCEMENT, NAV_ROWS, type NavItem} from '~/lib/vestige';

/** 40px hit area around the 18px header icons. */
const ICON_HIT = 'flex h-10 w-10 items-center justify-center';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Header({header, cart, isLoggedIn}: HeaderProps) {
  const {open} = useAside();
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const location = useLocation();
  const headerRef = useRef<HTMLElement | null>(null);

  // Close the mega panel whenever the route changes.
  useEffect(() => {
    setOpenPanel(null);
  }, [location.pathname]);

  // Close it on Escape, and when focus or the pointer leaves the header.
  useEffect(() => {
    if (!openPanel) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPanel(null);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openPanel]);

  const activePanel = NAV_ROWS.flat().find(
    (item) => item.title === openPanel && item.panel,
  );

  return (
    <>
      {/* Announcement bar */}
      <div className="flex h-[38px] items-center justify-center border-b border-ink bg-paper px-4 text-center text-[11px] tracking-[0.28em] uppercase">
        {ANNOUNCEMENT}
      </div>

      <header
        ref={headerRef}
        onMouseLeave={() => setOpenPanel(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setOpenPanel(null);
          }
        }}
        className="sticky top-0 z-50 border-b border-ink bg-paper"
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 lg:px-8 lg:py-5">
          {/* Left — monogram + wordmark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => open('mobile')}
              aria-label="Open menu"
              className="-ml-2 flex h-10 w-10 items-center justify-center lg:hidden"
            >
              <MenuIcon />
            </button>
            <NavLink
              to="/"
              prefetch="intent"
              end
              className="flex items-center gap-3"
              aria-label={`${header.shop.name} — home`}
            >
              <Monogram />
              <span className="text-[15px] tracking-[0.34em] uppercase">
                VESTIGE
              </span>
            </NavLink>
          </div>

          {/* Center — three stacked nav rows */}
          <nav
            aria-label="Main"
            className="hidden justify-center lg:flex lg:flex-col lg:items-center lg:gap-[6px]"
          >
            {NAV_ROWS.map((row) => (
              // Rows are static, so the titles they contain identify them.
              <NavRow
                key={row.map((item) => item.title).join('-')}
                row={row}
                openPanel={openPanel}
                setOpenPanel={setOpenPanel}
              />
            ))}
          </nav>
          <span className="lg:hidden" />

          {/* Right — account, search, cart. Each control keeps a 40px hit
              area so the 18px icons stay comfortably tappable. */}
          <div className="flex items-center justify-end gap-1 lg:gap-2">
            <Suspense
              fallback={
                <Link to="/account" aria-label="Account" className={ICON_HIT}>
                  <AccountIcon />
                </Link>
              }
            >
              <Await
                resolve={isLoggedIn}
                errorElement={
                  <Link to="/account" aria-label="Account" className={ICON_HIT}>
                    <AccountIcon />
                  </Link>
                }
              >
                {(loggedIn) => (
                  <Link
                    to="/account"
                    prefetch="intent"
                    aria-label={loggedIn ? 'Account' : 'Sign in'}
                    className={ICON_HIT}
                  >
                    <AccountIcon />
                  </Link>
                )}
              </Await>
            </Suspense>

            <button
              type="button"
              onClick={() => open('search')}
              aria-label="Search"
              className={ICON_HIT}
            >
              <SearchIcon />
            </button>

            <CartToggle cart={cart} />
          </div>
        </div>

        {/* Full-width mega panel */}
        {activePanel?.panel ? (
          <div
            className="hidden border-b border-ink bg-paper lg:block"
            onMouseEnter={() => setOpenPanel(activePanel.title)}
          >
            <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-12 gap-y-4 px-8 py-10 md:grid-cols-4">
              {activePanel.panel.map((link) => (
                <Link
                  key={link.title}
                  to={link.url}
                  prefetch="intent"
                  className="text-[12px] tracking-[0.16em] uppercase hover:underline"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

/** One dot-separated row of navigation entries. */
function NavRow({
  row,
  openPanel,
  setOpenPanel,
}: {
  row: NavItem[];
  openPanel: string | null;
  setOpenPanel: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] tracking-[0.16em] uppercase">
      {row.map((item, index) => (
        <span key={item.title} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden="true" className="text-silver">
              ·
            </span>
          ) : null}
          {item.panel ? (
            <button
              type="button"
              aria-expanded={openPanel === item.title}
              aria-haspopup="true"
              onMouseEnter={() => setOpenPanel(item.title)}
              onFocus={() => setOpenPanel(item.title)}
              onClick={() =>
                setOpenPanel(openPanel === item.title ? null : item.title)
              }
              className="flex items-center gap-1 uppercase"
            >
              {item.title}
              {/* Sits slightly low against the uppercase cap height. */}
              <span
                aria-hidden="true"
                className="relative top-px text-[13px] leading-none"
              >
                &#9662;
              </span>
            </button>
          ) : (
            <NavLink
              to={item.url}
              prefetch="intent"
              onMouseEnter={() => setOpenPanel(null)}
              onFocus={() => setOpenPanel(null)}
              className={({isActive}) => (isActive ? 'underline' : undefined)}
            >
              {item.title}
            </NavLink>
          )}
        </span>
      ))}
    </div>
  );
}

/** Cart icon with a live item count. */
function CartToggle({cart}: {cart: HeaderProps['cart']}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart} errorElement={<CartBadge count={null} />}>
        {(resolved) => <CartBadgeWithCart cart={resolved} />}
      </Await>
    </Suspense>
  );
}

function CartBadgeWithCart({cart}: {cart: CartApiQueryFragment | null}) {
  const optimisticCart = useOptimisticCart(cart);
  return <CartBadge count={optimisticCart?.totalQuantity ?? 0} />;
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const quantity = count ?? 0;

  return (
    <button
      type="button"
      onClick={() => open('cart')}
      aria-label={`Open cart, ${quantity} ${quantity === 1 ? 'item' : 'items'}`}
      className="flex h-10 items-center gap-2 px-2"
    >
      <BagIcon />
      <span className="text-[11px] tracking-[0.14em] tabular-nums">
        {quantity}
      </span>
    </button>
  );
}

/**
 * The full-screen mobile menu contents, rendered inside the mobile Aside.
 */
export function HeaderMenu() {
  const {close} = useAside();

  return (
    <nav aria-label="Mobile" className="flex flex-col">
      {NAV_ROWS.flat().map((item) => (
        <div key={item.title} className="border-b border-ink">
          <Link
            to={item.url}
            prefetch="intent"
            onClick={close}
            className="block px-6 py-5 text-[18px] tracking-[0.22em] uppercase"
          >
            {item.title}
          </Link>
          {item.panel ? (
            <ul className="pb-4">
              {item.panel.map((link) => (
                <li key={link.title}>
                  <Link
                    to={link.url}
                    prefetch="intent"
                    onClick={close}
                    className="block px-6 py-2 text-[12px] tracking-[0.16em] text-silver uppercase"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </nav>
  );
}
