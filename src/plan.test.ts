import { describe, expect, it } from 'vitest';
import { buildDailyPlan, countersFor, withIntroduced, withReviewed } from './plan';
import { DAY_MS } from './srs';
import type { DailyLog, ProgressStore, Settings, Subject, Term } from './types';

/** 2026-10-07 10:00 local. */
const NOW = new Date(2026, 9, 7, 10, 0, 0).getTime();
const YESTERDAY = NOW - DAY_MS;

function term(id: string, subject: Subject): Term {
  return { id, subject, en: id, cn: id, defCn: id, topic: 't', note: '' };
}

const TERMS: readonly Term[] = [
  term('cell-1', 'cell'),
  term('cell-2', 'cell'),
  term('cell-3', 'cell'),
  term('mol-1', 'molecular'),
  term('mol-2', 'molecular'),
];

function settingsWith(newPerDay: number, reviewPerDay: number, subject: Subject | 'all'): Settings {
  return { revealMode: 'both', subject, newPerDay, reviewPerDay, examDate: '' };
}

describe('buildDailyPlan', () => {
  it('offers only as many new terms as the daily quota allows', () => {
    const plan = buildDailyPlan(TERMS, {}, {}, settingsWith(2, 60, 'all'), NOW);
    expect(plan.newTerms.map((entry) => entry.id)).toEqual(['cell-1', 'cell-2']);
    expect(plan.newQuotaLeft).toBe(2);
  });

  it('subtracts what was already introduced today', () => {
    const log: DailyLog = { '2026-10-07': { introduced: 1, reviewed: 0 } };
    const plan = buildDailyPlan(TERMS, {}, log, settingsWith(2, 60, 'all'), NOW);
    expect(plan.newTerms.map((entry) => entry.id)).toEqual(['cell-1']);
    expect(plan.newQuotaLeft).toBe(1);
  });

  it('stops offering new terms once the quota is used up', () => {
    const log: DailyLog = { '2026-10-07': { introduced: 2, reviewed: 0 } };
    const plan = buildDailyPlan(TERMS, {}, log, settingsWith(2, 60, 'all'), NOW);
    expect(plan.newTerms).toEqual([]);
    expect(plan.newQuotaLeft).toBe(0);
  });

  it('leaves the previous day counters behind', () => {
    const log: DailyLog = { '2026-10-06': { introduced: 5, reviewed: 50 } };
    const plan = buildDailyPlan(TERMS, {}, log, settingsWith(2, 60, 'all'), NOW);
    expect(plan.newTerms).toHaveLength(2);
    expect(plan.counters).toEqual({ introduced: 0, reviewed: 0 });
  });

  it('caps the review queue but still reports everything that is due', () => {
    const progress: ProgressStore = {
      'cell-1': { box: 1, dueAt: NOW - 5 * DAY_MS, lapses: 0, reviews: 1 },
      'cell-2': { box: 1, dueAt: NOW - 4 * DAY_MS, lapses: 0, reviews: 1 },
      'cell-3': { box: 1, dueAt: NOW - 3 * DAY_MS, lapses: 0, reviews: 1 },
      'mol-1': { box: 1, dueAt: NOW - 2 * DAY_MS, lapses: 0, reviews: 1 },
    };
    const plan = buildDailyPlan(TERMS, progress, {}, settingsWith(20, 2, 'all'), NOW);
    expect(plan.reviewTerms).toHaveLength(2);
    expect(plan.dueNow).toBe(4);
    expect(plan.reviewQuotaLeft).toBe(2);
  });

  it('reports how many days the oldest overdue term has slipped', () => {
    const progress: ProgressStore = {
      'cell-1': { box: 1, dueAt: NOW - 5 * DAY_MS, lapses: 0, reviews: 1 },
    };
    const plan = buildDailyPlan(TERMS, progress, {}, settingsWith(20, 60, 'all'), NOW);
    expect(plan.backlogDays).toBe(5);
  });

  it('reports no backlog when nothing is overdue', () => {
    const progress: ProgressStore = {
      'cell-1': { box: 1, dueAt: NOW + DAY_MS, lapses: 0, reviews: 1 },
    };
    expect(buildDailyPlan(TERMS, progress, {}, settingsWith(20, 60, 'all'), NOW).backlogDays).toBe(0);
  });

  it('scopes new terms, reviews and mistakes to the chosen subject', () => {
    const progress: ProgressStore = {
      'cell-1': { box: 1, dueAt: NOW - DAY_MS, lapses: 2, reviews: 3 },
      'mol-1': { box: 1, dueAt: NOW - DAY_MS, lapses: 2, reviews: 3 },
    };
    const plan = buildDailyPlan(TERMS, progress, {}, settingsWith(20, 60, 'molecular'), NOW);
    expect(plan.newTerms.map((entry) => entry.id)).toEqual(['mol-2']);
    expect(plan.reviewTerms.map((entry) => entry.id)).toEqual(['mol-1']);
    expect(plan.mistakes.map((entry) => entry.id)).toEqual(['mol-1']);
  });
});

describe('daily counters', () => {
  it('increments only the counter that was recorded', () => {
    const afterIntroduced = withIntroduced({}, NOW);
    expect(countersFor(afterIntroduced, NOW)).toEqual({ introduced: 1, reviewed: 0 });
    const afterReviewed = withReviewed(afterIntroduced, NOW);
    expect(countersFor(afterReviewed, NOW)).toEqual({ introduced: 1, reviewed: 1 });
  });

  it('keys counters by local day', () => {
    const log = withReviewed({}, NOW);
    expect(countersFor(log, YESTERDAY)).toEqual({ introduced: 0, reviewed: 0 });
  });

  it('does not mutate the log it was given', () => {
    const original: DailyLog = {};
    withIntroduced(original, NOW);
    expect(original).toEqual({});
  });
});
