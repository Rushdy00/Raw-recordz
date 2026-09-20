/**
 * Contact sheet for candidate campaign frames, plus a mean-luminance reading
 * so the choice is not guesswork: the art direction calls for dark imagery.
 *
 * Usage: node scripts/pick-images.mjs <id> <id> ...
 */
import {chromium} from 'playwright';

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('pass unsplash photo ids');
  process.exit(1);
}

const b = await chromium.launch();
const cols = Math.min(5, ids.length);
const rows = Math.ceil(ids.length / cols);
const p = await b.newPage({viewport: {width: 300 * cols, height: 250 * rows + 40}});

const html = `<body style="margin:0;background:#fff;font:11px Arial;display:grid;grid-template-columns:repeat(${cols},1fr)">
${ids.map((id, i) => `<figure style="margin:0"><img id="i${i}" crossorigin="anonymous"
 src="https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70"
 style="width:100%;height:220px;object-fit:cover;display:block;background:#ddd">
 <figcaption style="padding:4px">${i}: ${id}</figcaption></figure>`).join('')}
</body>`;

await p.setContent(html, {waitUntil: 'networkidle'});
await p.waitForTimeout(3000);

const stats = await p.evaluate((n) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const img = document.getElementById('i' + i);
    if (!img.naturalWidth) { out.push({lum: -1, ok: false}); continue; }
    const c = document.createElement('canvas');
    c.width = 60; c.height = 40;
    const ctx = c.getContext('2d');
    try {
      ctx.drawImage(img, 0, 0, 60, 40);
      const d = ctx.getImageData(0, 0, 60, 40).data;
      let sum = 0;
      for (let k = 0; k < d.length; k += 4) {
        sum += 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2];
      }
      out.push({lum: Math.round(sum / (d.length / 4)), ok: true});
    } catch { out.push({lum: -1, ok: false}); }
  }
  return out;
}, ids.length);

ids.forEach((id, i) =>
  console.log(`${String(i).padStart(2)}  lum=${String(stats[i].lum).padStart(3)}  ${stats[i].ok ? '' : 'FAILED '}${id}`));
await p.screenshot({path: 'shots/candidates.png', fullPage: true});
console.log('-> shots/candidates.png');
await b.close();
