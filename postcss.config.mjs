/**
 * Tailwind v4 runs through PostCSS rather than `@tailwindcss/vite`.
 *
 * The Vite plugin discovers source files by walking Vite's module graph, which
 * does not see the app's components under Hydrogen's worker SSR environment —
 * utilities used only in .tsx files were silently dropped. The PostCSS plugin
 * uses the `@source` globs declared in app/styles/tailwind.css instead, which
 * resolves correctly here.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
