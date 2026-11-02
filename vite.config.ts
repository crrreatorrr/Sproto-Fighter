import { defineConfig } from 'vitest/config';

/**
 * Relative base so one build runs at the site root, at the hub's dev path
 * `/play/sproto-fighter/`, and at `https://play.<domain>/sproto-fighter/`.
 * Runtime asset URLs go through a local `asset()` helper (stage.ts, poseAtlas.ts, higgsfieldRig.ts) for the same reason.
 */
export default defineConfig({
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
