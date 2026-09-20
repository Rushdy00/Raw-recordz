/** Confirms every hero slide loads and is dark enough for white type. */
import {chromium} from 'playwright';

const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await p.goto('http://localhost:3000/', {waitUntil: 'networkidle'});
await p.waitForTimeout(2500);

const dots = await p.locator('section[aria-roledescription="carousel"] button[aria-label^="Show slide"]').count();
for (let i = 0; i < dots; i++) {
  await p.locator('section[aria-roledescription="carousel"] button[aria-label^="Show slide"]').nth(i).click();
  await p.waitForTimeout(1400);
  const r = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('section[aria-roledescription="carousel"] img')];
    const vis = imgs.find((im) => {
      const parent = im.closest('div');
      return parent && getComputedStyle(parent).opacity === '1';
    }) || imgs[0];
    const c = document.createElement('canvas');
    c.width = 60; c.height = 40;
    const ctx2 = c.getContext('2d');
    let lum = -1;
    try {
      ctx2.drawImage(vis, 0, 0, 60, 40);
      const d = ctx2.getImageData(0, 0, 60, 40).data;
      let s = 0;
      for (let k = 0; k < d.length; k += 4) s += 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2];
      lum = Math.round(s / (d.length / 4));
    } catch {}
    return {
      headline: document.querySelector('section[aria-roledescription="carousel"] h1')?.textContent,
      loaded: vis?.complete && vis?.naturalWidth > 0,
      lum,
    };
  });
  console.log(`slide ${i + 1}: ${r.headline} | loaded=${r.loaded} | luminance=${r.lum}`);
}
await b.close();
