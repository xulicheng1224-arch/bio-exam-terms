/**
 * Smoke-checks the deployed site in a real Chrome at a phone viewport.
 *
 * Run after a deploy: an HTTP 200 only proves the file is served, not that the
 * app boots, grades, persists or opens offline.
 *
 * Usage: node tools/verify_live.mjs [url]
 */

import { chromium, devices } from '@playwright/test';

const URL = process.argv[2] ?? 'https://xulicheng1224-arch.github.io/bio-exam-terms/';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ ...devices['Pixel 7'] });
const page = await context.newPage();

const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error)));

const report = (label, value) => console.log(`${label.padEnd(16)}: ${value}`);

const response = await page.goto(URL, { waitUntil: 'load', timeout: 60_000 });
report('http status', response === null ? '(no response)' : response.status());
report('title', await page.title());
report('error banner', (await page.getByTestId('error-banner').isHidden()) ? 'hidden' : 'VISIBLE');
report('deck counters', (await page.locator('.header__counters').textContent())?.trim());

const firstPrompt = await page.getByTestId('card-prompt').textContent();
report('first prompt', firstPrompt);

await page.getByTestId('reveal').click();
report('chinese name', await page.getByTestId('card-cn').textContent());
const definition = await page.getByTestId('card-def').textContent();
report('definition', `${(definition ?? '').slice(0, 36)}...`);

await page.getByTestId('grade-good').click();
const stored = await page.evaluate(() => window.localStorage.getItem('bio-exam-terms/progress/v1'));
report('progress saved', stored === null ? 'NO' : 'yes');

const controlled = await page
  .waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 30_000 })
  .then(() => true)
  .catch(() => false);
report('service worker', controlled ? 'controlling the page' : 'NOT controlling');

await context.setOffline(true);
await page.reload({ waitUntil: 'load' });
const offlinePrompt = await page.getByTestId('card-prompt').textContent();
report('offline reload', offlinePrompt === null ? 'FAILED' : `ok ("${offlinePrompt}")`);
await context.setOffline(false);

report('page errors', pageErrors.length === 0 ? '(none)' : pageErrors.join(' | '));

await browser.close();
