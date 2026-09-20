/** Captures the drop grid card so the add-to-cart row can be reviewed. */
import {chromium} from 'playwright';

const b = await chromium.launch();

const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await p.goto('http://localhost:3000/', {waitUntil: 'networkidle'});
await p.waitForTimeout(1200);

// Frame the bottom of the first two cards, where the action row lives.
const grid = p.locator('.hairline-grid').first();
await grid.scrollIntoViewIfNeeded();
await p.evaluate(() => {
  const a = document.querySelector('.hairline-grid article');
  window.scrollTo(0, a.getBoundingClientRect().bottom + window.scrollY - 760);
});
await p.waitForTimeout(700);
await p.screenshot({path: 'shots/card-desktop.png'});

// Open the selector to confirm the options read correctly.
const info = await p.evaluate(() => {
  const s = document.querySelector('.hairline-grid article select');
  return {
    options: s ? [...s.options].map((o) => `${o.text}${o.disabled ? ' [disabled]' : ''}`) : null,
    value: s?.selectedOptions[0]?.text,
  };
});
console.log('variant options:', JSON.stringify(info, null, 1));

const mob = await b.newContext({viewport: {width: 390, height: 844}});
const mp = await mob.newPage();
await mp.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await mp.goto('http://localhost:3000/', {waitUntil: 'networkidle'});
await mp.evaluate(() => {
  const a = document.querySelector('.hairline-grid article');
  window.scrollTo(0, a.getBoundingClientRect().bottom + window.scrollY - 700);
});
await mp.waitForTimeout(700);
await mp.screenshot({path: 'shots/card-mobile.png'});

console.log('card shots written');
await b.close();
