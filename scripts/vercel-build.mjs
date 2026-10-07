/**
 * Builds the storefront for Vercel.
 *
 * Hydrogen targets Shopify Oxygen: its build emits a single worker module
 * (dist/server/index.js) plus static assets (dist/client), which Vercel does
 * not know how to serve. This script runs that build and repackages the result
 * in Vercel's Build Output API layout — the assets as static files and the
 * worker as one Edge Function that handles every other request.
 *
 * Wired up in vercel.json as the build command.
 */
import {execSync} from 'node:child_process';
import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';

const OUT = '.vercel/output';
const FUNC = `${OUT}/functions/_server.func`;

execSync('npx shopify hydrogen build', {stdio: 'inherit'});

await rm(OUT, {recursive: true, force: true});
await mkdir(FUNC, {recursive: true});

await cp('dist/client', `${OUT}/static`, {
  recursive: true,
  filter: (source) => !source.endsWith('.gitkeep'),
});

/*
 * The worker's default export is `{fetch(request, env, ctx)}`; a Vercel Edge
 * Function is `(request, ctx) => Response` and reads its environment from
 * `process.env`. Swap the export for an adapter between the two.
 *
 * PUBLIC_STORE_DOMAIN falls back to mock.shop, the same sample store the
 * Hydrogen CLI injects in development, until a real store is configured.
 */
const worker = await readFile('dist/server/index.js', 'utf8');
const DEFAULT_EXPORT = /export\s*\{\s*([\w$]+)\s+as\s+default\s*\}\s*;?/g;
const matches = [...worker.matchAll(DEFAULT_EXPORT)];

if (matches.length !== 1) {
  throw new Error(
    `Expected one default export in dist/server/index.js, found ${matches.length}.`,
  );
}

const [statement, binding] = matches[0];
const adapter = `
export default function handler(request, context) {
  const env = {PUBLIC_STORE_DOMAIN: 'mock.shop', ...process.env};
  return ${binding}.fetch(request, env, context);
}
`;

await writeFile(
  `${FUNC}/index.js`,
  worker
    .replace(statement, () => adapter)
    .replace(/\/\/# sourceMappingURL=.*$/m, ''),
);

await writeFile(
  `${FUNC}/.vc-config.json`,
  JSON.stringify({runtime: 'edge', entrypoint: 'index.js'}, null, 2),
);

await writeFile(
  `${OUT}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Built assets are content-hashed, so they can be cached forever.
        {
          src: '^/assets/(.*)$',
          headers: {'cache-control': 'public, max-age=31536000, immutable'},
          continue: true,
        },
        {handle: 'filesystem'},
        {src: '/(.*)', dest: '/_server'},
      ],
    },
    null,
    2,
  ),
);

console.log(`Vercel output written to ${OUT}`);
