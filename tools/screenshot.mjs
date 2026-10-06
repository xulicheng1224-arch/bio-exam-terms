/**
 * Captures screenshots of the running preview for visual review.
 *
 * Usage: node tools/screenshot.mjs   (with `vite preview` already serving :4173)
 */

import { mkdirSync } from 'node:fs';
import { chromium, devices } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:4173';
const OUT_DIR = 'screenshots';

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ ...devices['Pixel 7'] });
const page = await context.newPage();

const shot = (name) => page.screenshot({ path: `${OUT_DIR}/${name}.png` });

await page.goto(BASE_URL);
await shot('01-today');

await page.getByTestId('start-learn').click();
await shot('02-learn');
await page.getByTestId('tab-home').click();

await page.getByTestId('start-learn').click();
for (let index = 0; index < 3; index += 1) {
  await page.getByTestId('learn-next').click();
}
await page.getByTestId('tab-home').click();
await shot('03-today-with-progress');

await page.getByTestId('start-review').click();
await page.getByTestId('reveal').click();
await shot('04-review');

await page.getByTestId('tab-home').click();
await page.getByTestId('start-quiz').click();
await shot('05-quiz');
await page.getByTestId('tab-home').click();

await page.getByTestId('tab-library').click();
await shot('06-library');

await page.getByTestId('tab-stats').click();
await shot('07-stats');

await page.getByTestId('tab-home').click();
await page.getByTestId('open-settings').click();
await shot('08-settings');

await browser.close();
console.log(`screenshots written to ${OUT_DIR}/`);
