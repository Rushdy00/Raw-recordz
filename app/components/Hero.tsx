import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HeroSlide} from '~/lib/vestige';

const SLIDE_DURATION = 6500;

/**
 * The campaign mark that opens the hero line.
 *
 * An original VESTIGE glyph: two interlocking strokes cut from one ribbon,
 * echoing the overlapping folds the season is built on. Drawn rather than
 * loaded so it stays crisp at any size and needs no extra request.
 */
function HeroMark() {
  return (
    <svg
      viewBox="0 0 132 84"
      aria-hidden="true"
      focusable="false"
      className="h-[40px] w-auto shrink-0 lg:h-[84px]"
    >
      <path
        d="M10 30C26 8 58 6 74 24c12 14 26 18 38 10 9-6 11-18 3-26"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M122 54C106 76 74 78 58 60 46 46 32 42 20 50c-9 6-11 18-3 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Full-bleed campaign slideshow.
 *
 * Slides crossfade in place — there is no horizontal motion. Autoplay pauses on
 * hover and on focus, and is disabled entirely under `prefers-reduced-motion`.
 */
export function Hero({slides}: {slides: HeroSlide[]}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length <= 1) return;

    timer.current = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reducedMotion, slides.length]);

  const goTo = useCallback((next: number) => setIndex(next), []);

  if (!slides.length) return null;
  const active = slides[Math.min(index, slides.length - 1)];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Campaign"
      className="on-dark relative h-[620px] w-full overflow-hidden bg-ink lg:h-[780px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((slide, slideIndex) => {
        const isActive = slideIndex === index;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {slide.image ? (
              <Image
                data={slide.image}
                alt={slide.image.altText}
                sizes="100vw"
                /* Only the first slide is above the fold. */
                loading={slideIndex === 0 ? 'eager' : 'lazy'}
                /*
                 * React 18 does not recognise the camelCase `fetchPriority`
                 * prop, so the lowercase DOM attribute is passed instead.
                 */
                {...{fetchpriority: slideIndex === 0 ? 'high' : 'auto'}}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-ink" />
            )}
            {/* Scrim keeps the white type legible over any frame. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[rgba(0,0,0,0.34)]"
            />
          </div>
        );
      })}

      {/*
        Slide content, centred: the monogram and headline share one line
        divided by a vertical rule, with the season paragraph beneath and the
        dots pinned to the bottom edge.
      */}
      <div className="relative flex h-full flex-col items-center justify-center px-5 py-10 text-center text-paper lg:px-12">
        <Link
          to={active.link}
          prefetch="intent"
          className="flex w-full items-center justify-center gap-4 lg:gap-7"
        >
          <HeroMark />

          {/* Vertical rule between the mark and the headline. */}
          <span
            aria-hidden="true"
            className="h-[46px] w-px shrink-0 bg-paper lg:h-[96px]"
          />

          <h1 className="hero-slide font-display text-[38px] leading-[0.9] uppercase lg:text-[104px] lg:leading-[0.88]">
            {active.headline}
          </h1>
        </Link>

        <p className="mt-6 max-w-[46ch] text-[12px] leading-[1.6] text-paper lg:mt-7 lg:max-w-[128ch] lg:text-[15px] lg:leading-[1.5]">
          {active.copy.join(' ')}
        </p>

        {/* Dots. The mark stays 8px; the button around it is a 32px target. */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center lg:bottom-5">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(slideIndex)}
              aria-label={`Show slide ${slideIndex + 1}: ${slide.headline}`}
              aria-current={slideIndex === index}
              className="flex h-8 w-8 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`is-round block h-2 w-2 border border-paper ${
                  slideIndex === index ? 'bg-paper' : 'bg-transparent'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Announce slide changes to assistive tech without moving focus. */}
      <p className="sr-only" aria-live="polite">
        {`Slide ${index + 1} of ${slides.length}: ${active.headline}`}
      </p>
    </section>
  );
}
