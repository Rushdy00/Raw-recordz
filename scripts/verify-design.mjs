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
ok('hero headline ~188px @1440', heroSize === 188, `${heroSize}px`);

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

const eyebrowLS = await page.locator('section[aria-roledescription="carousel"] p').first()
  .evaluate((el) => {
    const s = getComputedStyle(el);
    return parseFloat(s.letterSpacing) / parseFloat(s.fontSize);
  });
ok('hero eyebrow tracking 0.62em', Math.abs(eyebrowLS - 0.62) < 0.02, eyebrowLS.toFixed(3));

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
ok('6 product cards', (await page.locator('.hairline-grid article').count()) === 6,
   String(await page.locator('.hairline-grid article').count()));

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
ok('card CTA 56px tall', Math.round(ctaBox.height) === 56, `${ctaBox.height}px`);
ok('CTA black bg / white text',
   ctaStyle.bg === 'rgb(0, 0, 0)' && ctaStyle.color === 'rgb(255, 255, 255)',
   JSON.stringify(ctaStyle));
ok('card CTA 14px', ctaStyle.fs === '14px', JSON.stringify(ctaStyle));

// The row is selector + bar, flush edge to edge with no white gap.
const rowFit = await page.locator('.hairline-grid article').first().evaluate((art) => {
  const row = art.querySelector('.card-actions');
  const sel = row.querySelector('select');
  const btn = row.querySelector('button[type="submit"]');
  const rowR = row.getBoundingClientRect();
  const selR = sel?.getBoundingClientRect();
  const btnR = btn.getBoundingClientRect();
  return {
    row: Math.round(rowR.width),
    covered: Math.round((selR ? selR.width : 0) + btnR.width),
    sameLine: !selR || Math.abs(selR.top - btnR.top) < 2,
    barRightFlush: Math.abs(btnR.right - rowR.right) < 2,
  };
});
ok('selector and bar share one row', rowFit.sameLine, JSON.stringify(rowFit));
ok('bar reaches the card edge (no white gap)', rowFit.barRightFlush,
   JSON.stringify(rowFit));

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
ok('drawer 440px wide', Math.abs(panelBox.width - 440) <= 1, `${panelBox.width}px`);

const borderLeft = await panel.evaluate((el) => getComputedStyle(el).borderLeftWidth);
ok('drawer has 1px left border', borderLeft === '1px', borderLeft);

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
ok('mobile hero ~60px', mHero === 60, `${mHero}px`);

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



