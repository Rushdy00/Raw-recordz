# VESTIGE

A Shopify Hydrogen storefront for VESTIGE — contemporary avant-garde clothing
built from ancient heritage.

Minimal white storefront wrapped around dark campaign photography: black on
white, 1px hairline dividers, square corners everywhere, no shadows. Anton for
display, Helvetica/Arial for every piece of UI.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000, against Mock.shop
```

The storefront runs without credentials: with no `PUBLIC_STORE_DOMAIN` set,
Hydrogen falls back to Mock.shop in development. To point it at a real store:

```bash
npx shopify hydrogen link
npx shopify hydrogen env pull
```

`npm run preview` runs the production build, which **requires** a real
`PUBLIC_STORE_DOMAIN` in `.env` — the Mock.shop fallback is development-only.

## Content the storefront reads

Everything below is optional. Each has a typed fallback in `app/lib/vestige.ts`,
so the design renders fully before a store has any of it, and switches to live
data as soon as it exists.

| Source | Shape | Drives |
| --- | --- | --- |
| `hero_slides` metaobject | `image`, `eyebrow`, `headline`, `copy_1`–`copy_4`, `link` | Hero slideshow |
| `season.core`, `season.philosophy`, `season.design_principle` | shop metafields, single-line text | Season concept block |
| `product.edition_size` | product metafield | The "120 UNITS MADE" line on the PDP |
| `2026fw-drop-1` collection | collection | Homepage drop grid (falls back to newest products) |

Shopify pages win over the built-in copy: create a page with handle `about`,
`faq`, `shipping`, `refund` or `privacy` and it replaces the placeholder text.

Newsletter signups create a marketing-consented Shopify customer. Set
`KLAVIYO_API_KEY` and `KLAVIYO_LIST_ID` to also forward the address to Klaviyo;
without them that step is skipped.

## Design system

Tailwind v4 is configured CSS-first in `app/styles/tailwind.css` — there is no
`tailwind.config.js`. `@theme` holds the palette (`ink`, `paper`, `silver`,
`shell`), the Anton display face, the tracking scale and the zeroed radius and
shadow scales.

Two things there are worth knowing before editing styles:

- **`reset.css` and `app.css` are imported *into* that stylesheet**, and the
  reset declares its rules inside `@layer base`. Unlayered CSS outranks every
  `@layer`, so linking the reset separately lets `h1 {font-size: inherit}`
  silently beat utilities like `text-[188px]`.
- **Tailwind runs through PostCSS**, not `@tailwindcss/vite`. The Vite plugin
  discovers classes by walking Vite's module graph, which does not see the app's
  components under Hydrogen's worker SSR — utilities used only in `.tsx` files
  were dropped from the build.

Square corners are enforced globally. The two intentional exceptions are
`.is-round` (the hero dots) and the newsletter popup's liquid glass
(`.glass-*`).

## Verifying the design

The art direction is asserted in a real browser rather than trusted from the
markup — type scale, hairline grids, square corners, overlay focus traps, cart
mutations, and the 390px layout:

```bash
npm run dev                                              # in one terminal
npm install --no-save playwright && npx playwright install chromium
npm run verify:design                                    # 57 checks
```

`scripts/audit-mobile.mjs` and `scripts/audit-a11y.mjs` cover tap-target sizes,
overflow at 390px, accessible names, and the `prefers-reduced-motion` path.

## Placeholder assets

Campaign imagery is placeholder photography from Unsplash, allow-listed in the
CSP in `app/entry.server.tsx`. Replace both the URLs in `app/lib/vestige.ts` and
that CSP entry when the real campaign lands in Shopify Files. All copy is
original.

The hero frames were picked for mean luminance under ~80/255 so the white Anton
display type and the `rgba(0,0,0,0.34)` scrim stay legible over them. When
swapping in new frames, check them first:

```bash
node scripts/pick-images.mjs <unsplash-photo-slug> ...
```

It prints each candidate's luminance and writes a contact sheet to
`shots/candidates.png`, so the choice is measured rather than guessed.
