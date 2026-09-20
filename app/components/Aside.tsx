import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import {CloseButton, useOverlay} from '~/components/Overlay';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * Panel used for the cart drawer, predictive search and the mobile menu.
 *
 * The cart drops in from the top across the full width, so its two columns
 * (line items and summary) sit side by side; search slides in from the right
 * at 440px, and the mobile menu covers the screen.
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: ReactNode;
  type: AsideType;
  heading: ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  const containerRef = useOverlay({open: expanded, onClose: close});

  if (!expanded) return null;

  const isFullScreen = type === 'mobile';
  const isTopDrawer = type === 'cart';

  return (
    <div
      className={`fixed inset-0 z-[90] flex ${
        isTopDrawer ? 'items-start justify-center' : 'items-stretch justify-end'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-[rgba(0,0,0,0.62)]"
      />

      <div
        ref={containerRef}
        data-overlay-panel
        className={
          isTopDrawer
            ? 'relative z-10 flex max-h-full w-full flex-col border-b border-ink bg-paper'
            : `relative z-10 flex h-full flex-col border-l border-ink bg-paper ${
                isFullScreen ? 'w-full' : 'w-full max-w-[440px]'
              }`
        }
      >
        <header className="flex items-center justify-between border-b border-ink px-5 py-4 lg:px-6 lg:py-5">
          <h3 id={id} className="text-[13px] tracking-[0.3em] uppercase">
            {heading}
          </h3>
          <CloseButton onClose={close} />
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  const close = useCallback(() => setType('closed'), []);
  const open = useCallback((mode: AsideType) => setType(mode), []);

  const value = useMemo(
    () => ({type, open, close}),
    [type, open, close],
  );

  return (
    <AsideContext.Provider value={value}>{children}</AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
