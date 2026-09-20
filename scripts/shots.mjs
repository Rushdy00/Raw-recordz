import {chromium} from 'playwright';

const BASE = 'http://localhost:3000';
const OUT = 'shots';
const b = await chromium.launch();

// Desktop
const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});

await p.goto(BASE, {waitUntil: 'networkidle'});
await p.waitForTimeout(1200);

// Sanity: are styles actually applied?
const check = await p.evaluate(() => {
  const h1 = document.querySelector('section[aria-roledescription="carousel"] h1');
  const cta = document.querySelector('article button[type="submit"]');
  return {
    hero: getComputedStyle(h1).fontSize,
    heroFont: getComputedStyle(h1).fontFamily.split(',')[0],
    ctaBg: getComputedStyle(cta).backgroundColor,
    ctaH: Math.round(cta.getBoundingClientRect().height),
  };
});
console.log('style check:', JSON.stringify(check));

await p.screenshot({path: `${OUT}/01-home-hero.png`});
await p.evaluate(() => window.scrollBy(0, 800));
await p.waitForTimeout(700);
await p.screenshot({path: `${OUT}/02-home-drop-grid.png`});
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(900);
await p.screenshot({path: `${OUT}/03-home-season-footer.png`});

await p.goto(`${BASE}/products/sweatpants`, {waitUntil: 'networkidle'});
await p.waitForTimeout(900);
await p.screenshot({path: `${OUT}/04-product.png`});

// Cart drawer
await p.goto(BASE, {waitUntil: 'networkidle'});
await p.locator('article button[type="submit"]').first().click();
await p.waitForTimeout(3000);
await p.screenshot({path: `${OUT}/05-cart-drawer.png`});
await p.keyboard.press('Escape');
await p.waitForTimeout(500);

// Country modal
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.locator('footer button').first().click();
await p.waitForTimeout(800);
await p.screenshot({path: `${OUT}/06-country-modal.png`});
await p.keyboard.press('Escape');

// Newsletter popup, fresh visitor
const npCtx = await b.newContext({viewport: {width: 1440, height: 900}});
const np = await npCtx.newPage();
await np.goto(BASE, {waitUntil: 'networkidle'});
await np.waitForSelector('[role="dialog"]', {timeout: 15000}).catch(() => {});
await np.waitForTimeout(600);
await np.screenshot({path: `${OUT}/07-newsletter.png`});
await npCtx.close();

// Mobile
const mob = await b.newContext({viewport: {width: 390, height: 844}});
const mp = await mob.newPage();
await mp.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await mp.goto(BASE, {waitUntil: 'networkidle'});
await mp.waitForTimeout(1000);
await mp.screenshot({path: `${OUT}/08-mobile-home.png`});
await mp.locator('button[aria-label="Open menu"]').click();
await mp.waitForTimeout(700);
await mp.screenshot({path: `${OUT}/09-mobile-menu.png`});

console.log('screenshots written to', OUT);
await b.close();
