/**
 * Leitner-box spaced repetition.
 *
 * Every function here is pure: it returns new values and never mutates its
 * arguments or any global state.
 */

import type { CardState, Grade, ProgressStore, Subject, Term } from './types';

export const DAY_MS: number = 86_400_000;

/** Review intervals in days, indexed by box. Box 0 means "show again today". */
export const BOX_INTERVALS_DAYS: readonly number[] = [0, 1, 2, 4, 7, 15, 30];

export const MAX_BOX: number = BOX_INTERVALS_DAYS.length - 1;

/** Raised when a stored box index falls outside the interval table. */
export class BoxIndexError extends Error {
  readonly box: number;
  readonly maxBox: number;

  constructor(box: number, maxBox: number) {
    super(`box index ${box} is outside the valid range 0..${maxBox}`);
    this.name = 'BoxIndexError';
    this.box = box;
    this.maxBox = maxBox;
  }
}

/** A term the learner has never graded, due immediately. */
export function createCardState(now: number): CardState {
  return { box: 0, dueAt: now, lapses: 0, reviews: 0 };
}

function intervalDaysForBox(box: number): number {
  const interval = BOX_INTERVALS_DAYS[box];
  if (interval === undefined) {
    throw new BoxIndexError(box, MAX_BOX);
  }
  return interval;
}

function nextBox(currentBox: number, grade: Grade): number {
  if (grade === 'again') {
    return 0;
  }
  if (grade === 'hard') {
    return Math.max(0, currentBox - 1);
  }
  return Math.min(MAX_BOX, currentBox + 1);
}

/**
 * Folds one self-reported grade into a card's schedule.
 *
 * The incoming box is validated rather than clamped: a box outside the interval
 * table means the stored state is corrupt, and silently repairing it would hide
 * the corruption instead of surfacing it.
 */
export function applyGrade(state: CardState, grade: Grade, now: number): CardState {
  if (!Number.isInteger(state.box) || state.box < 0 || state.box > MAX_BOX) {
    throw new BoxIndexError(state.box, MAX_BOX);
  }
  const box = nextBox(state.box, grade);
  return {
    box,
    dueAt: now + intervalDaysForBox(box) * DAY_MS,
    lapses: grade === 'again' ? state.lapses + 1 : state.lapses,
    reviews: state.reviews + 1,
  };
}

export function isDue(state: CardState, now: number): boolean {
  return state.dueAt <= now;
}

/** Looks up a card's schedule, treating an unknown id as a brand-new card. */
export function readCardState(store: ProgressStore, termId: string, now: number): CardState {
  const existing = store[termId];
  return existing === undefined ? createCardState(now) : existing;
}

/** Which terms the deck should cover. */
export interface DeckFilter {
  readonly subject: Subject | 'all';
  readonly dueOnly: boolean;
  readonly limit: number;
}

function matchesSubject(term: Term, filter: DeckFilter): boolean {
  return filter.subject === 'all' || term.subject === filter.subject;
}

/**
 * Selects the review queue: most overdue first, then least-reviewed first so
 * unseen terms are interleaved rather than dumped in file order.
 */
export function buildQueue(
  terms: readonly Term[],
  store: ProgressStore,
  now: number,
  filter: DeckFilter,
): readonly Term[] {
  const candidates = terms
    .filter((term: Term): boolean => matchesSubject(term, filter))
    .map((term: Term) => ({ term, state: readCardState(store, term.id, now) }))
    .filter((entry) => (filter.dueOnly ? isDue(entry.state, now) : true))
    .sort(
      (left, right) =>
        left.state.dueAt - right.state.dueAt || left.state.reviews - right.state.reviews,
    );
  return candidates.slice(0, filter.limit).map((entry) => entry.term);
}

/** How many terms are due, per subject plus a total. Used by the stats header. */
export interface DueSummary {
  readonly total: number;
  readonly bySubject: Readonly<Record<Subject, number>>;
}

export function summariseDue(
  terms: readonly Term[],
  store: ProgressStore,
  now: number,
): DueSummary {
  const bySubject: Record<Subject, number> = { cell: 0, molecular: 0, biochem: 0 };
  let total = 0;
  for (const term of terms) {
    if (isDue(readCardState(store, term.id, now), now)) {
      total += 1;
      bySubject[term.subject] += 1;
    }
  }
  return { total, bySubject };
}
