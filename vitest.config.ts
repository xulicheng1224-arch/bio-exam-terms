import { defineConfig } from 'vitest/config';

// Unit tests live beside the source they cover. The Playwright specs under e2e/
// also match *.spec.ts but belong to the browser runner, so they are excluded.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
