import {chromium} from 'playwright';

const BASE = 'http://localhost:3000';
const b = await chromium.launch();

// Reduced motion: the slideshow must not advance on its own.
const rm = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
const rp = await rm.newPage();
await rp.addInitScript(() => { try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {} });
await rp.goto(BASE, {waitUntil: 'networkidle'});
const first = await rp.locator('section[aria-roledescription="carousel"] h1').textContent();
await rp.waitForTimeout(9000);
const later = await rp.locator('section[aria-roledescription="carousel"] h1').textContent();
console.log('reduced-motion: slide held =', first === later, `(${first} -> ${later})`);

// Autoplay does advance without the preference.
const nc = await b.newContext({viewport: {width: 1440, height: 900}});
const np = await nc.newPage();
await np.addInitScript(() => { try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {} });
await np.goto(BASE, {waitUntil: 'networkidle'});
// Leave the pointer where it starts (top-left, over the announcement bar).
// Moving it onto the hero would correctly trigger the hover pause.
const a = await np.locator('section[aria-roledescription="carousel"] h1').textContent();
await np.waitForTimeout(9000);
const c = await np.locator('section[aria-roledescription="carousel"] h1').textContent();
console.log('autoplay advances =', a !== c, `(${a} -> ${c})`);

// Unlabelled interactive elements across the main routes.
for (const path of ['/', '/products/sweatpants', '/collections/all', '/search?q=hood']) {
  await np.goto(BASE + path, {waitUntil: 'networkidle'});
  const bad = await np.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('button, a[href], input, select')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      // Decorative duplicates are hidden from the a11y tree on purpose.
      if (el.closest('[aria-hidden="true"]')) continue;
      const name = (el.getAttribute('aria-label') || el.textContent?.trim() ||
        el.getAttribute('title') || '').trim();
      const labelled = el.id && document.querySelector(`label[for="${el.id}"]`);
      if (!name && !labelled) out.push(el.tagName + '.' + String(el.className).slice(0, 40));
    }
    return out;
  });
  console.log(`${path}: unlabelled =`, bad.length, bad.slice(0, 4));
}

// Images missing alt.
await np.goto(BASE, {waitUntil: 'networkidle'});
const noAlt = await np.evaluate(() =>
  [...document.querySelectorAll('img')].filter((i) => i.getAttribute('alt') === null).length);
console.log('images with no alt attribute =', noAlt);

// Heading order on the homepage.
const headings = await np.evaluate(() =>
  [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName + ':' + h.textContent.trim().slice(0, 28)));
console.log('headings =', JSON.stringify(headings, null, 1));

await b.close();


