/**
 * Design spec checks for the VESTIGE storefront.
 *
 * Asserts the art direction in a real browser — type scale, hairline grids,
 * square corners, overlay focus traps, and the mobile layout — rather than
 * trusting the markup alone.
 *
 * Requires a dev server on :3000 and Playwright:
 *   npm run dev
 *   npm install --no-save playwright && npx playwright install chromium
 *   npm run verify:design
 */
import {chromium} from 'playwright';

const BASE = 'http://localhost:3000';
const results = [];
const ok = (name, pass, detail = '') => results.push({name, pass, detail});

const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}});
const page = await ctx.newPage();

// Suppress the first-visit newsletter popup in this context: it fires on a
// timer and would intercept clicks mid-run. Its own behaviour is asserted
// further down in a dedicated, isolated context.
await page.addInitScript(() => {
  try { window.localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});

const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 200));
});

// ---------- Homepage ----------
await page.goto(BASE, {waitUntil: 'networkidle'});

const heroH1 = page.locator('section[aria-roledescription="carousel"] h1');
const heroFont = await heroH1.evaluate((el) => getComputedStyle(el).fontFamily);
ok('hero uses Anton', /Anton/i.test(heroFont), heroFont);

const heroSize = await heroH1.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
// The headline shares a centred line with the campaign mark, so it sets
// smaller than a full-bleed display line would.
ok('hero headline ~104px @1440', heroSize === 104, `${heroSize}px`);

const heroLH = await heroH1.evaluate((el) => {
  const s = getComputedStyle(el);
  return parseFloat(s.lineHeight) / parseFloat(s.fontSize);
});
ok('hero line-height 0.82-0.9', heroLH >= 0.81 && heroLH <= 0.91, heroLH.toFixed(3));

const heroH = await page.locator('section[aria-roledescription="carousel"]')
  .evaluate((el) => el.getBoundingClientRect().height);
ok('hero ~780px @desktop', Math.round(heroH) === 780, `${heroH}px`);

// Hero image actually loads (CSP).
const imgLoaded = await page.locator('section[aria-roledescription="carousel"] img').first()
  .evaluate((img) => img.complete && img.naturalWidth > 0);
ok('hero campaign image loads (CSP allows host)', imgLoaded);

// Mark, vertical rule and headline share one centred line, with the season
// paragraph beneath it.
const heroLine = await page.locator('section[aria-roledescription="carousel"]')
  .evaluate((sec) => {
    const mark = sec.querySelector('svg');
    const rule = sec.querySelector('span[aria-hidden="true"]');
    const h1 = sec.querySelector('h1');
    const para = sec.querySelector('p:not(.sr-only)');
    if (!mark || !h1 || !para) return null;
    const m = mark.getBoundingClientRect();
    const h = h1.getBoundingClientRect();
    const s2 = sec.getBoundingClientRect();
    return {
      sameLine: Math.abs(m.top - h.top) < h.height,
      markLeftOfHeadline: m.right <= h.left + 2,
      hasRule: !!rule && rule.getBoundingClientRect().width <= 2,
      // The mark+rule+headline group is centred as a unit. The headline
      // alone is not: the mark sits to its left, which shifts it right.
      centred: Math.abs((m.left - s2.left) - (s2.right - h.right)) < 40,
      paraCentred: getComputedStyle(para).textAlign === 'center',
    };
  });
ok('mark, rule and headline share one line',
   heroLine?.sameLine && heroLine?.markLeftOfHeadline && heroLine?.hasRule,
   JSON.stringify(heroLine));
ok('hero content is centred', heroLine?.centred && heroLine?.paraCentred,
   JSON.stringify(heroLine));

// Square corners / no shadows.
const rounded = await page.evaluate(() => {
  const bad = [];
  for (const el of document.querySelectorAll('*')) {
    const r = getComputedStyle(el).borderRadius;
    if (r && r !== '0px' && !el.matches('.is-pill, .is-round')) bad.push(el.tagName);
  }
  return bad.slice(0, 5);
});
ok('no rounded corners (except pill/dots)', rounded.length === 0, rounded.join('|'));

const shadowed = await page.evaluate(() => {
  const bad = [];
  for (const el of document.querySelectorAll('*')) {
    if (getComputedStyle(el).boxShadow !== 'none') bad.push(el.tagName);
  }
  return bad.slice(0, 5);
});
ok('no box shadows', shadowed.length === 0, shadowed.join('|'));

// Drop grid.
const grid = page.locator('.hairline-grid').first();
const gridBox = await grid.boundingBox();
ok('drop grid flush to edges', gridBox.x === 0 && Math.round(gridBox.width) === 1440,
   `x=${gridBox.x} w=${gridBox.width}`);
ok('grid gap 1px', (await grid.evaluate((el) => getComputedStyle(el).gap)) === '1px');
ok('drop grid 2 cols', (await grid.evaluate((el) =>
  getComputedStyle(el).gridTemplateColumns)).split(' ').length === 2);
// The drop is VESTIGE's own catalogue (one product per photograph).
const cardCount = await page.locator('.hairline-grid article').count();
ok('drop grid renders the catalogue', cardCount === 4, String(cardCount));

// Every card must use VESTIGE's own photography, not demo product shots.
const ownImages = await page.evaluate(() =>
  [...document.querySelectorAll('.hairline-grid article img')]
    .every((img) => new URL(img.currentSrc || img.src).pathname.startsWith('/products/')));
ok('cards use VESTIGE photography', ownImages);

// CTA geometry â€” the real add-to-cart button.
const cta = page.locator('article button[type="submit"]').first();
const ctaBox = await cta.boundingBox();
const ctaStyle = await cta.evaluate((el) => {
  const s = getComputedStyle(el);
  return {bg: s.backgroundColor, color: s.color, fs: s.fontSize,
          ls: (parseFloat(s.letterSpacing) / parseFloat(s.fontSize)).toFixed(2)};
});
// The card's bar follows the storefront reference rather than the generic
// button spec: it is 56px tall, 14px, and shares one row with the variant
// selector instead of filling the card width.
ok('card CTA 42px tall', Math.round(ctaBox.height) === 42, `${ctaBox.height}px`);
ok('CTA black bg / white text',
   ctaStyle.bg === 'rgb(0, 0, 0)' && ctaStyle.color === 'rgb(255, 255, 255)',
   JSON.stringify(ctaStyle));
ok('card CTA 13px', ctaStyle.fs === '13px', JSON.stringify(ctaStyle));

// The row is selector + bar, flush edge to edge with no white gap.
const rowFit = await page.locator('.hairline-grid article').first().evaluate((art) => {
  const row = art.querySelector('.card-actions');
  const sel = row.querySelector('select');
  const btn = row.querySelector('button[type="submit"]');
  const rowR = row.getBoundingClientRect();
  const artR = art.getBoundingClientRect();
  const selR = sel?.getBoundingClientRect();
  const btnR = btn.getBoundingClientRect();
  const pad = getComputedStyle(row);

  return {
    sameLine: !selR || Math.abs(selR.top - btnR.top) < 2,
    // Selector + bar fill the row's content box (inside its padding) with
    // no gap between them.
    fillsRow: Math.abs(
      ((selR ? selR.width : 0) + btnR.width) -
      (rowR.width - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight)),
    ) < 2,
    // The row is inset from the card, leaving white space below it.
    gapBelow: Math.round(artR.bottom - btnR.bottom),
    padBottom: pad.paddingBottom,
  };
});
ok('selector and bar share one row', rowFit.sameLine, JSON.stringify(rowFit));
ok('selector and bar fill the row', rowFit.fillsRow, JSON.stringify(rowFit));
ok('white space sits below the row', rowFit.gapBelow >= 20 && rowFit.gapBelow <= 40,
   JSON.stringify(rowFit));

// Near the card edge, but never touching it.
const inset = await page.locator('.hairline-grid article').first().evaluate((art) => {
  const row = art.querySelector('.card-actions');
  const btn = row.querySelector('button[type="submit"]');
  const sel = row.querySelector('select');
  const a = art.getBoundingClientRect();
  return {
    left: Math.round(sel.closest('div').getBoundingClientRect().left - a.left),
    right: Math.round(a.right - btn.getBoundingClientRect().right),
  };
});
ok('row is inset from the card edge but close to it',
   inset.left >= 10 && inset.left <= 22 && inset.right >= 10 && inset.right <= 22,
   JSON.stringify(inset));

// The bar should dominate the row, not sit at half.
const share = await page.locator('.hairline-grid article').first().evaluate((art) => {
  const row = art.querySelector('.card-actions');
  const btn = row.querySelector('button[type="submit"]');
  const sel = row.querySelector('select').closest('div');
  const b = btn.getBoundingClientRect().width;
  const s2 = sel.getBoundingClientRect().width;
  return Math.round((b / (b + s2)) * 100);
});
ok('bar dominates the row', share >= 64 && share <= 76, `${share}%`);

// Season block.
ok('season heading silver', (await page.locator('#season-concept')
  .evaluate((el) => getComputedStyle(el).color)) === 'rgb(138, 138, 141)');

// Announcement bar.
const annH = await page.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find(
    (d) => d.textContent.trim() === 'FREE SHIPPING OVER $300');
  return el ? Math.round(el.getBoundingClientRect().height) : -1;
});
ok('announcement bar 38px', annH === 38, `${annH}px`);

// Nav rows.
ok('3 stacked nav rows', (await page.locator('nav[aria-label="Main"] > div').count()) === 3,
   String(await page.locator('nav[aria-label="Main"] > div').count()));

// Mega panel opens.
await page.locator('nav[aria-label="Main"] button', {hasText: 'TOPS'}).first().hover();
await page.waitForTimeout(500);
ok('mega panel opens on hover', await page.locator('header nav[aria-label="Main"]')
  .isVisible() && (await page.locator('header a', {hasText: 'OUTERWEAR'}).count()) > 0);

// ---------- Cart drawer ----------
// Move the pointer off the nav first: the mega panel opened by the hover
// check above otherwise stays open over the grid.
await page.mouse.move(1430, 880);
await page.waitForTimeout(300);

await page.locator('article button[type="submit"]').first().click();
// Wait for the line to actually arrive rather than a fixed delay, so a slow
// cold compile cannot race the focus assertions below.
await page.locator('[role="dialog"] [data-overlay-panel]').waitFor({timeout: 20000});
await page.locator('[role="dialog"] li').first().waitFor({timeout: 20000});
await page.waitForTimeout(500);

const dlg = page.locator('[role="dialog"]').first();
ok('cart drawer opens', await dlg.isVisible());

const panel = dlg.locator('[data-overlay-panel]');
const panelBox = await panel.boundingBox();

// The cart drops from the top across the full width so its two columns fit.
ok('cart drawer spans the viewport', Math.abs(panelBox.width - 1440) <= 1,
   `${panelBox.width}px`);
ok('cart drawer is anchored to the top', Math.round(panelBox.y) === 0,
   `y=${panelBox.y}`);

const borderBottom = await panel.evaluate((el) => getComputedStyle(el).borderBottomWidth);
ok('drawer has a 1px bottom edge', borderBottom === '1px', borderBottom);

// Free shipping progress, and the two-column split.
ok('free shipping progress shown',
   (await dlg.locator('[role="progressbar"]').count()) === 1);

// The summary renders once the cart resolves; wait for it rather than racing.
await page.locator('[role="dialog"] a[data-testid^="checkout-"]')
  .waitFor({timeout: 20000});

const columns = await page.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"]');
  const line = dialog?.querySelector('li');
  const checkout = dialog?.querySelector('a[data-testid]');
  if (!line || !checkout) {
    return {found: false, li: !!line, checkout: !!checkout};
  }
  const l = line.getBoundingClientRect();
  const c = checkout.getBoundingClientRect();
  // The summary column starts to the right of the line item column.
  return {found: true, sideBySide: c.left > l.left, cLeft: Math.round(c.left),
          lLeft: Math.round(l.left)};
});
ok('items and summary sit side by side', columns?.sideBySide === true,
   JSON.stringify(columns));

ok('cart heading shows count',
   /CART \(\d+\)/.test(await dlg.locator('h3').first().textContent()),
   await dlg.locator('h3').first().textContent());

const focusInside = await page.evaluate(() =>
  document.querySelector('[role="dialog"]')?.contains(document.activeElement));
ok('focus moves into drawer', focusInside === true);

for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
const stillInside = await page.evaluate(() =>
  document.querySelector('[role="dialog"]')?.contains(document.activeElement));
ok('focus trap holds (30 tabs)', stillInside === true);

// Quantity stepper present.
ok('quantity stepper rendered',
   (await page.locator('[role="dialog"] button[aria-label="Increase quantity"]').count()) > 0);

await page.keyboard.press('Escape');
await page.waitForTimeout(700);
ok('Escape closes drawer', (await page.locator('[role="dialog"]').count()) === 0);

ok('header cart count updated',
   /[1-9]/.test(await page.locator('header button[aria-label^="Open cart"]').textContent()));

// ---------- Region modal ----------
await page.locator('footer button').first().click();
await page.waitForTimeout(700);
const region = page.locator('[role="dialog"]').first();
ok('region modal opens', await region.isVisible());
const rBox = await region.locator('[data-overlay-panel]').boundingBox();
ok('region modal 520px', Math.abs(rBox.width - 520) <= 1, `${rBox.width}px`);

await page.fill('#region-search', 'japan');
await page.waitForTimeout(400);
ok('region search filters', (await page.locator('[role="dialog"] ul li').count()) === 1);

const rowDivider = await page.locator('[role="dialog"] ul li').first()
  .evaluate((el) => getComputedStyle(el).borderBottomColor);
ok('region rows use #E2E2E2 dividers', rowDivider === 'rgb(226, 226, 226)', rowDivider);

await page.keyboard.press('Escape');
await page.waitForTimeout(400);
ok('Escape closes region modal', (await page.locator('[role="dialog"]').count()) === 0);

// ---------- Newsletter popup ----------
const npCtx = await browser.newContext({viewport: {width: 1440, height: 900}});
const np = await npCtx.newPage();
// Clear the flag once on this origin, not on every navigation.
await np.goto(BASE, {waitUntil: 'domcontentloaded'});
await np.evaluate(() => {
  try { window.localStorage.removeItem('vestige:newsletter-seen'); } catch {}
});
await np.reload({waitUntil: 'networkidle'});
await np.waitForSelector('[role="dialog"]', {timeout: 15000}).catch(() => {});
const npOpen = (await np.locator('[role="dialog"]').count()) > 0;
ok('newsletter popup fires after delay', npOpen);
if (npOpen) {
  const npBox = await np.locator('[data-overlay-panel]').boundingBox();
  ok('newsletter popup 440px', Math.abs(npBox.width - 440) <= 1, `${npBox.width}px`);
  const flagged = await np.evaluate(() =>
    window.localStorage.getItem('vestige:newsletter-seen'));
  ok('newsletter sets once-per-visitor flag', flagged === '1', String(flagged));
  await np.keyboard.press('Escape');
  await np.waitForTimeout(400);
  ok('Escape closes newsletter', (await np.locator('[role="dialog"]').count()) === 0);

  // Reload: must not fire again.
  await np.reload({waitUntil: 'networkidle'});
  await np.waitForTimeout(10000);
  ok('newsletter does not refire', (await np.locator('[role="dialog"]').count()) === 0);
}
await np.close();
await npCtx.close();

// ---------- Product page ----------
await page.goto(`${BASE}/products/sweatpants`, {waitUntil: 'networkidle'});

const pdpCols = await page.locator('main > div > div.grid').first()
  .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
ok('PDP grid ends in 480px', /(^|\s)480px$/.test(pdpCols), pdpCols);

const sb = await page.locator('fieldset button').first().boundingBox();
ok('option box 58x48', Math.round(sb.width) === 58 && Math.round(sb.height) === 48,
   `${sb.width}x${sb.height}`);

const before = page.url();
await page.locator('fieldset button').nth(1).click();
await page.waitForTimeout(1200);
ok('variant selection updates URL', page.url() !== before && page.url().includes('?'),
   page.url());

const accBtn = page.locator('button[aria-expanded]').filter({hasText: 'Details'}).first();
ok('DETAILS open by default', (await accBtn.getAttribute('aria-expanded')) === 'true',
   await accBtn.getAttribute('aria-expanded'));

const eyebrow = await page.locator('main p').first().textContent();
ok('PDP eyebrow present', /LIMITED SERIES/i.test(eyebrow), eyebrow?.trim());

await page.locator('button[aria-label*="Expand image"]').first().click();
await page.waitForTimeout(800);
ok('lightbox opens', (await page.locator('[role="dialog"]').count()) > 0);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
ok('Escape closes lightbox', (await page.locator('[role="dialog"]').count()) === 0);

// ---------- Pages ----------
for (const h of ['about', 'faq', 'shipping', 'refund', 'privacy']) {
  const r = await page.goto(`${BASE}/pages/${h}`, {waitUntil: 'domcontentloaded'});
  ok(`/pages/${h} renders`, r.status() === 200, String(r.status()));
}

// ---------- Mobile ----------
const mob = await ctx.newPage();
await mob.setViewportSize({width: 390, height: 844});
await mob.addInitScript(() => {
  try { window.localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await mob.goto(BASE, {waitUntil: 'networkidle'});

ok('mobile grid 1 column',
   (await mob.locator('.hairline-grid').first()
     .evaluate((el) => getComputedStyle(el).gridTemplateColumns)).split(' ').length === 1);

ok('no horizontal scroll @390',
   await mob.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
   await mob.evaluate(() => `${document.documentElement.scrollWidth}/${window.innerWidth}`));

const mHero = await mob.locator('section[aria-roledescription="carousel"] h1')
  .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
ok('mobile hero ~38px', mHero === 38, `${mHero}px`);

const mHeroH = await mob.locator('section[aria-roledescription="carousel"]')
  .evaluate((el) => el.getBoundingClientRect().height);
ok('mobile hero ~620px', Math.round(mHeroH) === 620, `${mHeroH}px`);

await mob.locator('button[aria-label="Open menu"]').click();
await mob.waitForTimeout(700);
ok('mobile menu opens', (await mob.locator('[role="dialog"]').count()) > 0);
const mw = (await mob.locator('[data-overlay-panel]').boundingBox()).width;
ok('mobile menu full screen', Math.abs(mw - 390) <= 1, `${mw}px`);

const passed = results.filter((r) => r.pass).length;
console.log(JSON.stringify({
  summary: `${passed}/${results.length} passed`,
  failures: results.filter((r) => !r.pass),
  errors: [...new Set(errors)].slice(0, 8),
}, null, 2));

await browser.close();



