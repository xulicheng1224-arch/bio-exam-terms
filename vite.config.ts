import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Emits one self-contained index.html so the app also runs from a file:// URL on the phone.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    target: 'es2022',
    cssMinify: true,
    reportCompressedSize: false,
    // GitHub Pages can only serve from the repository root or /docs, and the
    // repository root holds the source. Publishing the build to /docs keeps the
    // deployment to a plain `git push` with no CI to debug.
    outDir: 'docs',
  },
});
