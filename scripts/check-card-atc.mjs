/**
 * Verifies the grid card's add-to-cart flow: choosing a variant must add THAT
 * variant, update the card's price, and show the right size in the drawer.
 */
import {chromium} from 'playwright';

const results = [];
const ok = (name, pass, detail = '') => results.push({name, pass, detail});

const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 1440, height: 900}});
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { localStorage.setItem('vestige:newsletter-seen', '1'); } catch {}
});
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });

await p.goto('http://localhost:3000/', {waitUntil: 'networkidle'});
await p.waitForTimeout(1200);

const card = p.locator('.hairline-grid article').first();
const select = card.locator('select');

ok('card has a variant selector', (await select.count()) === 1);

// Sold-out variants must not be selectable.
const disabled = await select.locator('option[disabled]').count();
ok('sold-out variants are disabled', disabled > 0, `${disabled} disabled`);

// Pick a specific in-stock variant that is NOT the default.
const target = await select.evaluate((s) => {
  const opt = [...s.options].find((o) => !o.disabled && o.value !== s.value);
  return opt ? {value: opt.value, text: opt.text.trim()} : null;
});
ok('a second in-stock variant exists', !!target, target?.text);

await select.selectOption(target.value);
await p.waitForTimeout(500);

const shown = await select.evaluate((s) => s.selectedOptions[0].text.trim());
ok('selector reflects the choice', shown === target.text, shown);

// The black bar's price should track the selected variant.
const barPrice = await card.locator('button[type="submit"] span').first().textContent();
ok('action bar shows a price', /\d/.test(barPrice ?? ''), barPrice?.trim());

await card.locator('button[type="submit"]').click();
await p.waitForTimeout(3200);

const drawer = p.locator('[role="dialog"]');
ok('drawer opens after add', (await drawer.count()) > 0);

const heading = await drawer.locator('h3').first().textContent();
ok('cart count is 1', /CART \(1\)/.test(heading ?? ''), heading?.trim());

// The line must carry the size that was chosen, not the default.
const lineText = (await drawer.locator('li').first().innerText()).replace(/\s+/g, ' ');
const chosenSize = target.text.split('/').pop().trim();
ok(
  'cart line shows the chosen variant',
  lineText.toLowerCase().includes(chosenSize.toLowerCase()),
  `chose "${target.text}" -> line "${lineText.slice(0, 90)}"`,
);

const passed = results.filter((r) => r.pass).length;
console.log(JSON.stringify({
  summary: `${passed}/${results.length} passed`,
  failures: results.filter((r) => !r.pass),
  errors: [...new Set(errors)].slice(0, 5),
}, null, 2));

await b.close();
