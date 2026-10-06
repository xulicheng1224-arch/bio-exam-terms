/**
 * Covers the scheduling rules that decide what the learner sees and when.
 * These are the rules a bug would silently corrupt over weeks of study.
 */

import { describe, expect, it } from 'vitest';
import {
  BOX_INTERVALS_DAYS,
  BoxIndexError,
  DAY_MS,
  InvalidDateError,
  MAX_BOX,
  applyGrade,
  createCardState,
  dayKey,
  daysUntil,
  dueTerms,
  examIntervalCapDays,
  isDue,
  isIntroduced,
  mistakeTerms,
  startOfDay,
  unintroducedTerms,
} from './srs';
import type { CardState, ProgressStore, Subject, Term } from './types';

/** 2026-10-07 10:30 local, so date arithmetic is timezone-stable in tests. */
const NOW = new Date(2026, 9, 7, 10, 30, 0).getTime();

function term(id: string, subject: Subject): Term {
  return { id, subject, en: id, cn: id, defCn: id, topic: 't', note: '' };
}

describe('createCardState', () => {
  it('starts at box 0 and is due immediately', () => {
    const state = createCardState(NOW);
    expect(state).toEqual({ box: 0, dueAt: NOW, lapses: 0, reviews: 0 });
    expect(isDue(state, NOW)).toBe(true);
  });
});

describe('applyGrade', () => {
  it('promotes a known card one box and schedules the next interval', () => {
    const next = applyGrade(createCardState(NOW), 'good', NOW, null);
    expect(next.box).toBe(1);
    expect(next.dueAt).toBe(NOW + DAY_MS);
    expect(next.reviews).toBe(1);
    expect(next.lapses).toBe(0);
  });

  it('drops an unknown card back to box 0 and counts a lapse', () => {
    const next = applyGrade({ box: 5, dueAt: NOW, lapses: 1, reviews: 9 }, 'again', NOW, null);
    expect(next.box).toBe(0);
    expect(next.dueAt).toBe(NOW);
    expect(next.lapses).toBe(2);
    expect(next.reviews).toBe(10);
  });

  it('demotes one box on a shaky recall, never below 0', () => {
    expect(applyGrade({ box: 3, dueAt: NOW, lapses: 0, reviews: 4 }, 'hard', NOW, null).box).toBe(2);
    expect(applyGrade({ box: 0, dueAt: NOW, lapses: 0, reviews: 0 }, 'hard', NOW, null).box).toBe(0);
  });

  it('caps promotion at the longest interval', () => {
    const next = applyGrade({ box: MAX_BOX, dueAt: NOW, lapses: 0, reviews: 20 }, 'good', NOW, null);
    expect(next.box).toBe(MAX_BOX);
    expect(next.dueAt).toBe(NOW + 30 * DAY_MS);
  });

  it('compresses the interval when the exam is close', () => {
    const next = applyGrade(createCardState(NOW), 'good', NOW, 4);
    expect(next.box).toBe(1);
    expect(next.dueAt).toBe(NOW + DAY_MS);
    const long = applyGrade({ box: 6, dueAt: NOW, lapses: 0, reviews: 20 }, 'hard', NOW, 3);
    expect(long.dueAt).toBe(NOW + 3 * DAY_MS);
  });

  it('does not mutate the input state', () => {
    const original = createCardState(NOW);
    applyGrade(original, 'good', NOW, null);
    expect(original).toEqual({ box: 0, dueAt: NOW, lapses: 0, reviews: 0 });
  });

  it('rejects a corrupt box index instead of clamping it', () => {
    const corrupt: CardState = { box: MAX_BOX + 1, dueAt: NOW, lapses: 0, reviews: 0 };
    expect(() => applyGrade(corrupt, 'good', NOW, null)).toThrow(BoxIndexError);
  });

  it('keeps every interval in ascending order', () => {
    for (let index = 1; index < BOX_INTERVALS_DAYS.length; index += 1) {
      const previous = BOX_INTERVALS_DAYS[index - 1];
      const current = BOX_INTERVALS_DAYS[index];
      expect(previous).toBeDefined();
      expect(current).toBeDefined();
      expect(current as number).toBeGreaterThan(previous as number);
    }
  });
});

describe('dates', () => {
  it('keys a day by local calendar date', () => {
    expect(dayKey(NOW)).toBe('2026-10-07');
  });

  it('truncates to local midnight', () => {
    expect(dayKey(startOfDay(NOW))).toBe('2026-10-07');
  });

  it('counts whole calendar days to the exam', () => {
    expect(daysUntil('2026-10-07', NOW)).toBe(0);
    expect(daysUntil('2026-10-27', NOW)).toBe(20);
    expect(daysUntil('2026-10-01', NOW)).toBe(-6);
  });

  it('rejects a date that is not a real calendar day', () => {
    expect(() => daysUntil('2026-02-30', NOW)).toThrow(InvalidDateError);
    expect(() => daysUntil('not-a-date', NOW)).toThrow(InvalidDateError);
  });
});

describe('examIntervalCapDays', () => {
  it('does not cap when no exam date is set', () => {
    expect(examIntervalCapDays('', NOW)).toBeNull();
  });

  it('does not cap when the exam is far away', () => {
    expect(examIntervalCapDays('2027-12-01', NOW)).toBeNull();
  });

  it('caps so roughly five reviews remain before the exam', () => {
    expect(examIntervalCapDays('2026-10-27', NOW)).toBe(4);
  });

  it('caps to one day once the exam has arrived', () => {
    expect(examIntervalCapDays('2026-10-01', NOW)).toBe(1);
    expect(examIntervalCapDays('2026-10-07', NOW)).toBe(1);
  });
});

describe('deck selection', () => {
  const terms: readonly Term[] = [term('cell-1', 'cell'), term('cell-2', 'cell'), term('mol-1', 'molecular')];

  it('treats a term with no record as not yet introduced', () => {
    const store: ProgressStore = { 'cell-1': createCardState(NOW) };
    expect(isIntroduced(store, 'cell-1')).toBe(true);
    expect(isIntroduced(store, 'cell-2')).toBe(false);
    expect(unintroducedTerms(terms, store, 'all').map((entry) => entry.id)).toEqual([
      'cell-2',
      'mol-1',
    ]);
  });

  it('returns due terms oldest first and skips ones still in the future', () => {
    const store: ProgressStore = {
      'cell-1': { box: 1, dueAt: NOW - 2 * DAY_MS, lapses: 0, reviews: 1 },
      'cell-2': { box: 1, dueAt: NOW + 3 * DAY_MS, lapses: 0, reviews: 1 },
      'mol-1': { box: 1, dueAt: NOW - DAY_MS, lapses: 0, reviews: 1 },
    };
    expect(dueTerms(terms, store, NOW, 'all').map((entry) => entry.id)).toEqual(['cell-1', 'mol-1']);
  });

  it('honours the subject scope', () => {
    const store: ProgressStore = {
      'cell-1': createCardState(NOW),
      'mol-1': createCardState(NOW),
    };
    expect(dueTerms(terms, store, NOW, 'cell').map((entry) => entry.id)).toEqual(['cell-1']);
  });

  it('lists lapsed terms by how often they were missed, excluding mastered ones', () => {
    const store: ProgressStore = {
      'cell-1': { box: 1, dueAt: NOW, lapses: 3, reviews: 5 },
      'cell-2': { box: 2, dueAt: NOW, lapses: 1, reviews: 5 },
      'mol-1': { box: MAX_BOX, dueAt: NOW, lapses: 9, reviews: 20 },
    };
    expect(mistakeTerms(terms, store, 'all').map((entry) => entry.id)).toEqual(['cell-1', 'cell-2']);
  });
});
