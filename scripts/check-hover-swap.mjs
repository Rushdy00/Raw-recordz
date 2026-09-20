/**
 * Verifies the card's hover crossfade: a second image exists, it fades rather
 * than snaps, and prefers-reduced-motion suppresses the swap entirely.
 */
import {chromium} from 'playwright';

const results = [];
const ok = (name, pass, detail = '') => results.push({name, pass, detail});
const BASE = 'http://localhost:3000';

const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });

await p.goto(BASE, {waitUntil: 'networkidle'});
await p.waitForTimeout(1200);

const card = p.locator('.hairline-grid article').first();
const imgs = card.locator('img');
ok('card stacks two images', (await imgs.count()) === 2, `${await imgs.count()} img(s)`);

const hoverImg = imgs.nth(1);

// The two layers must be different photographs.
const srcs = await card.evaluate((el) =>
  [...el.querySelectorAll('img')].map((i) => new URL(i.currentSrc || i.src).pathname));
ok('the two layers are different shots', srcs[0] !== srcs[1],
   `${srcs[0]?.slice(-22)} vs ${srcs[1]?.slice(-22)}`);

// Hidden at rest.
const atRest = await hoverImg.evaluate((el) => getComputedStyle(el).opacity);
ok('second image hidden at rest', atRest === '0', atRest);

// It is a transition, not a snap.
const trans = await hoverImg.evaluate((el) => {
  const s = getComputedStyle(el);
  return {prop: s.transitionProperty, dur: s.transitionDuration};
});
ok('opacity transition is declared',
   trans.prop.includes('opacity') && parseFloat(trans.dur) >= 0.3,
   JSON.stringify(trans));

// Mid-hover it should be partially faded — proof it animates.
await card.hover();
await p.waitForTimeout(120);
const mid = parseFloat(await hoverImg.evaluate((el) => getComputedStyle(el).opacity));
ok('fades gradually (partial opacity mid-hover)', mid > 0 && mid < 1, String(mid));

await p.waitForTimeout(900);
const full = await hoverImg.evaluate((el) => getComputedStyle(el).opacity);
ok('fully visible after hover settles', full === '1', full);

// And back out. The cards are ~1000px tall, so move to a point provably
// outside this card rather than guessing a corner that is still inside it.
const cardBox = await card.boundingBox();
await p.mouse.move(cardBox.x + cardBox.width / 2, Math.max(4, cardBox.y - 30));
await p.waitForTimeout(1000);
ok('pointer actually left the card',
   !(await card.evaluate((el) => el.matches(':hover'))));
const back = await hoverImg.evaluate((el) => getComputedStyle(el).opacity);
ok('fades back out on mouse leave', back === '0', back);

// No layout shift: both layers occupy the same box.
const boxes = await card.evaluate((el) => {
  const [a, c] = el.querySelectorAll('img');
  const r1 = a.getBoundingClientRect(), r2 = c.getBoundingClientRect();
  return {w: Math.abs(r1.width - r2.width), h: Math.abs(r1.height - r2.height)};
});
ok('layers share the same box (no shift)', boxes.w < 1 && boxes.h < 1, JSON.stringify(boxes));

// Reduced motion: the swap must not happen at all.
const rmCtx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
const rp = await rmCtx.newPage();
await rp.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await rp.goto(BASE, {waitUntil: 'networkidle'});
await rp.waitForTimeout(900);
const rCard = rp.locator('.hairline-grid article').first();
await rCard.hover();
await rp.waitForTimeout(900);
const rOpacity = await rCard.locator('img').nth(1).evaluate((el) => getComputedStyle(el).opacity);
ok('reduced motion suppresses the swap', rOpacity === '0', rOpacity);

// Touch devices cannot hover, so the second layer should not be displayed.
const tCtx = await b.newContext({
  viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true,
});
const tp = await tCtx.newPage();
await tp.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await tp.goto(BASE, {waitUntil: 'networkidle'});
await tp.waitForTimeout(1500);
const tDisplay = await tp.locator('.hairline-grid article').first()
  .locator('.hover-swap').first()
  .evaluate((el) => getComputedStyle(el).display);
ok('touch devices do not show the hover layer', tDisplay === 'none', tDisplay);

const passed = results.filter((r) => r.pass).length;
console.log(JSON.stringify({
  summary: `${passed}/${results.length} passed`,
  failures: results.filter((r) => !r.pass),
  errors: [...new Set(errors)].slice(0, 5),
}, null, 2));

await b.close();
