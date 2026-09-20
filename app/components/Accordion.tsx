import {useId, useState, type ReactNode} from 'react';

/**
 * Accordion row used by the product page. Rows are divided by 1px black lines
 * and the chevron is a plain +/− so nothing rounds.
 */
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className="border-b border-ink">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between py-5 text-left text-[11px] tracking-[0.3em] uppercase"
        >
          {title}
          <span aria-hidden="true" className="text-[14px] leading-none">
            {open ? '−' : '+'}
          </span>
        </button>
      </h3>

      <div id={contentId} hidden={!open} className="pb-6">
        {children}
      </div>
    </div>
  );
}
