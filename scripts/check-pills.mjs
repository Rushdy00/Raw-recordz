/** Confirms the fixed pills never cover sub-footer content. */
import {chromium} from 'playwright';

const b = await chromium.launch();
for (const vp of [{width: 1440, height: 900}, {width: 390, height: 844}]) {
  const ctx = await b.newContext({viewport: vp});
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
  });
  await p.goto('http://localhost:3000/', {waitUntil: 'networkidle'});
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(900);

  const r = await p.evaluate(() => {
    const hit = (a, c) => a.right > c.left && a.left < c.right && a.top < c.bottom && a.bottom > c.top;
    const chat = [...document.querySelectorAll('button')].find((x) => /chat/i.test(x.textContent));
    const rew = [...document.querySelectorAll('a')].find((x) => /rewards/i.test(x.textContent));
    const pills = [chat, rew].filter(Boolean).map((e) => e.getBoundingClientRect());
    const clashes = [];
    for (const el of document.querySelectorAll('footer button, footer p, footer a')) {
      const box = el.getBoundingClientRect();
      if (box.width === 0) continue;
      for (const pill of pills) {
        if (hit(box, pill)) {
          clashes.push((el.textContent || '').trim().slice(0, 40));
        }
      }
    }
    return [...new Set(clashes)];
  });

  console.log(`${vp.width}px -> overlapping sub-footer items:`, r.length ? r : 'none');
  await ctx.close();
}
await b.close();
