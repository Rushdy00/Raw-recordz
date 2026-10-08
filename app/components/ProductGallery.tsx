import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Image} from '@shopify/hydrogen';
import {CloseButton, useOverlay} from '~/components/Overlay';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Product gallery: one large frame with a thumbnail filmstrip beneath it.
 *
 * The strip scrolls horizontally rather than wrapping, so a long run of shots
 * stays on one line under the image. The arrow only appears once the strip
 * actually overflows — with two or three shots there is nothing to page to.
 * The large frame opens in a lightbox.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // A variant switch reorders `images`, so an index held from the previous
  // order would point at the wrong shot. Clamp rather than persist it.
  const index = Math.min(activeIndex, Math.max(images.length - 1, 0));

  if (!images.length) {
    return <div className="aspect-[4/5] w-full bg-shell" />;
  }

  const active = images[index];

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setLightboxIndex(index)}
          aria-label={`Expand image ${index + 1} of ${images.length} for ${title}`}
          className="block w-full cursor-zoom-in"
        >
          {/*
            The frame follows the photograph's own 4:5 ratio and the image
            fills its width, so the whole garment is visible — cropping a
            look-book shot would cut the head or the hem. On a short viewport
            the column simply scrolls rather than the photograph being
            trimmed to fit it.
          */}
          <div className="aspect-[4/5] w-full overflow-hidden bg-shell">
            <Image
              data={active}
              key={active.url}
              alt={active.altText || title}
              sizes="(min-width: 1024px) 60vw, 100vw"
              loading="eager"
              {...{fetchpriority: 'high'}}
              className="h-full w-full object-contain"
            />
          </div>
        </button>

        {images.length > 1 ? (
          <Filmstrip
            images={images}
            index={index}
            title={title}
            onSelect={setActiveIndex}
          />
        ) : null}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          index={lightboxIndex}
          title={title}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}

/**
 * The horizontal strip of thumbnails. Hairline dividers between frames and a
 * solid ink border on the active one, matching the rest of the storefront.
 */
function Filmstrip({
  images,
  index,
  title,
  onSelect,
}: {
  images: GalleryImage[];
  index: number;
  title: string;
  onSelect: (next: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  // The arrow is only meaningful while the strip is wider than its container,
  // which depends on the viewport — so it is measured, not assumed.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const scrollable = el.scrollWidth - el.clientWidth;
      setOverflows(scrollable > 1);
      setAtEnd(el.scrollLeft >= scrollable - 1);
    }

    measure();
    el.addEventListener('scroll', measure, {passive: true});

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [images.length]);

  // Keep the selected thumbnail in view when the variant switch moves it.
  useEffect(() => {
    const el = scrollerRef.current;
    const thumb = el?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  }, [index]);

  const page = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({left: direction * el.clientWidth * 0.8, behavior: 'smooth'});
  }, []);

  return (
    <div className="relative border-t border-ink">
      <div
        ref={scrollerRef}
        className="flex gap-[1px] overflow-x-auto bg-paper [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => {
          const isActive = i === index;
          return (
            <button
              key={image.id ?? image.url}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show image ${i + 1} of ${images.length} for ${title}`}
              aria-current={isActive}
              // Grows to share the row when a piece has only a few shots, so
              // the strip never leaves a gap, but is capped so two shots read
              // as thumbnails rather than a second gallery. A longer run
              // exceeds the cap and scrolls instead.
              className="w-[78px] max-w-[132px] shrink-0 grow basis-[78px] bg-paper lg:basis-[94px]"
            >
              <div
                className={[
                  'aspect-[4/5] w-full overflow-hidden bg-shell',
                  isActive ? 'ring-1 ring-ink ring-inset' : 'opacity-60',
                ].join(' ')}
              >
                <Image
                  data={image}
                  alt=""
                  sizes="94px"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          );
        })}
      </div>

      {overflows ? (
        <button
          type="button"
          onClick={() => page(atEnd ? -1 : 1)}
          aria-label={atEnd ? 'Scroll thumbnails back' : 'Scroll thumbnails'}
          className="absolute top-0 right-0 bottom-0 flex w-[44px] items-center justify-center border-l border-ink bg-paper text-ink"
        >
          <Chevron direction={atEnd ? 'left' : 'right'} />
        </button>
      ) : null}
    </div>
  );
}

export function Chevron({direction}: {direction: 'left' | 'right'}) {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      aria-hidden="true"
      className={direction === 'left' ? 'rotate-180' : ''}
    >
      <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function Lightbox({
  images,
  index,
  title,
  onClose,
  onIndexChange,
}: {
  images: GalleryImage[];
  index: number;
  title: string;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const containerRef = useOverlay({open: true, onClose});
  const labelId = useId();

  const go = useCallback(
    (delta: number) => {
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  // Arrow keys page through the gallery while the lightbox is open.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [go]);

  const image = images[index];

  // Portalled to the body: the gallery sits inside the page's content layer,
  // whose stacking context would otherwise hold the lightbox under the header.
  // It only mounts after a click, so `document` is always available here.
  return createPortal(
    <div
      className="on-dark fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[rgba(0,0,0,0.92)]"
      />

      <div
        ref={containerRef}
        className="relative z-10 flex h-full w-full flex-col p-4 lg:p-8"
      >
        <div className="flex items-center justify-between text-paper">
          <p id={labelId} className="text-[11px] tracking-[0.22em] uppercase">
            {title} — {index + 1} / {images.length}
          </p>
          <CloseButton
            onClose={onClose}
            label="Close image viewer"
            className="text-paper"
          />
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden py-6">
          <Image
            data={image}
            alt={image.altText || title}
            sizes="100vw"
            className="max-h-full w-auto object-contain"
          />
        </div>

        {images.length > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              className="border border-paper px-5 py-2 text-[11px] tracking-[0.22em] text-paper uppercase"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="border border-paper px-5 py-2 text-[11px] tracking-[0.22em] text-paper uppercase"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
