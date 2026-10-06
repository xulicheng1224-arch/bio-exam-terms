/**
 * Smoke-checks the deployed site in a real Chrome at a phone viewport.
 *
 * Run after a deploy: an HTTP 200 only proves the file is served, not that the
 * app boots, learns, reviews, persists or opens offline.
 *
 * Usage: node tools/verify_live.mjs [url]
 */

import { chromium, devices } from '@playwright/test';

const URL = process.argv[2] ?? 'https://xulicheng1224-arch.github.io/bio-exam-terms/';
const PROGRESS_KEY = 'bio-exam-terms/progress/v1';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ ...devices['Pixel 7'] });
const page = await context.newPage();

const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(String(error)));

const report = (label, value) => console.log(`${label.padEnd(17)}: ${value}`);
const text = async (testId) => (await page.getByTestId(testId).textContent())?.trim();

const response = await page.goto(URL, { waitUntil: 'load', timeout: 60_000 });
report('http status', response === null ? '(no response)' : response.status());
report('title', await page.title());
report('error banner', (await page.getByTestId('error-banner').isHidden()) ? 'hidden' : 'VISIBLE');
report('countdown', await text('countdown'));
report('new quota', await text('quota-new'));
report('review quota', await text('quota-review'));

await page.getByTestId('tab-library').click();
report('glossary size', await text('library-count'));
await page.getByTestId('tab-home').click();

// Learn one term, then confirm it came back as due for review today.
await page.getByTestId('start-learn').click();
report('learn prompt', await text('card-prompt'));
report('learn answer', await text('card-cn'));
await page.getByTestId('learn-next').click();
await page.getByTestId('tab-home').click();
report('after learning', await text('quota-new'));

await page.getByTestId('start-review').click();
await page.getByTestId('reveal').click();
report('review answer', await text('card-cn'));
await page.getByTestId('grade-good').click();
await page.getByTestId('tab-home').click();

const saved = await page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_KEY);
report('progress saved', saved === null ? 'NO' : 'yes');

const controlled = await page
  .waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 30_000 })
  .then(() => true)
  .catch(() => false);
report('service worker', controlled ? 'controlling the page' : 'NOT controlling');

await context.setOffline(true);
await page.reload({ waitUntil: 'load' });
const offlineQuota = await text('quota-review');
report('offline reload', offlineQuota === undefined ? 'FAILED' : `ok (复习 ${offlineQuota})`);
await context.setOffline(false);

report('page errors', pageErrors.length === 0 ? '(none)' : pageErrors.join(' | '));

await browser.close();
