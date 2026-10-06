import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Drives the locally installed Chrome instead of downloading Chromium, and runs
// the production build so the test exercises exactly what ships to the phone.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
  ],
  // Builds and serves in one step. The build must stay inside the webServer
  // command: serving a stale dist/ makes these tests silently meaningless.
  webServer: {
    command: 'npm run e2e:serve',
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
