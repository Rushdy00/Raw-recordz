/** Captures a card at rest, mid-crossfade, and fully hovered. */
import {chromium} from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const p = await ctx.newPage();
await p.addInitScript(() => { try { localStorage.setItem('vestige:newsletter-seen','1'); } catch {} });
await p.goto('http://localhost:3000/', {waitUntil: 'networkidle'});
await p.waitForTimeout(1200);

const card = p.locator('.hairline-grid article').first();
await card.scrollIntoViewIfNeeded();
await p.waitForTimeout(400);

await p.screenshot({path: 'shots/hover-0-rest.png'});
await card.hover();
await p.waitForTimeout(200);
await p.screenshot({path: 'shots/hover-1-mid.png'});
await p.waitForTimeout(900);
await p.screenshot({path: 'shots/hover-2-full.png'});
console.log('hover shots written');
await b.close();
