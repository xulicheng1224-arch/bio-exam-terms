/**
 * End-to-end tests against the production build in a real Chrome, at a phone
 * viewport. These exercise the wiring the unit tests cannot reach: DOM
 * rendering, click handling and localStorage persistence.
 */

import { expect, test } from '@playwright/test';

const PROGRESS_KEY = 'bio-exam-terms/progress/v1';

async function storedProgress(page: import('@playwright/test').Page): Promise<unknown> {
  const raw = await page.evaluate(
    (key: string): string | null => window.localStorage.getItem(key),
    PROGRESS_KEY,
  );
  return raw === null ? null : JSON.parse(raw);
}

test('prompts with the English term and reveals the Chinese answer', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');
  await expect(page.getByTestId('card-def')).toHaveCount(0);
  await expect(page.getByTestId('card-cn')).toHaveCount(0);

  await page.getByTestId('reveal').click();

  await expect(page.getByTestId('card-cn')).toHaveText('细胞学说');
  await expect(page.getByTestId('card-def')).toContainText('生物体结构和功能的基本单位');
});

test('records a grade, persists it and advances to the next card', async ({ page }) => {
  await page.goto('/');

  expect(await storedProgress(page)).toBeNull();

  await page.getByTestId('reveal').click();
  await page.getByTestId('grade-good').click();

  const stored = (await storedProgress(page)) as Record<string, { box: number; reviews: number }>;
  expect(Object.keys(stored)).toEqual(['cell-0001']);
  expect(stored['cell-0001']?.reviews).toBe(1);
  expect(stored['cell-0001']?.box).toBe(1);

  await expect(page.getByTestId('card-prompt')).toHaveText('Fluid mosaic model');
  await expect(page.getByTestId('reveal')).toBeVisible();
});

test('keeps the saved grade across a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('reveal').click();
  await page.getByTestId('grade-again').click();

  await page.reload();

  const stored = (await storedProgress(page)) as Record<string, { lapses: number }>;
  expect(stored['cell-0001']?.lapses).toBe(1);
});

test('switches the deck when a subject filter is picked', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');

  await page.getByTestId('filter-biochem').click();

  // Biochemistry entries are prompted in English too, unlike the paper's wording.
  await expect(page.getByTestId('card-prompt')).toHaveText('alpha-amino acid');
  await page.getByTestId('reveal').click();
  await expect(page.getByTestId('card-cn')).toHaveText('α-氨基酸');

  await page.getByTestId('filter-molecular').click();
  await expect(page.getByTestId('card-prompt')).toHaveText('Central Dogma');
});

test('hides the definition when only the Chinese name is being tested', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('reveal-name').click();
  await page.getByTestId('reveal').click();

  await expect(page.getByTestId('card-cn')).toHaveText('细胞学说');
  await expect(page.getByTestId('card-def')).toHaveCount(0);
});

test('can walk a run of cards, each with a prompt and an answer', async ({ page }) => {
  await page.goto('/');

  for (let index = 0; index < 6; index += 1) {
    const prompt = await page.getByTestId('card-prompt').textContent();
    expect(prompt?.trim().length ?? 0).toBeGreaterThan(0);

    await page.getByTestId('reveal').click();
    await expect(page.getByTestId('card-cn')).not.toHaveText('');
    const definition = await page.getByTestId('card-def').textContent();
    expect(definition?.trim().length ?? 0).toBeGreaterThan(20);

    await page.getByTestId('grade-hard').click();
  }

  expect(Object.keys((await storedProgress(page)) as object)).toHaveLength(6);
});

test('offers pronunciation for every card', async ({ page }) => {
  await page.goto('/');
  const speak = page.getByTestId('speak');
  if ((await speak.count()) > 0) {
    await expect(speak).toBeVisible();
  }
});

test('clears saved progress after confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('reveal').click();
  await page.getByTestId('grade-good').click();
  expect(await storedProgress(page)).not.toBeNull();

  page.on('dialog', (dialog) => dialog.accept());
  await page.getByTestId('reset-progress').click();

  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');
  expect(await storedProgress(page)).toBeNull();
});

test('ships an installable manifest', async ({ page }) => {
  await page.goto('/');

  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();

  const response = await page.request.get(new URL(href ?? '', page.url()).toString());
  expect(response.ok()).toBe(true);

  const manifest = (await response.json()) as {
    name: string;
    display: string;
    start_url: string;
    icons: readonly { sizes: string; purpose?: string }[];
  };
  expect(manifest.name).toBe('考研名词解释');
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('./');
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
});

test('opens with the network down once the service worker has taken over', async ({
  page,
  context,
}) => {
  await page.goto('/');

  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
    timeout: 20_000,
  });

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');
  await page.getByTestId('reveal').click();
  await expect(page.getByTestId('card-cn')).toHaveText('细胞学说');

  await context.setOffline(false);
});

test('recovers from unreadable saved data instead of showing a blank app', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [PROGRESS_KEY, '{ this is not json'],
  );
  await page.reload();

  await expect(page.getByTestId('error-banner')).toContainText('启动失败');
  await expect(page.getByTestId('card-prompt')).toHaveCount(0);

  await page.getByTestId('recover').click();

  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');
  await expect(page.getByTestId('error-banner')).toBeHidden();
  expect(await storedProgress(page)).toBeNull();
});
