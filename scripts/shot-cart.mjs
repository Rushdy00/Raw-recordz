/** Captures the cart drawer at desktop and mobile widths. */
import {chromium} from 'playwright';
const b = await chromium.launch();

for (const vp of [{w:1440,h:900,name:'desktop'},{w:390,h:844,name:'mobile'}]) {
  const ctx = await b.newContext({viewport:{width:vp.w,height:vp.h}});
  const p = await ctx.newPage();
  await p.addInitScript(()=>{try{localStorage.setItem('vestige:newsletter-seen','1')}catch{}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,140)));
  await p.goto('http://localhost:3000/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  await p.locator('article button[type="submit"]').first().click();
  await p.waitForSelector('[role="dialog"] li', {timeout: 20000}).catch(()=>{});
  await p.waitForTimeout(1500);
  // Bump quantity to 2, matching the reference.
  await p.locator('[role="dialog"] button[aria-label="Increase quantity"]').first().click().catch(()=>{});
  await p.waitForTimeout(2500);
  await p.screenshot({path:`shots/cart-${vp.name}.png`});
  if (errs.length) console.log(vp.name, 'errors:', errs.slice(0,3));
  await ctx.close();
}
console.log('cart shots written');
await b.close();
