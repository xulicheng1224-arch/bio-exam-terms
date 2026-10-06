/**
 * End-to-end tests against the production build in a real Chrome, at a phone
 * viewport. These exercise the wiring the unit tests cannot reach: routing,
 * DOM rendering, click handling and localStorage persistence.
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PROGRESS_KEY = 'bio-exam-terms/progress/v1';
const DAILY_LOG_KEY = 'bio-exam-terms/daily-log/v1';
const CUSTOM_TERMS_KEY = 'bio-exam-terms/custom-terms/v1';

async function stored(page: Page, key: string): Promise<unknown> {
  const raw = await page.evaluate((name: string): string | null => window.localStorage.getItem(name), key);
  return raw === null ? null : JSON.parse(raw);
}

/**
 * Learns `count` new terms and returns to the today screen.
 *
 * Navigates by tab rather than "exit session", because finishing the queue also
 * ends the session and would leave nothing to click.
 */
async function learnNewTerms(page: Page, count: number): Promise<void> {
  await page.getByTestId('start-learn').click();
  for (let index = 0; index < count; index += 1) {
    await page.getByTestId('learn-next').click();
  }
  await page.getByTestId('tab-home').click();
}

/** Opens the collapsible import panel in the library. */
async function openImportPanel(page: Page): Promise<void> {
  await page.getByTestId('tab-library').click();
  await page.getByTestId('import-toggle').click();
}

test('opens on today with an untouched plan', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('quota-new')).toHaveText('0 / 20');
  await expect(page.getByTestId('quota-review')).toHaveText('0 / 60');
  await expect(page.getByTestId('start-learn')).toContainText('还有 20 个');
  await expect(page.getByTestId('start-review')).toContainText('今天没有到期的词');
  await expect(page.getByTestId('countdown')).toContainText('还没设置考试日期');
  await expect(page.getByTestId('error-banner')).toBeHidden();
});

test('learning shows the whole answer and counts against the daily quota', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start-learn').click();

  // The learning step is for reading, so the answer is visible immediately.
  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');
  await expect(page.getByTestId('card-cn')).toHaveText('细胞学说');
  await expect(page.getByTestId('card-def')).toContainText('生物体结构和功能的基本单位');

  // Marking a term learned advances to the next card and counts it.
  await page.getByTestId('learn-next').click();
  await expect(page.getByTestId('card-prompt')).toHaveText('Fluid mosaic model');
  await expect(page.getByTestId('quota-new')).toHaveCount(0);

  await page.getByTestId('learn-next').click();
  await page.getByTestId('exit-session').click();
  await expect(page.getByTestId('quota-new')).toHaveText('2 / 20');

  const log = (await stored(page, DAILY_LOG_KEY)) as Record<string, { introduced: number }>;
  expect(Object.values(log)[0]?.introduced).toBe(2);
});

test('a term learned today is due for review straight away', async ({ page }) => {
  await page.goto('/');
  await learnNewTerms(page, 2);

  await expect(page.getByTestId('start-review')).toContainText('开始复习（2 个）');
  await page.getByTestId('start-review').click();

  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');
  await expect(page.getByTestId('card-def')).toHaveCount(0);

  await page.getByTestId('reveal').click();
  await expect(page.getByTestId('card-cn')).toHaveText('细胞学说');
  await page.getByTestId('grade-good').click();

  await expect(page.getByTestId('card-prompt')).toHaveText('Fluid mosaic model');
  await page.getByTestId('exit-session').click();
  await expect(page.getByTestId('quota-review')).toHaveText('1 / 60');

  const progress = (await stored(page, PROGRESS_KEY)) as Record<string, { box: number; reviews: number }>;
  expect(progress['cell-0001']?.reviews).toBe(1);
  expect(progress['cell-0001']?.box).toBe(1);
});

test('the review ceiling stops a backlog from being dumped at once', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('open-settings').click();
  await page.getByTestId('setting-review-per-day').fill('10');
  await page.getByTestId('setting-review-per-day').blur();
  await page.getByTestId('settings-back').click();

  await learnNewTerms(page, 20);
  await expect(page.getByTestId('start-review')).toContainText('开始复习（10 个）');
  await expect(page.getByTestId('quota-review')).toHaveText('0 / 10');
});

test('quiz mode grades a correct pick as known', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start-quiz').click();

  await expect(page.getByTestId('card-prompt')).toHaveText('Cell theory');
  // Four options, drawn from the same subject as the prompt.
  await expect(page.locator('[data-testid^="choice-"]')).toHaveCount(4);

  await page.locator('[data-testid^="choice-"]').filter({ hasText: '细胞学说' }).click();
  await expect(page.getByTestId('quiz-verdict')).toContainText('选对了');

  await page.getByTestId('quiz-next').click();
  await expect(page.getByTestId('card-prompt')).toHaveText('Fluid mosaic model');
});

test('quiz mode marks a wrong pick and returns the term to the queue', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('start-quiz').click();

  const wrong = page.locator('[data-testid^="choice-"]').filter({ hasNotText: '细胞学说' }).first();
  await wrong.click();
  await expect(page.getByTestId('quiz-verdict')).toContainText('选错了');

  await page.getByTestId('quiz-next').click();
  await page.getByTestId('exit-session').click();

  const progress = (await stored(page, PROGRESS_KEY)) as Record<string, { lapses: number; box: number }>;
  expect(progress['cell-0001']?.lapses).toBe(1);
  expect(progress['cell-0001']?.box).toBe(0);
});

test('the subject filter scopes the plan', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('filter-biochem').click();
  await page.getByTestId('start-learn').click();

  await expect(page.getByTestId('card-prompt')).toHaveText('alpha-amino acid');
  await page.getByTestId('exit-session').click();
  await expect(page.getByTestId('start-review')).toContainText('今天没有到期的词');
});

test('the library searches the whole glossary', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('tab-library').click();

  await expect(page.getByTestId('library-count')).toContainText('全库 204 条');

  await page.getByTestId('library-search').fill('Fluid mosaic');
  await expect(page.getByTestId('library-count')).toContainText('匹配 1 条');
  await expect(page.locator('.term-row').first()).toContainText('Fluid mosaic model');
});

test('importing custom terms adds them to the deck', async ({ page }) => {
  await page.goto('/');
  await openImportPanel(page);
  await page.getByTestId('import-text').fill('Aquaporin | 水通道蛋白 | 介导水分子顺浓度梯度跨膜运输的通道蛋白。');
  await page.getByTestId('import-submit').click();

  await expect(page.getByTestId('import-summary')).toContainText('导入 1 条');
  await expect(page.getByTestId('library-count')).toContainText('全库 205 条');

  const custom = (await stored(page, CUSTOM_TERMS_KEY)) as readonly { en: string; subject: string }[];
  expect(custom).toHaveLength(1);
  expect(custom[0]?.en).toBe('Aquaporin');
});

test('a malformed import line is reported with its line number', async ({ page }) => {
  await page.goto('/');
  await openImportPanel(page);
  await page.getByTestId('import-text').fill(
    ['Aquaporin | 水通道蛋白 | 介导水分子跨膜运输。', '这一行只有一列'].join('\n'),
  );
  await page.getByTestId('import-submit').click();

  await expect(page.getByTestId('import-summary')).toContainText('导入 1 条');
  await expect(page.getByTestId('import-summary')).toContainText('失败 1 条');
  await expect(page.getByTestId('import-outcome')).toContainText('第 2 行');
});

test('a term the glossary already covers is refused', async ({ page }) => {
  await page.goto('/');
  await openImportPanel(page);
  await page.getByTestId('import-text').fill('Apoptosis | 细胞凋亡 | 重复词条。');
  await page.getByTestId('import-submit').click();

  await expect(page.getByTestId('import-summary')).toContainText('导入 0 条');
  await expect(page.getByTestId('import-outcome')).toContainText('已存在');
});

test('settings change the daily quota', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('open-settings').click();
  await page.getByTestId('setting-new-per-day').fill('5');
  await page.getByTestId('setting-new-per-day').blur();
  await page.getByTestId('settings-back').click();

  await expect(page.getByTestId('quota-new')).toHaveText('0 / 5');
  await expect(page.getByTestId('start-learn')).toContainText('还有 5 个');
});

test('an exam date produces a countdown', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('open-settings').click();
  await page.getByTestId('setting-exam-date').fill('2030-12-20');
  await page.getByTestId('setting-exam-date').blur();
  await page.getByTestId('settings-back').click();

  await expect(page.getByTestId('countdown')).toContainText('2030-12-20');
  await expect(page.getByTestId('countdown')).toContainText('还有');
});

test('statistics reflect what has been studied', async ({ page }) => {
  await page.goto('/');
  await learnNewTerms(page, 3);
  await page.getByTestId('tab-stats').click();

  await expect(page.getByTestId('stat-overall')).toContainText('已学 3 / 204');
  await expect(page.getByTestId('stat-cell')).toContainText('未学 71');
});

test('progress survives a reload', async ({ page }) => {
  await page.goto('/');
  await learnNewTerms(page, 1);
  await page.reload();

  await expect(page.getByTestId('quota-new')).toHaveText('1 / 20');
  await expect(page.getByTestId('start-learn')).toContainText('还有 19 个');
});

test('clearing progress keeps the glossary', async ({ page }) => {
  await page.goto('/');
  await learnNewTerms(page, 2);

  page.on('dialog', (dialog) => dialog.accept());
  await page.getByTestId('open-settings').click();
  // Clearing progress returns to the today screen on its own.
  await page.getByTestId('reset-progress').click();

  await expect(page.getByTestId('quota-new')).toHaveText('0 / 20');
  expect(await stored(page, PROGRESS_KEY)).toBeNull();
  await page.getByTestId('tab-library').click();
  await expect(page.getByTestId('library-count')).toContainText('全库 204 条');
});

test('ships an installable manifest', async ({ page }) => {
  await page.goto('/');

  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const response = await page.request.get(new URL(href ?? '', page.url()).toString());
  expect(response.ok()).toBe(true);

  const manifest = (await response.json()) as {
    name: string;
    display: string;
    icons: readonly { sizes: string; purpose?: string }[];
  };
  expect(manifest.name).toBe('考研名词解释');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
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

  await expect(page.getByTestId('quota-new')).toHaveText('0 / 20');
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
  await page.getByTestId('recover').click();

  await expect(page.getByTestId('quota-new')).toHaveText('0 / 20');
  expect(await stored(page, PROGRESS_KEY)).toBeNull();
});
