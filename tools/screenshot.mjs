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

await page.goto(BASE_URL);
await page.screenshot({ path: `${OUT_DIR}/01-prompt.png` });

await page.getByTestId('reveal').click();
await page.screenshot({ path: `${OUT_DIR}/02-revealed.png`, fullPage: true });

await page.getByTestId('grade-good').click();
await page.getByTestId('filter-biochem').click();
await page.getByTestId('reveal').click();
await page.screenshot({ path: `${OUT_DIR}/03-biochem.png`, fullPage: true });

await browser.close();
console.log(`screenshots written to ${OUT_DIR}/`);
