import {defineConfig} from 'vitest/config';

export default defineConfig({
  base: './',
  test: {include: ['tests/**/*.test.ts'], environment: 'node'},
  optimizeDeps: {entries: ['index.html']},
  server: {
    // The retained art sources, QA evidence and runtime frame library contain
    // tens of thousands of files. Watch application code, not this static
    // archive. Restart Vite after adding public files so its public-file index
    // includes them; reload the page after changing existing sprite assets.
    watch: {ignored: ['**/art/**', '**/docs/**', '**/public/**']},
  },
});
