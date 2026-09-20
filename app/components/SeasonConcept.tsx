import {SEASON_TAG, SEASON_TITLE, type SeasonStatement} from '~/lib/vestige';

/**
 * The editorial pause between the drop grid and the footer: heavy whitespace,
 * a silver display heading, and three label/statement pairs.
 */
export function SeasonConcept({
  statements,
  title = SEASON_TITLE,
}: {
  statements: SeasonStatement[];
  title?: string;
}) {
  return (
    <section
      aria-labelledby="season-concept"
      className="bg-paper px-5 py-[100px] text-center lg:px-8 lg:py-[150px]"
    >
      <h2
        id="season-concept"
        className="font-display text-[46px] leading-[0.9] text-silver uppercase lg:text-[82px] lg:leading-[0.82]"
      >
        {title}
      </h2>

      <div className="mx-auto mt-16 flex max-w-[760px] flex-col gap-12 lg:mt-24 lg:gap-16">
        {statements.map((item) => (
          <div key={item.label} className="flex flex-col gap-4">
            <p className="text-[11px] tracking-[0.3em] text-silver uppercase">
              {item.label}
            </p>
            <p className="text-[19px] leading-[1.5] text-ink">
              {item.statement}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-16 inline-block border border-ink px-4 py-2 text-[11px] tracking-[0.3em] uppercase lg:mt-24">
        {SEASON_TAG}
      </p>
    </section>
  );
}

/** Full-width bar that smooth-scrolls the page back to the top. */
export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        window.scrollTo({top: 0, behavior: reduced ? 'auto' : 'smooth'});
      }}
      className="flex h-[56px] w-full items-center justify-center border-t border-b border-ink text-[12px] tracking-[0.3em] uppercase"
    >
      Back to top
    </button>
  );
}
