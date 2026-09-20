import {useCallback, useEffect, useId, useState} from 'react';
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
 * Stacked product gallery: one full-width hero frame, then a 2-up detail grid
 * divided by 1px black lines. Any frame opens in a lightbox.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images.length) {
    return <div className="aspect-[3/4] w-full bg-shell" />;
  }

  const [hero, ...details] = images;

  return (
    <>
      <div>
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`Expand image 1 of ${images.length} for ${title}`}
          className="block w-full"
        >
          <div className="aspect-[3/4] w-full overflow-hidden bg-shell">
            <Image
              data={hero}
              alt={hero.altText || title}
              sizes="(min-width: 1024px) 60vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>
        </button>

        {details.length ? (
          <div className="hairline-grid mt-[1px] grid-cols-2 border-t-0">
            {details.map((image, index) => (
              <button
                key={image.id ?? image.url}
                type="button"
                onClick={() => setLightboxIndex(index + 1)}
                aria-label={`Expand image ${index + 2} of ${images.length} for ${title}`}
                className="block w-full bg-paper"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-shell">
                  <Image
                    data={image}
                    alt={image.altText || title}
                    sizes="(min-width: 1024px) 30vw, 50vw"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
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

  return (
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
    </div>
  );
}
