import {defineConfig} from 'vite';

export default defineConfig({
  optimizeDeps: {entries: ['index.html']},
  server: {
    // The retained art sources, QA evidence and runtime frame library contain
    // tens of thousands of files. Watch application code, not this static
    // archive. Reload the page explicitly after installing new sprite assets.
    watch: {ignored: ['**/art/**', '**/docs/**', '**/public/**']},
  },
});
