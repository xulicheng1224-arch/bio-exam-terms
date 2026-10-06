/**
 * Covers the scheduling rules that decide what the learner sees and when.
 * These are the rules a bug would silently corrupt over weeks of study.
 */

import { describe, expect, it } from 'vitest';
import {
  BOX_INTERVALS_DAYS,
  BoxIndexError,
  DAY_MS,
  MAX_BOX,
  applyGrade,
  buildQueue,
  createCardState,
  isDue,
  summariseDue,
} from './srs';
import type { CardState, ProgressStore, Term } from './types';

const NOW = 1_700_000_000_000;

function term(id: string, subject: Term['subject']): Term {
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
    const next = applyGrade(createCardState(NOW), 'good', NOW);
    expect(next.box).toBe(1);
    expect(next.dueAt).toBe(NOW + 1 * DAY_MS);
    expect(next.reviews).toBe(1);
    expect(next.lapses).toBe(0);
  });

  it('drops an unknown card back to box 0 and counts a lapse', () => {
    const mature: CardState = { box: 5, dueAt: NOW, lapses: 1, reviews: 9 };
    const next = applyGrade(mature, 'again', NOW);
    expect(next.box).toBe(0);
    expect(next.dueAt).toBe(NOW);
    expect(next.lapses).toBe(2);
    expect(next.reviews).toBe(10);
  });

  it('demotes one box on a shaky recall', () => {
    const next = applyGrade({ box: 3, dueAt: NOW, lapses: 0, reviews: 4 }, 'hard', NOW);
    expect(next.box).toBe(2);
    expect(next.dueAt).toBe(NOW + 2 * DAY_MS);
  });

  it('never demotes below box 0 on a shaky recall', () => {
    const next = applyGrade({ box: 0, dueAt: NOW, lapses: 0, reviews: 0 }, 'hard', NOW);
    expect(next.box).toBe(0);
  });

  it('caps promotion at the longest interval', () => {
    const next = applyGrade({ box: MAX_BOX, dueAt: NOW, lapses: 0, reviews: 20 }, 'good', NOW);
    expect(next.box).toBe(MAX_BOX);
    expect(next.dueAt).toBe(NOW + 30 * DAY_MS);
  });

  it('does not mutate the input state', () => {
    const original = createCardState(NOW);
    applyGrade(original, 'good', NOW);
    expect(original).toEqual({ box: 0, dueAt: NOW, lapses: 0, reviews: 0 });
  });

  it('rejects a box index outside the interval table', () => {
    expect(() => applyGrade({ box: MAX_BOX + 1, dueAt: NOW, lapses: 0, reviews: 0 }, 'good', NOW)).toThrow(
      BoxIndexError,
    );
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

describe('buildQueue', () => {
  const terms: readonly Term[] = [term('cell-1', 'cell'), term('mol-1', 'molecular')];

  it('puts unseen cards ahead of cards scheduled for the future', () => {
    const store: ProgressStore = {
      'cell-1': { box: 3, dueAt: NOW + 3 * DAY_MS, lapses: 0, reviews: 4 },
    };
    const queue = buildQueue(terms, store, NOW, { subject: 'all', dueOnly: false, limit: 50 });
    expect(queue.map((entry) => entry.id)).toEqual(['mol-1', 'cell-1']);
  });

  it('honours the subject filter', () => {
    const queue = buildQueue(terms, {}, NOW, { subject: 'molecular', dueOnly: false, limit: 50 });
    expect(queue.map((entry) => entry.id)).toEqual(['mol-1']);
  });

  it('excludes cards that are not yet due when dueOnly is set', () => {
    const store: ProgressStore = {
      'cell-1': { box: 3, dueAt: NOW + 3 * DAY_MS, lapses: 0, reviews: 4 },
    };
    const queue = buildQueue(terms, store, NOW, { subject: 'all', dueOnly: true, limit: 50 });
    expect(queue.map((entry) => entry.id)).toEqual(['mol-1']);
  });

  it('truncates to the limit', () => {
    const queue = buildQueue(terms, {}, NOW, { subject: 'all', dueOnly: false, limit: 1 });
    expect(queue).toHaveLength(1);
  });
});

describe('summariseDue', () => {
  it('counts per subject and in total', () => {
    const terms: readonly Term[] = [
      term('cell-1', 'cell'),
      term('cell-2', 'cell'),
      term('mol-1', 'molecular'),
    ];
    const store: ProgressStore = {
      'cell-1': { box: 2, dueAt: NOW + 5 * DAY_MS, lapses: 0, reviews: 3 },
    };
    const summary = summariseDue(terms, store, NOW);
    expect(summary.total).toBe(2);
    expect(summary.bySubject.cell).toBe(1);
    expect(summary.bySubject.molecular).toBe(1);
    expect(summary.bySubject.biochem).toBe(0);
  });
});
