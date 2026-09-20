import {chromium} from 'playwright';

const BASE = 'http://localhost:3000';
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 390, height: 844}});
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});

const out = {};
for (const path of ['/', '/products/sweatpants', '/collections/all', '/cart', '/search?q=hood', '/pages/about']) {
  await p.goto(BASE + path, {waitUntil: 'networkidle'});
  await p.waitForTimeout(800);
  out[path] = await p.evaluate(() => {
    const doc = document.documentElement;
    // Anything wider than the viewport
    const overflow = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > window.innerWidth + 1 && r.height > 0) {
        overflow.push(el.tagName + '.' + String(el.className).slice(0, 45) + ` w=${Math.round(r.width)}`);
      }
    }
    // Tap targets that are too small
    const small = [];
    for (const el of document.querySelectorAll('a, button')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)) {
        small.push((el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 20) || el.tagName) +
          ` ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return {
      scrollW: doc.scrollWidth,
      innerW: window.innerWidth,
      overflow: overflow.slice(0, 6),
      smallTargets: [...new Set(small)].slice(0, 8),
    };
  });
}

// Floating pills on mobile
await p.goto(BASE, {waitUntil: 'networkidle'});
out.pills = await p.evaluate(() => {
  const chat = [...document.querySelectorAll('button')].find((b) => /chat/i.test(b.textContent));
  const rew = [...document.querySelectorAll('a')].find((a) => /rewards/i.test(a.textContent));
  const r1 = chat?.getBoundingClientRect();
  const r2 = rew?.getBoundingClientRect();
  return {
    chat: r1 ? `${Math.round(r1.width)}x${Math.round(r1.height)} @${Math.round(r1.left)},${Math.round(r1.top)}` : null,
    rewards: r2 ? `${Math.round(r2.width)}x${Math.round(r2.height)} @${Math.round(r2.left)},${Math.round(r2.top)}` : null,
    rewardsRadius: rew ? getComputedStyle(rew).borderRadius : null,
    chatRadius: chat ? getComputedStyle(chat).borderRadius : null,
    overlap: r1 && r2 ? (r1.right > r2.left && r1.top < r2.bottom && r2.top < r1.bottom) : null,
  };
});

// PDP stacking on mobile
await p.goto(`${BASE}/products/sweatpants`, {waitUntil: 'networkidle'});
out.pdpMobile = await p.evaluate(() => {
  const grid = document.querySelector('main > div > div.grid');
  return {
    cols: getComputedStyle(grid).gridTemplateColumns,
    imageWell: Math.round(document.querySelector('main img')?.getBoundingClientRect().width ?? 0),
  };
});

// Cart drawer on mobile
await p.goto(BASE, {waitUntil: 'networkidle'});
await p.locator('article button[type="submit"]').first().click();
await p.waitForTimeout(3000);
out.drawerMobile = await p.evaluate(() => {
  const panel = document.querySelector('[data-overlay-panel]');
  const r = panel?.getBoundingClientRect();
  return r ? {w: Math.round(r.width), fitsViewport: r.width <= window.innerWidth} : null;
});

console.log(JSON.stringify(out, null, 2));
await b.close();
