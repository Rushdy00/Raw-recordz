/** Captures each hero slide so the campaign frames can be reviewed. */
import {chromium} from 'playwright';

const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 1440, height: 780}});
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
await p.goto('http://localhost:3000/', {waitUntil: 'networkidle'});
await p.waitForTimeout(2000);

const dots = p.locator('section[aria-roledescription="carousel"] button[aria-label^="Show slide"]');
const n = await dots.count();
for (let i = 1; i < n; i++) {
  await dots.nth(i).click();
  await p.waitForTimeout(1600);
  await p.locator('section[aria-roledescription="carousel"]')
    .screenshot({path: `shots/slide-${i + 1}.png`});
}
console.log('slide shots written');
await b.close();
