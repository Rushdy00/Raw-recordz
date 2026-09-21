/** Verifies the footer bands and that the newsletter signup posts. */
import {chromium} from 'playwright';
const results = [];
const ok = (n,p,d='') => results.push({name:n,pass:p,detail:d});

const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:1000}});
const p = await ctx.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('vestige:newsletter-seen','1')}catch{}});
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,150));});

await p.goto('http://localhost:3000/',{waitUntil:'networkidle'});
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(1000);

const f = p.locator('footer');
ok('socials rendered', (await f.locator('a[target="_blank"]').count()) === 5,
   String(await f.locator('a[target="_blank"]').count()));
ok('every social is labelled',
   await f.locator('a[target="_blank"]').evaluateAll(
     els => els.every(e => (e.getAttribute('aria-label')||'').length > 1)));
ok('payment marks listed',
   (await f.locator('[aria-label="Accepted payment methods"] li').count()) === 8);
ok('footer link row', (await f.locator('nav[aria-label="Footer"] a').count()) === 6);
ok('region selector present',
   (await f.locator('button', {hasText:'USD'}).count()) === 1);

// Newsletter: submit a real address and expect the success state.
await f.locator('#footer-email').fill(`vestige.test.${Date.now()}@example.com`);
await f.locator('button[type="submit"]', {hasText:'Subscribe'}).click();
await p.locator('footer [role="status"]').waitFor({timeout:25000}).catch(()=>{});
const confirmed = (await p.locator('footer [role="status"]').count()) === 1;
ok('newsletter signup confirms', confirmed,
   confirmed ? '' : (await f.innerText()).slice(0,120));

const passed = results.filter(r=>r.pass).length;
console.log(JSON.stringify({summary:`${passed}/${results.length} passed`,
  failures:results.filter(r=>!r.pass), errors:[...new Set(errs)].slice(0,4)},null,2));
await b.close();
