import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HeroSlide} from '~/lib/vestige';

const SLIDE_DURATION = 6500;

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

      {/* Slide content */}
      <div className="relative flex h-full flex-col justify-between px-5 py-10 text-paper lg:px-12 lg:py-14">
        <p className="text-[11px] tracking-[0.62em] uppercase">
          {active.eyebrow}
        </p>

        <div className="max-w-full lg:max-w-[70%]">
          <Link to={active.link} prefetch="intent" className="block">
            <h1 className="hero-slide font-display text-[60px] leading-[0.9] uppercase lg:text-[188px] lg:leading-[0.82]">
              {active.headline}
            </h1>
          </Link>

          <div className="mt-6 space-y-[6px] lg:mt-8">
            {active.copy.map((line) => (
              <p
                key={line}
                className="text-[12px] leading-[1.5] tracking-[0.14em] uppercase"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 pt-8">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(slideIndex)}
              aria-label={`Show slide ${slideIndex + 1}: ${slide.headline}`}
              aria-current={slideIndex === index}
              className={`is-round h-2 w-2 border border-paper ${
                slideIndex === index ? 'bg-paper' : 'bg-transparent'
              }`}
            />
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
